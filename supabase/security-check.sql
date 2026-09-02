-- Auditoria de segurança (result set único para o SQL Editor do Supabase).
--
-- Somente leitura: não altera nada. Rode em produção antes de publicar e
-- sempre que uma migration mexer em policies, grants ou profiles.
-- **Toda linha deve sair com status = 'OK'.** As que não saírem aparecem no
-- topo do resultado. Qualquer uma delas é um bloqueador de lançamento.
--
-- Complementa verify.sql: aquele confere que o schema existe, este confere que
-- ele está fechado.
--
-- Limite conhecido: os itens 5 e 6 detectam a *presença* de is_admin() na
-- expressão da policy, não que ela seja a única condição. Uma policy escrita
-- como `USING (public.is_admin() OR true)` passaria. Rode a consulta de revisão
-- manual do README §4.3 uma vez para ler as expressões com os próprios olhos.

WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'profiles',
    'property_types',
    'cities',
    'neighborhoods',
    'features',
    'properties',
    'property_features',
    'property_media'
  ]) AS object_name
),

-- Gates das policies, normalizados uma vez só.
--   using_ok  -> a expressão USING (governa SELECT/UPDATE/DELETE) cita is_admin
--   check_ok  -> a expressão WITH CHECK (governa INSERT/UPDATE) cita is_admin;
--                quando ausente, o Postgres reaproveita o USING.
policy_gates AS (
  SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    qual,
    with_check,
    coalesce(qual, '') LIKE '%is_admin%' AS using_ok,
    coalesce(with_check, qual, '') LIKE '%is_admin%' AS check_ok
  FROM pg_policies
),

-- Policies de escrita que não passam por is_admin(). Cada comando é avaliado
-- pela expressão que realmente o governa: um `FOR ALL USING (true) WITH CHECK
-- (is_admin())` libera DELETE de tudo e precisa aparecer aqui.
open_write_policies AS (
  SELECT schemaname, tablename, policyname, cmd, qual, with_check
  FROM policy_gates
  WHERE permissive = 'PERMISSIVE'
    AND NOT (tablename = 'profiles' AND policyname = 'Users can update own profile')
    AND (
      (cmd = 'INSERT' AND NOT check_ok)
      OR (cmd = 'DELETE' AND NOT using_ok)
      OR (cmd IN ('UPDATE', 'ALL') AND NOT (using_ok AND check_ok))
    )
),

-- 1. RLS ligada em TODA tabela do schema public, não só nas 8 esperadas: uma
--    tabela nova sem RLS nasce gravável pela chave anon (que é pública por
--    natureza — vai no bundle do navegador).
rls_checks AS (
  SELECT
    'rls'::text AS category,
    t.tablename::text AS object,
    CASE WHEN t.rowsecurity THEN 'OK' ELSE 'RLS DESLIGADA' END::text AS status,
    NULL::text AS detail
  FROM pg_tables t
  WHERE t.schemaname = 'public'
),

-- 2. As 8 tabelas esperadas continuam existindo.
table_checks AS (
  SELECT
    'tabela'::text,
    e.object_name::text,
    CASE WHEN t.tablename IS NULL THEN 'AUSENTE' ELSE 'OK' END::text,
    NULL::text
  FROM expected_tables e
  LEFT JOIN pg_tables t
    ON t.schemaname = 'public'
   AND t.tablename = e.object_name
),

-- 3. Policies de UPDATE em profiles. Só dois nomes são aceitáveis, e a de admin
--    precisa existir. Um banco onde só a migration ...000000 rodou tem apenas a
--    de admin — estado mais restritivo, e portanto OK.
profile_policy_checks AS (
  SELECT
    'policy'::text,
    'profiles: policies de UPDATE'::text,
    CASE
      WHEN NOT coalesce(bool_or(policyname = 'Admins can update profiles'), false)
        THEN 'SEM POLICY DE ADMIN'
      WHEN bool_or(policyname NOT IN ('Admins can update profiles', 'Users can update own profile'))
        THEN 'POLICY INESPERADA'
      ELSE 'OK'
    END::text,
    coalesce(string_agg(policyname, ', ' ORDER BY policyname), '(nenhuma)')::text
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND cmd = 'UPDATE'
),

