-- Senhas definidas pelo admin, sem e-mail, e corte instantâneo de sessões.
--
-- Contexto: o painel deixou de usar e-mail (convite, "esqueci minha senha").
-- O admin cria o usuário já com senha e é quem redefine senhas. Ao redefinir
-- (ou desativar), todas as sessões do usuário caem na hora.
--
-- Como o corte funciona sem depender do schema auth:
--   profiles.sessions_valid_after marca o instante do corte. Todo JWT do
--   Supabase traz em `amr` o horário do login que originou a sessão, e esse
--   horário se mantém nos refreshes. Um token cujo login é anterior ao corte é
--   recusado por is_staff()/is_admin() (RLS) e por my_access() (middleware).
--   O próximo login gera um `amr` novo e passa.
--
-- Idempotente; aplicar depois de 20261116000000_user_roles.sql.

-- ---------------------------------------------------------------------------
-- 1. Novos eventos de auditoria (os antigos ficam para o histórico existente)
-- ---------------------------------------------------------------------------
ALTER TYPE public.user_management_action ADD VALUE IF NOT EXISTS 'created';
ALTER TYPE public.user_management_action ADD VALUE IF NOT EXISTS 'password_set';

-- ---------------------------------------------------------------------------
-- 2. Corte de sessões
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sessions_valid_after timestamptz;

-- Fora do grant de UPDATE de authenticated (que segue só full_name, updated_at).
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (full_name, updated_at) ON public.profiles TO authenticated;

-- Horário (epoch) do login que originou a sessão do token atual. NULL se o
-- token não tiver `amr` -- e NULL nunca passa no corte.
CREATE OR REPLACE FUNCTION public.current_session_auth_time()
RETURNS bigint
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT max((entry ->> 'timestamp')::bigint)
  FROM jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) AS entry;
$$;

-- ---------------------------------------------------------------------------
-- 3. Gates com o corte de sessão
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND deactivated_at IS NULL
      AND (
        sessions_valid_after IS NULL
        OR public.current_session_auth_time() >= extract(epoch FROM sessions_valid_after)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
      AND deactivated_at IS NULL
      AND (
        sessions_valid_after IS NULL
        OR public.current_session_auth_time() >= extract(epoch FROM sessions_valid_after)
      )
  );
$$;

-- Acesso do próprio chamador, numa consulta só, para middleware e login.
-- Não autoriza nada por si: as policies continuam usando is_staff/is_admin.
CREATE OR REPLACE FUNCTION public.my_access()
RETURNS TABLE (role text, active boolean, session_current boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    p.role,
    p.deactivated_at IS NULL,
    p.sessions_valid_after IS NULL
      OR coalesce(public.current_session_auth_time() >= extract(epoch FROM p.sessions_valid_after), false)
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.my_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_access() TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Corte de sessões pelo admin (após redefinir senha ou desativar)
--    date_trunc: o `amr` tem resolução de segundos; truncar garante que um
--    login no mesmo segundo do corte seja aceito.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_revoke_sessions(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Somente administradores podem gerenciar usuários.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  UPDATE public.profiles
  SET sessions_valid_after = date_trunc('second', now()),
      updated_at = now()
  WHERE id = target_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil não encontrado.' USING ERRCODE = 'no_data_found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_revoke_sessions(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_revoke_sessions(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. Desativar também corta as sessões, na mesma escrita: assim uma
--    reativação posterior não "ressuscita" tokens antigos.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  target_id uuid,
  new_full_name text DEFAULT NULL,
  new_role text DEFAULT NULL,
  set_deactivated boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Somente administradores podem gerenciar usuários.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF new_role IS NOT NULL AND new_role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Papel inválido.' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF new_full_name IS NOT NULL AND length(btrim(new_full_name)) NOT BETWEEN 2 AND 100 THEN
    RAISE EXCEPTION 'Nome inválido.' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  UPDATE public.profiles
  SET
    full_name = COALESCE(btrim(new_full_name), full_name),
    role = COALESCE(new_role, role),
    deactivated_at = CASE
      WHEN set_deactivated IS NULL THEN deactivated_at
      WHEN set_deactivated THEN COALESCE(deactivated_at, now())
      ELSE NULL
    END,
    sessions_valid_after = CASE
      WHEN set_deactivated IS TRUE THEN date_trunc('second', now())
      ELSE sessions_valid_after
    END,
    updated_at = now()
  WHERE id = target_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil não encontrado.' USING ERRCODE = 'no_data_found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_profile(uuid, text, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_profile(uuid, text, text, boolean) TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. A trava de escalonamento passa a cobrir sessions_valid_after
--    (um usuário comum não pode "desfazer" o próprio corte).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.role IS DISTINCT FROM OLD.role
      OR NEW.deactivated_at IS DISTINCT FROM OLD.deactivated_at
      OR NEW.sessions_valid_after IS DISTINCT FROM OLD.sessions_valid_after)
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Somente administradores podem alterar papel ou status de usuários.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;
