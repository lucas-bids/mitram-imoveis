/**
 * Mapa versionado de URLs legadas do site WordPress anterior.
 *
 * É `.mjs` porque `next.config.mjs` precisa importá-lo em tempo de build.
 *
 * Regras:
 * - `permanent: true` emite 308, que o Google trata como equivalente a 301.
 * - Um salto só: o `destination` precisa responder 200, nunca outro redirect.
 * - Nunca mapeie uma URL legada desconhecida para `/` ou `/imoveis` — o Google
 *   classifica redirect irrelevante como soft 404 e o visitante perde o clique.
 *   Imóvel removido sem equivalente deve responder 404.
 * - Os slugs atuais são estáveis (o schema do admin não aceita `slug` em
 *   edição), então não existe e não deve existir tabela de histórico de slug.
 *
 * Preencher a partir da auditoria pré-lançamento: sitemap do WordPress,
 * Search Console (Páginas indexadas + Desempenho por página + Links), e
 * páginas de entrada do Analytics.
 *
 * @type {import('next').Redirect[]}
 */
export const LEGACY_REDIRECTS = [
  // { source: "/imovel-apartamento-batel", destination: "/imovel/apartamento-batel-a1b2", permanent: true },
];