-- 4. Se a policy de auto-edição existir, ela precisa travar a coluna role.
--    Ausência também é OK — é o estado ainda mais restritivo.
profile_selfupdate_checks AS (
  SELECT
    'policy'::text,
    'profiles: auto-edição trava role'::text,
    CASE
      WHEN p.policyname IS NULL THEN 'OK'
      WHEN coalesce(p.with_check, '') LIKE '%current_profile_role%' THEN 'OK'
      ELSE 'SEM TRAVA DE ROLE'
    END::text,
    coalesce(p.with_check, '(policy ausente)')::text
  FROM (SELECT 1) one
  LEFT JOIN pg_policies p
    ON p.schemaname = 'public'
   AND p.tablename = 'profiles'
   AND p.cmd = 'UPDATE'
   AND p.policyname = 'Users can update own profile'
),

-- 5. Escritas sem is_admin() nas tabelas públicas.
open_write_policy_checks AS (
  SELECT
    'policy'::text,
    'public: escrita sem is_admin()'::text,
    CASE WHEN count(*) = 0 THEN 'OK' ELSE 'ABERTO' END::text,
    coalesce(
      string_agg(
        tablename || '.' || policyname || ' [' || cmd || '] USING=' ||
        coalesce(qual, '-') || ' CHECK=' || coalesce(with_check, '-'),
        ' | '
      ),
      '(nenhuma)'
    )::text
  FROM open_write_policies
  WHERE schemaname = 'public'
),

-- 6. Mesma regra nos buckets. Leitura é pública de propósito; escrita não.
storage_write_policy_checks AS (
  SELECT
    'policy'::text,
    'storage.objects: escrita sem is_admin()'::text,
    CASE WHEN count(*) = 0 THEN 'OK' ELSE 'ABERTO' END::text,
    coalesce(
      string_agg(
        policyname || ' [' || cmd || '] USING=' || coalesce(qual, '-') ||
        ' CHECK=' || coalesce(with_check, '-'),
        ' | '
      ),
      '(nenhuma)'
    )::text
  FROM open_write_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
),

-- 7. Grants. has_*_privilege resolve grants feitos a PUBLIC e herança de role,
--    coisa que um filtro por grantee IN ('anon','authenticated') em
--    information_schema não faz.
grant_checks AS (
  SELECT
    'grant'::text,
    'profiles.role gravável por anon/authenticated'::text,
    CASE
      WHEN to_regrole('anon') IS NULL OR to_regrole('authenticated') IS NULL
        THEN 'ROLES DA API AUSENTES'
      WHEN has_column_privilege('anon', 'public.profiles', 'role', 'UPDATE')
        OR has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE')
        THEN 'GRAVÁVEL'
      ELSE 'OK'
    END::text,
    NULL::text
  UNION ALL
  SELECT
    'grant'::text,
    'profiles: UPDATE no nível da tabela'::text,
    CASE
      WHEN to_regrole('anon') IS NULL OR to_regrole('authenticated') IS NULL
        THEN 'ROLES DA API AUSENTES'
      WHEN has_table_privilege('anon', 'public.profiles', 'UPDATE')
        OR has_table_privilege('authenticated', 'public.profiles', 'UPDATE')
        THEN 'GRANT AMPLO'
      ELSE 'OK'
    END::text,
    'o grant amplo cobre todas as colunas e precisa ter sido revogado'::text
  UNION ALL
  -- Contraprova: o REVOKE não pode ter derrubado o caminho legítimo.
  SELECT
    'grant'::text,
    'profiles.full_name gravável pelo usuário'::text,
    CASE
      WHEN to_regrole('authenticated') IS NULL THEN 'ROLES DA API AUSENTES'
      WHEN has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE')
        THEN 'OK'
      ELSE 'GRANT DEMAIS REVOGADO'
    END::text,
    NULL::text
),

-- 8. Triggers de defesa em profundidade. Presente mas DESABILITADO conta como
--    ausente: tgenabled = 'D' desliga a trava inteira.
trigger_checks AS (
  SELECT
    'trigger'::text,
    t.tgname::text,
    CASE
      WHEN g.tgname IS NULL THEN 'AUSENTE'
      WHEN g.tgenabled = 'D' THEN 'DESABILITADO'
      ELSE 'OK'
    END::text,
    (t.rel || coalesce(' tgenabled=' || g.tgenabled::text, ''))::text
  FROM (VALUES
    ('enforce_profile_role_change', 'public.profiles'),
    ('on_auth_user_created', 'auth.users')
  ) AS t(tgname, rel)
  LEFT JOIN (
    SELECT g.tgname, g.tgenabled, n.nspname || '.' || c.relname AS rel
    FROM pg_trigger g
    JOIN pg_class c ON c.oid = g.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE NOT g.tgisinternal
  ) g ON g.tgname = t.tgname AND g.rel = t.rel
),

