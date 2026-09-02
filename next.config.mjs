import { LEGACY_REDIRECTS } from './src/lib/legacy-redirects.mjs';

// `CONTEXT`, `URL` e `DEPLOY_PRIME_URL` são variáveis do Netlify que só existem
// durante o build — funções serverless não as enxergam em runtime. Resolvemos
// aqui e reexpomos via `env` para que o bundle as carregue inline.
// https://docs.netlify.com/build/configure-builds/environment-variables/
//
// O Netlify sempre define `CONTEXT`. Qualquer outro ambiente — `npm run build`
// local, outro host — cai em 'development' e portanto em noindex: falhar para o
// lado seguro é melhor que indexar por acidente. `SITE_DEPLOY_CONTEXT` é a
// saída documentada para hospedar em outro lugar.
const deployContext =
  process.env.SITE_DEPLOY_CONTEXT ?? process.env.CONTEXT ?? 'development';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

// Falhar o build é deliberado. Sem essa trava o modo de falha é silencioso e
// caro: canonical apontando para localhost, sitemap com URLs de localhost e
// `undefined/imovel/<slug>` gravado nos leads reais do Netlify Forms — tudo
// descoberto semanas depois no Search Console.
if (deployContext === 'production') {
  const isCanonical =
    !!siteUrl &&
    /^https:\/\//.test(siteUrl) &&
    !/localhost|127\.0\.0\.1|\.netlify\.app/.test(siteUrl);

  if (!isCanonical) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL precisa ser a origem https canônica do site ` +
        `(ex.: https://mitramimoveis.com.br) em builds de produção. Valor atual: ${siteUrl ?? '(vazio)'}`
    );
  }
}

const isProductionDeploy = deployContext === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_DEPLOY_CONTEXT: deployContext,
    NEXT_PUBLIC_DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL ?? '',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cvfqzmprnwkxqnzqhtpj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
  async headers() {
    const headers = [
      {
        // `/__forms.html` é uma página real e rastreável, que existe só para o
        // Netlify detectar os formulários. Ela recebe `noindex` por header em
        // vez de `Disallow` no robots.txt: um disallow impediria o crawler de
        // ler o próprio noindex.
        source: '/__forms.html',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];

    // O Netlify já costuma marcar deploy previews com X-Robots-Tag, mas isso não
    // é documentado e não cobre branch deploys em subdomínio próprio. Esta é uma
    // das três camadas de proteção (as outras: robots.ts e o metadata raiz).
    if (!isProductionDeploy) {
      headers.push({
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      });
    }

    return headers;
  },
  async redirects() {
    return LEGACY_REDIRECTS;
  },
  // Server code never ships to browsers, so minifying it only saves a
  // little cold-start time at the cost of unreadable production stack
  // traces (mangled names, no line mapping). Disabling it keeps server
  // errors legible in Netlify's logs.
  // Next 15.5 does support `experimental.serverSourceMaps`, but it stays off
  // on purpose: it enlarges the Netlify function bundle, and unminified
  // server output is already enough to read a stack trace.
  experimental: {
    serverMinification: false,
  },
  // Makes client chunk .js.map files available on request, so a browser
  // stack trace forwarded via /api/log-error can be manually resolved back
  // to source. Off by default in Next.js; does not affect what ships to
  // visitors, only what's available at /_next/static/**/*.js.map.
  productionBrowserSourceMaps: true,
};

export default nextConfig;
