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
4. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Scripts disponíveis

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run start      # serve o build de produção
npm run lint       # eslint . --ext .js,.jsx,.ts,.tsx
npm run typecheck  # tsc --noEmit
npm run db:apply   # aplica as migrations e o seed (requer DATABASE_URL)
```

Não há suíte de testes configurada neste projeto.

## Configuração do Supabase

Consulte o guia detalhado em [`supabase/README.md`](supabase/README.md).

Resumo:

1. Execute `supabase/setup-complete.sql` no SQL Editor **ou** `npm run db:apply`
   com `DATABASE_URL` definido — o script aplica `supabase/migrations/*.sql` em
   ordem de nome de arquivo e, em seguida, `supabase/seed.sql`.
2. Crie o usuário admin em **Authentication > Users** e execute
   `supabase/promote-admin.sql` (substituindo o e-mail) para definir
   `profiles.role = 'admin'`.
3. Em **Authentication > URL Configuration**, adicione `http://localhost:3000/**`
   (e depois o domínio de produção) aos **Redirect URLs**.
4. Antes de publicar, aplique o endurecimento de segurança descrito na seção 4
   do [`supabase/README.md`](supabase/README.md) — desabilitar o cadastro
   público e aplicar a migration contra escalação de privilégio.

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
2. Confirme as configurações de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

   O runtime oficial do Next.js no Netlify detecta o framework e preenche esses
   valores automaticamente. Este é um site SSR/híbrido — as rotas dinâmicas,
   o middleware e as Server Actions rodam como funções serverless.
   `out` **não** se aplica aqui: aquele diretório só existe em projetos com
   `output: 'export'` (exportação estática), o que este projeto não usa.
3. No painel do Netlify, vá em **Site Settings > Environment Variables** e cadastre as variáveis de `.env.example` com seus valores de produção.
4. (Importante) A variável `SUPABASE_SECRET_KEY` **nunca** deve possuir o prefixo `NEXT_PUBLIC_`.
5. Após o deploy, atualize a variável `NEXT_PUBLIC_SITE_URL` com a URL final do site.

### Formulários de contato (Netlify Forms)

Os três formulários de lead do site usam o **Netlify Forms** — não há SMTP nem
variáveis de e-mail para configurar.

1. No painel do Netlify, vá em **Forms** e clique em **Enable form detection**.
2. **Refaça o deploy.** Os formulários só são registrados por um deploy que
   rodou *depois* da detecção estar ligada.
3. Em **Configuration > Notifications > Form submission notifications**,
   cadastre o e-mail que deve receber os leads de cada formulário: `contato`,
   `retorno-imovel` e `avaliacao-terreno`.

Os formulários são declarados em `public/__forms.html`, que existe apenas para
o Netlify conseguir enxergá-los no momento do deploy — o parser dele lê HTML
estático e não enxerga formulários renderizados pelo React. **Ao adicionar ou
renomear um campo, atualize o componente e esse arquivo**, senão o Netlify
descarta o campo silenciosamente.

Submissões só são registradas no site publicado. Em `npm run dev` o envio é
simulado: o payload aparece no console do navegador e a tela de sucesso é
exibida normalmente.

### Supabase Auth Redirects
No Supabase, vá em **Authentication > URL Configuration** e adicione:
- A URL final do Netlify aos **Redirect URLs**.
- A URL do `localhost:3000` para desenvolvimento.

## Funcionalidades e Limitações do MVP
O MVP contempla a listagem pública, filtros na URL, integração com Google Maps, página de detalhes do imóvel com galeria, integração com o WhatsApp, e formulários de contato (via Netlify Forms, com honeypot e filtro de spam).
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