-- 9. As funções que sustentam a autorização precisam ser SECURITY DEFINER com
--    search_path fixo — sem isso um schema no caminho de busca sequestra a
--    resolução de nomes dentro da função.
function_checks AS (
  SELECT
    'function'::text,
    f.object_name::text,
    CASE
      WHEN p.oid IS NULL THEN 'AUSENTE'
      WHEN NOT p.prosecdef THEN 'SEM SECURITY DEFINER'
      WHEN NOT EXISTS (
        SELECT 1 FROM unnest(coalesce(p.proconfig, '{}'::text[])) cfg
        WHERE cfg LIKE 'search_path=%'
      ) THEN 'SEARCH_PATH LIVRE'
      ELSE 'OK'
    END::text,
    NULL::text
  FROM (
    SELECT unnest(ARRAY[
      'is_admin',
      'current_profile_role',
      'prevent_profile_role_escalation',
      'handle_new_user'
    ]) AS object_name
  ) f
  LEFT JOIN pg_proc p
    ON p.proname = f.object_name
   AND p.pronamespace = 'public'::regnamespace
),

-- 10. Todo o modelo de autorização se reduz a is_admin(). Se alguém redefinir o
--     corpo dela, todas as checagens acima continuam verdes. Confere o corpo.
is_admin_body_checks AS (
  SELECT
    'function'::text,
    'is_admin(): corpo confere role admin'::text,
    CASE
      WHEN p.oid IS NULL THEN 'AUSENTE'
      WHEN p.prosrc LIKE '%auth.uid()%' AND p.prosrc LIKE '%''admin''%' THEN 'OK'
      ELSE 'CORPO INESPERADO'
    END::text,
    replace(coalesce(p.prosrc, '(ausente)'), E'\n', ' ')::text
  FROM (SELECT 1) one
  LEFT JOIN pg_proc p
    ON p.proname = 'is_admin'
   AND p.pronamespace = 'public'::regnamespace
),

-- 11. Contas. Só o painel /admin usa o Auth e os administradores são criados à
--     mão, então todo perfil sem role = 'admin' é resíduo de cadastro público
--     aberto e precisa ser revisado em Authentication > Users (README §4.4).
account_checks AS (
  SELECT
    'conta'::text,
    'perfis que não são admin'::text,
    CASE WHEN count(*) = 0 THEN 'OK' ELSE 'REVISAR' END::text,
    (count(*)::text || ' conta(s) — cadastro público deve estar desligado')::text
  FROM public.profiles
  WHERE role IS DISTINCT FROM 'admin'
  UNION ALL
  SELECT
    'conta'::text,
    'administradores'::text,
    CASE WHEN count(*) > 0 THEN 'OK' ELSE 'NENHUM ADMIN' END::text,
    (count(*)::text || ' conta(s)')::text
  FROM public.profiles
  WHERE role = 'admin'
)

SELECT category, object, status, detail
FROM (
  SELECT category, object, status, detail FROM rls_checks
  UNION ALL SELECT * FROM table_checks
  UNION ALL SELECT * FROM profile_policy_checks
  UNION ALL SELECT * FROM profile_selfupdate_checks
  UNION ALL SELECT * FROM open_write_policy_checks
  UNION ALL SELECT * FROM storage_write_policy_checks
  UNION ALL SELECT * FROM grant_checks
  UNION ALL SELECT * FROM trigger_checks
  UNION ALL SELECT * FROM function_checks
  UNION ALL SELECT * FROM is_admin_body_checks
  UNION ALL SELECT * FROM account_checks
) AS all_checks
ORDER BY
  CASE status WHEN 'OK' THEN 2 ELSE 1 END,
  CASE category
    WHEN 'rls' THEN 1
    WHEN 'tabela' THEN 2
    WHEN 'policy' THEN 3
    WHEN 'grant' THEN 4
    WHEN 'trigger' THEN 5
    WHEN 'function' THEN 6
    WHEN 'conta' THEN 7
    ELSE 8
  END,
  object;
