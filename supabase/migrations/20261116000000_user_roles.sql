-- Papéis de usuário: admin + editor, desativação de contas e log de auditoria.
--
-- Modelo:
--   admin  -> tudo, inclusive gerenciar usuários (profiles + auditoria).
--   editor -> tudo no conteúdo (imóveis, cidades, bairros, características,
--             mídia, storage), nada em usuários.
--
--   public.is_staff()  gate de toda escrita de conteúdo (admin OU editor ativo).
--   public.is_admin()  gate de profiles e do log de auditoria (admin ativo).
--
-- Uma conta desativada (profiles.deactivated_at preenchido) deixa de passar
-- nos dois gates no próximo comando, mesmo com um JWT ainda válido. O banimento
-- no Auth (feito pela aplicação) impede o refresh da sessão e novos logins.
--
-- Idempotente: pode ser aplicada em um banco já em produção.

-- ---------------------------------------------------------------------------
-- 1. profiles: novo papel e coluna de desativação
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'editor'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deactivated_at timestamptz;

-- O grant de UPDATE por coluna (20260811000000) continua sendo só
-- (full_name, updated_at): nem `role` nem `deactivated_at` são graváveis por
-- anon/authenticated via PostgREST. Reafirmado aqui por defesa em profundidade.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (full_name, updated_at) ON public.profiles TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Gates de autorização
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
  );
$$;

REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. Policies de conteúdo: is_admin() -> is_staff()
--    Recriadas com WITH CHECK explícito (antes só havia USING).
--    As policies de profiles continuam em is_admin().
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage property types" ON public.property_types;
DROP POLICY IF EXISTS "Staff can manage property types" ON public.property_types;
CREATE POLICY "Staff can manage property types" ON public.property_types FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins can manage cities" ON public.cities;
DROP POLICY IF EXISTS "Staff can manage cities" ON public.cities;
CREATE POLICY "Staff can manage cities" ON public.cities FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins can manage neighborhoods" ON public.neighborhoods;
DROP POLICY IF EXISTS "Staff can manage neighborhoods" ON public.neighborhoods;
CREATE POLICY "Staff can manage neighborhoods" ON public.neighborhoods FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins can manage features" ON public.features;
DROP POLICY IF EXISTS "Staff can manage features" ON public.features;
CREATE POLICY "Staff can manage features" ON public.features FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins can manage properties" ON public.properties;
DROP POLICY IF EXISTS "Staff can manage properties" ON public.properties;
CREATE POLICY "Staff can manage properties" ON public.properties FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins can manage property features" ON public.property_features;
DROP POLICY IF EXISTS "Staff can manage property features" ON public.property_features;
CREATE POLICY "Staff can manage property features" ON public.property_features FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admins can manage property media" ON public.property_media;
DROP POLICY IF EXISTS "Staff can manage property media" ON public.property_media;
CREATE POLICY "Staff can manage property media" ON public.property_media FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Storage
DROP POLICY IF EXISTS "Admins can upload property storage" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload property storage" ON storage.objects;
CREATE POLICY "Staff can upload property storage"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('property-images', 'property-floorplans')
  AND public.is_staff()
);

DROP POLICY IF EXISTS "Admins can update property storage" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update property storage" ON storage.objects;
CREATE POLICY "Staff can update property storage"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('property-images', 'property-floorplans')
  AND public.is_staff()
)
WITH CHECK (
  bucket_id IN ('property-images', 'property-floorplans')
  AND public.is_staff()
);

DROP POLICY IF EXISTS "Admins can delete property storage" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete property storage" ON storage.objects;
CREATE POLICY "Staff can delete property storage"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('property-images', 'property-floorplans')
  AND public.is_staff()
);

-- ---------------------------------------------------------------------------
-- 4. Trava de escalonamento estendida a deactivated_at
--    auth.uid() é NULL para service_role e SQL Editor (caminhos confiáveis).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.role IS DISTINCT FROM OLD.role
      OR NEW.deactivated_at IS DISTINCT FROM OLD.deactivated_at)
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Somente administradores podem alterar papel ou status de usuários.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_role_change ON public.profiles;
CREATE TRIGGER enforce_profile_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ---------------------------------------------------------------------------
-- 5. Invariante: sempre existe ao menos um administrador ativo.
--    Vale para QUALQUER caminho, inclusive service_role e o DELETE em cascata
--    disparado por auth.admin.deleteUser. O advisory lock serializa mudanças
--    concorrentes (dois admins rebaixando um ao outro ao mesmo tempo): a
--    segunda transação espera o commit da primeira e, em READ COMMITTED, a
--    contagem seguinte já enxerga o resultado.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_last_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  remaining integer;
BEGIN
  IF OLD.role = 'admin'
     AND OLD.deactivated_at IS NULL
     AND (
       TG_OP = 'DELETE'
       OR NEW.role IS DISTINCT FROM 'admin'
       OR NEW.deactivated_at IS NOT NULL
     ) THEN
    PERFORM pg_advisory_xact_lock(hashtext('public.profiles:last_admin'));

    SELECT count(*) INTO remaining
    FROM public.profiles
    WHERE role = 'admin'
      AND deactivated_at IS NULL
      AND id <> OLD.id;

    IF remaining = 0 THEN
      RAISE EXCEPTION 'Não é possível remover, rebaixar ou desativar o último administrador ativo.'
        USING ERRCODE = 'check_violation', HINT = 'last_admin';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_last_admin ON public.profiles;
CREATE TRIGGER enforce_last_admin
  BEFORE UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_last_admin();

-- ---------------------------------------------------------------------------
-- 6. Escrita administrativa em profiles
--    O grant por coluna deixa `role` e `deactivated_at` fora do alcance de
--    authenticated -- inclusive de admins -- e assim deve continuar (é a
--    correção de 20260811000000). A única porta é esta função: ela mesma exige
--    is_admin(), valida o papel e faz o UPDATE. Os triggers continuam valendo:
--    auth.uid() segue sendo o chamador, então enforce_profile_role_change e
--    enforce_last_admin julgam a escrita normalmente.
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
-- 7. Log de auditoria do gerenciamento de usuários (append-only)
--    Sem FK para auth.users de propósito: um ON DELETE SET NULL seria um
--    UPDATE, que a trava abaixo barra, e o histórico precisa sobreviver à
--    exclusão do usuário. Os e-mails ficam como snapshot.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_management_action') THEN
    CREATE TYPE public.user_management_action AS ENUM (
      'invited',
      'updated',
      'email_changed',
      'password_reset_sent',
      'deactivated',
      'reactivated',
      'deleted'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_management_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid,
  actor_email text,
  target_id uuid,
  target_email text,
  action public.user_management_action NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_management_events_created_at
  ON public.user_management_events (created_at DESC);

ALTER TABLE public.user_management_events ENABLE ROW LEVEL SECURITY;

-- Supabase concede ALL em tabelas novas do schema public a anon/authenticated
-- por default privileges. Só leitura para authenticated, e a policy restringe
-- a admins. Inserção apenas pelo service_role (server action após checar admin).
REVOKE ALL ON public.user_management_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.user_management_events TO authenticated;

DROP POLICY IF EXISTS "Admins can read user management events" ON public.user_management_events;
CREATE POLICY "Admins can read user management events"
  ON public.user_management_events FOR SELECT
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.prevent_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'O log de auditoria é somente inclusão.'
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

DROP TRIGGER IF EXISTS enforce_audit_append_only ON public.user_management_events;
CREATE TRIGGER enforce_audit_append_only
  BEFORE UPDATE OR DELETE ON public.user_management_events
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_mutation();
