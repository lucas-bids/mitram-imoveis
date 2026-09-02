## Configuração do Supabase

### 1. Aplicar migrations e seed (obrigatório)

O banco **não é criado automaticamente** só por existir os arquivos no repositório. Escolha **uma** das opções abaixo.

#### Opção A — SQL Editor (recomendado se você ainda não configurou `DATABASE_URL`)

1. Abra o [Supabase SQL Editor](https://supabase.com/dashboard/project/cvfqzmprnwkxqnzqhtpj/sql/new).
2. Cole e execute o conteúdo completo de [`supabase/setup-complete.sql`](setup-complete.sql).
3. Execute [`supabase/verify.sql`](verify.sql) para confirmar:
   - 8 tabelas com status `OK`
   - 3 enums (`property_purpose`, `property_status`, `media_type`)
   - 2 buckets (`property-images`, `property-floorplans`)
4. Execute [`supabase/security-check.sql`](security-check.sql) e confirme
   que toda linha saiu com `status = 'OK'` (detalhes em §4.3).

#### Opção B — Script automatizado

1. Em **Project Settings > Database**, copie a **Connection string (URI)**.
2. Adicione ao `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
3. Execute:
   ```bash
   npm run db:apply
   ```
4. Rode `verify.sql` e `security-check.sql` no SQL Editor, como na Opção A.

> `npm run db:apply` replica todas as migrations em ordem de nome de arquivo e
> serve para **banco novo**: `20240101000000_initial_schema.sql` usa
> `CREATE TYPE`/`CREATE TABLE`/`CREATE POLICY` sem `IF NOT EXISTS` e aborta
> contra um banco já criado. Para endurecer um banco que já está em produção,
> use os arquivos de §4.2, que são idempotentes.

### 2. Criar o primeiro administrador

1. Crie o usuário em **Authentication > Users** no Supabase.
2. Execute [`promote-admin.sql`](promote-admin.sql) substituindo o e-mail.
3. Confirme no SQL Editor:
   ```sql
   SELECT id, role, full_name FROM profiles WHERE role = 'admin';
   ```

### 3. Configurar Auth redirects

Em **Authentication > URL Configuration**:

- **Site URL:** `http://localhost:3000` (dev) e depois o domínio do Netlify/produção
- **Redirect URLs:**
  - `http://localhost:3000/**`
  - `https://seu-dominio.netlify.app/**`

### 4. Checklist de segurança (obrigatório antes de publicar)

Os arquivos SQL deste repositório **não são prova** do estado do banco em
produção. Cada item abaixo precisa ser executado e conferido no projeto real.

#### 4.1 Desligar o cadastro público

Em **Authentication > Sign In / Providers > Email**, desligue
**"Allow new users to sign up"** (`Enable email signups`).

Só o painel `/admin` usa o Auth, e os administradores são criados à mão em
**Authentication > Users**. Com o cadastro aberto, qualquer pessoa com a chave
publicável (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, a chave `anon` do projeto — é
pública por natureza, vai no bundle do navegador) cria uma conta
`authenticated` dentro do banco. Como o trigger `handle_new_user` gera uma linha
em `profiles` para todo usuário novo, e **toda** policy de escrita do schema
autoriza via `public.is_admin()`, que lê `profiles.role`, um cadastro aberto
transforma qualquer policy futura escrita como "authenticated pode X" em
"a internet pode X".

Confirme que ficou fechado (a chave `anon` pode ser usada à vontade, é pública):

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST "https://<project-ref>.supabase.co/auth/v1/signup" \
  -H "apikey: <NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste-signup@example.com","password":"Teste123456!"}'
