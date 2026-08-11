-- Corrige escalonamento de privilégio em public.profiles.
--
-- A policy anterior era:
--   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
--     USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
--
-- Ela não restringia colunas, então qualquer usuário autenticado podia usar a
-- chave pública (anon) para chamar
--   PATCH /rest/v1/profiles?id=eq.<próprio-id>  {"role":"admin"}
-- e se promover a administrador. Como todas as outras policies do projeto (e as
-- de storage) dependem de public.is_admin(), isso concedia escrita em todas as
-- tabelas e buckets. O trigger handle_new_user cria uma linha em profiles para
-- todo usuário novo do Auth, então bastava conseguir uma conta.
--
-- Este arquivo é idempotente e pode ser aplicado em um banco já em produção.

-- 1. Helper para ler o role do próprio chamador. SECURITY DEFINER ignora RLS,
--    o que permite a uma policy de profiles consultar profiles sem recursão.
CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- 2. Policies de UPDATE. Policies permissivas se somam (OR): o administrador
--    continua passando pela policy de admin e pode atribuir roles; o usuário
--    comum passa apenas pela primeira, que fixa `role` no valor atual.
--    current_profile_role() é STABLE, portanto lê o snapshot do início do
--    comando, ou seja, o valor antigo da linha.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role IS NOT DISTINCT FROM public.current_profile_role()
  );

-- A policy de admin não tinha WITH CHECK; sem ele o UPDATE reaproveita apenas o
-- USING e a linha resultante não é validada.
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Defesa em profundidade: barra a troca de role na própria tabela, por
--    qualquer caminho de escrita. auth.uid() é NULL no cliente service_role e
--    em sessões do SQL Editor (postgres); ambos são confiáveis e precisam
--    continuar funcionando -- é disso que promote-admin.sql depende.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Somente administradores podem alterar profiles.role.'
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
