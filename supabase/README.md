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

### 4. O que foi corrigido nesta fase

- Migrations agora incluem **storage buckets**, **políticas de storage** e **trigger** que cria `profiles` ao cadastrar usuário no Auth.
- RLS de `profiles` permite que o usuário autenticado leia **a própria** linha (necessário para o middleware do painel).
- Páginas de login/recuperação **não** usam mais o layout do painel administrativo.
- Login valida `profiles.role = 'admin'` antes de redirecionar.
