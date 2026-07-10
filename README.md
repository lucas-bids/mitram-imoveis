# Mitram Imóveis MVP

Projeto do novo website da Mitram Imóveis, desenvolvido com Next.js (App Router) e Supabase.

## Pré-requisitos

- Node.js (v18+)
- Conta no Supabase
- Conta no Google Cloud (para a chave do Maps)
- Conta no Netlify para Deploy

## Configuração do Ambiente Local

1. Copie o arquivo de exemplo e crie o `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Preencha as variáveis em `.env.local` com os valores reais (Publishable Key, Secret Key, etc.).
3. Instale as dependências:
   ```bash
   npm install
   ```

## Configuração do Supabase

### 1. Migrations e Seed

As tabelas do banco de dados são versionadas usando SQL no diretório `supabase/migrations`.
Como a execução remota via script exige acesso direto ao Postgres, execute o código de `supabase/migrations/20240101000000_initial_schema.sql` diretamente no painel **SQL Editor** do Supabase.

Após criar as tabelas, execute o script `supabase/seed.sql` da mesma forma no SQL Editor para popular o banco de dados com tipos de imóveis, cidades, bairros, características e imóveis fictícios.

### 2. Storage

No painel do Supabase, acesse **Storage** e crie os seguintes buckets:
- `property-images` (Público)
- `property-floorplans` (Público ou Privado, dependendo da necessidade)

### 3. Autenticação (Admin)

O painel administrativo é restrito a usuários com a role `admin`.
1. Crie o usuário inicial através do painel do Supabase em **Authentication > Users**.
2. Após criar o usuário, vá ao **SQL Editor** e atualize a role desse usuário na tabela `profiles`:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'ID_DO_USUARIO_CRIADO';
   ```

## Google Maps

A chave de API precisa estar restrita por HTTP Referrers no painel do Google Cloud.
Domínios permitidos sugeridos:
- `http://localhost:3000/*`
- Domínio temporário do Netlify
- Domínio final da Mitram

## Deploy no Netlify

O projeto está pronto para ser hospedado no Netlify.

Passos:
1. Conecte o repositório ao Netlify.
2. Defina os comandos padrão (`npm run build` / `out` ou via integração oficial do Next.js no Netlify).
3. No painel do Netlify, vá em **Site Settings > Environment Variables** e cadastre as variáveis de `.env.example` com seus valores de produção.
4. (Importante) A variável `SUPABASE_SECRET_KEY` **nunca** deve possuir o prefixo `NEXT_PUBLIC_`.
5. Após o deploy, atualize a variável `NEXT_PUBLIC_SITE_URL` com a URL final do site.

### Supabase Auth Redirects
No Supabase, vá em **Authentication > URL Configuration** e adicione:
- A URL final do Netlify aos **Redirect URLs**.
- A URL do `localhost:3000` para desenvolvimento.

## Funcionalidades e Limitações do MVP
O MVP contempla a listagem pública, filtros na URL, integração com Google Maps, página de detalhes do imóvel com galeria, integração com o WhatsApp, e formulários de contato (com proteção básica e SMTP desacoplado).
O painel administrativo permite criar, duplicar, editar e alterar o status dos imóveis, bem como fazer o upload ordenável (drag & drop) das fotos do imóvel.

### Limitações do MVP
- Importação automática do WordPress atual não contemplada.
- SEO avançado como Sitemap em tempo real (embora conte com JSON-LD estático/dinâmico).
- Sem integração nativa de Analytics ativa (apenas componentes base preparados).
- Paginação no painel administrativo foi mantida simplificada.
- Preservação de URLs antigas não implementada.

### Melhorias Recomendadas (Fase 2)
1. **Paginação Avançada**: Implementar paginação ou cursor-based load completo (Infinite Scroll nativo do banco) no painel administrativo e público.
2. **Integração Analytics**: Implementar Google Analytics via `next/third-parties` atrelado ao consentimento dos cookies.
3. **Sitemap Dinâmico**: Configurar `sitemap.ts` no App Router para atualizar imóveis para SEO automaticamente.
4. **Alarme / Favoritos**: Permitir que usuários salvem imóveis via local storage ou conta pública simples.
5. **Integração Portais**: Criar Endpoint/API para gerar feed XML padrão de portais (ZAP, VivaReal).