# esperado: 422 (signup_disabled). 200 com um objeto de usuário = ainda aberto.
```

Se voltar 200, o teste **criou a conta de verdade**: apague `teste-signup@example.com`
em **Authentication > Users** (e a linha correspondente em `profiles`) depois de
desligar o cadastro.

#### 4.2 Aplicar as migrations de endurecimento

No SQL Editor, execute nesta ordem (são idempotentes, podem rodar em banco já em
produção):

1. [`migrations/20260811000000_fix_profile_role_escalation.sql`](migrations/20260811000000_fix_profile_role_escalation.sql)
2. [`migrations/20260811000001_profiles_role_guard.sql`](migrations/20260811000001_profiles_role_guard.sql)

A policy original `"Users can update own profile"` não restringia colunas, então
um usuário autenticado executava `update profiles set role = 'admin'` na própria
linha e ganhava acesso de escrita a todas as tabelas e aos dois buckets. As duas
migrations juntas deixam o estado final: a policy existe, mas trava a coluna
`role` (`current_profile_role()`), o grant amplo de UPDATE é revogado, e o
trigger `enforce_profile_role_change` barra a troca por qualquer caminho.

#### 4.3 Auditar o banco em produção

Execute [`supabase/security-check.sql`](security-check.sql) no SQL Editor.
É somente leitura. **Toda linha precisa sair com `status = 'OK'`** — as que não
saírem aparecem no topo do resultado. Ele confere:

- RLS ligada nas 8 tabelas públicas;
- as policies de UPDATE de `profiles` e a trava da coluna `role`;
- que `anon`/`authenticated` não têm grant de escrita em `profiles.role`;
- os triggers `enforce_profile_role_change` e `on_auth_user_created`;
- que `is_admin`, `current_profile_role`, `prevent_profile_role_escalation` e
  `handle_new_user` são `SECURITY DEFINER` com `search_path` fixo;
- que nenhuma policy de escrita (tabelas públicas ou `storage.objects`) passa
  sem `is_admin()`;
- quantas contas existem sem `role = 'admin'` — resíduo de cadastro aberto.

Rode-o de novo sempre que uma migration mexer em policies, grants ou `profiles`.

Os itens 5 e 6 detectam a *presença* de `is_admin()` na expressão da policy, não
que ela seja a única condição — algo como `USING (public.is_admin() OR true)`
passaria. Uma vez, leia as expressões com os próprios olhos:

```sql
SELECT schemaname, tablename, policyname, cmd, permissive, qual, with_check
FROM pg_policies
WHERE (schemaname = 'public' OR (schemaname = 'storage' AND tablename = 'objects'))
  AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
ORDER BY schemaname, tablename, policyname;
```

Toda linha deve ser gated por `public.is_admin()` e nada mais, com a única
exceção de `profiles."Users can update own profile"`, que trava a coluna `role`.

#### 4.4 Limpar contas indevidas

Se 4.3 apontou perfis sem `role = 'admin'`, confira em **Authentication > Users**
e apague o que não for legítimo:

```sql
SELECT u.id, u.email, u.created_at, p.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at;
```

#### 4.5 Conferir que o painel continua funcionando

Faça login em `/admin/login` com o administrador real, confirme o redirecionamento
para `/admin/imoveis` e faça um upload de imagem — isso prova que as policies de
storage continuaram intactas.

Promoção de administrador continua sendo feita apenas via
[`promote-admin.sql`](promote-admin.sql) no SQL Editor.

### 5. O que foi corrigido nesta fase

- Migrations agora incluem **storage buckets**, **políticas de storage** e **trigger** que cria `profiles` ao cadastrar usuário no Auth.
- RLS de `profiles` permite que o usuário autenticado leia **a própria** linha (necessário para o middleware do painel).
- RLS de `profiles` **não** permite que o usuário altere o próprio `role`: só administradores atribuem ou modificam roles. A regra é aplicada tanto na policy de UPDATE quanto por um trigger (`enforce_profile_role_change`). Em bancos já criados antes dessa correção, aplique as duas migrations de §4.2.
- Páginas de login/recuperação **não** usam mais o layout do painel administrativo.
- Login valida `profiles.role = 'admin'` antes de redirecionar.
