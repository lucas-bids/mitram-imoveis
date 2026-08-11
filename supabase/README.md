## Configuração do Supabase

### 1. Aplicar migrations e seed (obrigatório)

O banco **não é criado automaticamente** só por existir os arquivos no repositório. Escolha **uma** das opções abaixo.

#### Opção A — SQL Editor (recomendado se você ainda não configurou `DATABASE_URL`)

1. Abra o [Supabase SQL Editor](https://supabase.com/dashboard/project/cvfqzmprnwkxqnzqhtpj/sql/new).
2. Cole e execute o conteúdo completo de [`supabase/setup-complete.sql`](supabase/setup-complete.sql).
3. Execute [`supabase/verify.sql`](supabase/verify.sql) para confirmar:
   - 8 tabelas com status `EXISTS`
   - 3 enums (`property_purpose`, `property_status`, `media_type`)
   - 2 buckets (`property-images`, `property-floorplans`)

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

### 2. Criar o primeiro administrador

1. Crie o usuário em **Authentication > Users** no Supabase.
2. Execute [`supabase/promote-admin.sql`](supabase/promote-admin.sql) substituindo o e-mail.
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

### 4. Endurecimento de segurança (obrigatório antes de publicar)

Estes dois passos precisam ser aplicados **no projeto em produção** — não basta ter os arquivos no repositório.

1. **Desabilitar cadastro público.** Em **Authentication > Sign In / Providers > Email**, desligue **"Allow new users to sign up"** (`Enable email signups`). Só o painel `/admin` usa o Auth, e os administradores são criados manualmente em **Authentication > Users**. Com o cadastro aberto, qualquer pessoa criava uma conta autenticada no banco.

2. **Aplicar a migration [`20260811000000_fix_profile_role_escalation.sql`](migrations/20260811000000_fix_profile_role_escalation.sql)** no SQL Editor. A política antiga `"Users can update own profile"` permitia que um usuário autenticado executasse `update profiles set role = 'admin'` na própria linha — ou seja, escalava para administrador sozinho e ganhava acesso total via `public.is_admin()`.

   Confirme depois que a política sumiu e que o grant da coluna foi revogado:
   ```sql
   SELECT policyname FROM pg_policies
   WHERE tablename = 'profiles' AND cmd = 'UPDATE';
   -- esperado: apenas "Admins can update profiles"

   SELECT grantee, privilege_type FROM information_schema.column_privileges
   WHERE table_name = 'profiles' AND column_name = 'role'
     AND grantee IN ('anon', 'authenticated');
   -- esperado: nenhuma linha
   ```

Promoção de administrador continua sendo feita apenas via [`supabase/promote-admin.sql`](promote-admin.sql) no SQL Editor.

### 5. O que foi corrigido nesta fase

- Migrations agora incluem **storage buckets**, **políticas de storage** e **trigger** que cria `profiles` ao cadastrar usuário no Auth.
- RLS de `profiles` permite que o usuário autenticado leia **a própria** linha (necessário para o middleware do painel).
- RLS de `profiles` **não** permite que o usuário altere o próprio `role`: só administradores atribuem ou modificam roles. A regra é aplicada tanto na policy de UPDATE quanto por um trigger (`enforce_profile_role_change`). Em bancos já criados antes dessa correção, aplique `supabase/migrations/20260811000000_profiles_role_guard.sql`.
- Páginas de login/recuperação **não** usam mais o layout do painel administrativo.
- Login valida `profiles.role = 'admin'` antes de redirecionar.
