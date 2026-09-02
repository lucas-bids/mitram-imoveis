/**
 * Fonte única de verdade para a identidade do site: domínio canônico, dados do
 * negócio e construção de URLs absolutas.
 *
 * Tudo que precisa de uma URL absoluta — canonical, Open Graph, sitemap,
 * JSON-LD e o `propertyUrl` enviado ao Netlify Forms — passa por aqui. Nenhum
 * outro módulo deve ler `NEXT_PUBLIC_SITE_URL` diretamente.
 *
 * As variáveis `CONTEXT` e `DEPLOY_PRIME_URL` do Netlify só existem em tempo de
 * build; `next.config.mjs` as reexpõe como `NEXT_PUBLIC_DEPLOY_CONTEXT` e
 * `NEXT_PUBLIC_DEPLOY_PRIME_URL` para que fiquem disponíveis em runtime.
 */

export type DeployContext =
  | "production"
  | "deploy-preview"
  | "branch-deploy"
  | "development";

const DEPLOY_CONTEXTS: readonly string[] = [
  "production",
  "deploy-preview",
  "branch-deploy",
  "development",
];

function resolveDeployContext(): DeployContext {
  const raw = process.env.NEXT_PUBLIC_DEPLOY_CONTEXT;
  if (raw && DEPLOY_CONTEXTS.includes(raw)) return raw as DeployContext;
  return process.env.NODE_ENV === "development" ? "development" : "production";
}

export const DEPLOY_CONTEXT = resolveDeployContext();
export const IS_PRODUCTION_DEPLOY = DEPLOY_CONTEXT === "production";

const LOCALHOST = "http://localhost:3000";

/** Devolve apenas a origem (sem barra final) ou null se não for uma URL válida. */
function normalizeOrigin(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function resolveSiteUrl(): string {
  const configured = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);

  // Em produção o domínio canônico é obrigatório — `next.config.mjs` quebra o
  // build quando ele falta, então aqui só resta o fallback defensivo.
  if (IS_PRODUCTION_DEPLOY) return configured ?? LOCALHOST;

  // Em preview/branch deploy a URL do próprio deploy vale mais que a canônica:
  // os links da página precisam apontar para o que está sendo revisado.
  const deployUrl = normalizeOrigin(process.env.NEXT_PUBLIC_DEPLOY_PRIME_URL);
  return deployUrl ?? configured ?? LOCALHOST;
}

/** Origem absoluta do site, sem barra final. */
export const SITE_URL = resolveSiteUrl();

/** Converte um caminho interno em URL absoluta: `absoluteUrl("/imoveis")`. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return clean ? `${SITE_URL}/${clean}` : SITE_URL;
}

export const SITE = {
  name: "Mitram Imóveis",
  description:
    "Imobiliária em Curitiba e região. Encontre casas, apartamentos e terrenos à venda ou para alugar, com atendimento próximo do começo ao fim.",
  locale: "pt_BR",
  lang: "pt-BR",
  phone: {
    e164: "+5541996787173",
    display: "(41) 99678-7173",
  },
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5541996787173",
  // Confirmado pelo negócio. Antes disso o rodapé exibia `contato@mitram.com`
  // e a página de contato um Gmail pessoal — nenhum dos dois no domínio do
  // site. Este endereço também é o canal de pedidos de LGPD anunciado na
  // política de privacidade, então precisa continuar monitorado.
  email: "contato@mitramimoveis.com.br",
  creci: "J06908",
  legalName: "Mitram Soluções Imobiliárias",
  cnpj: "29.424.641/0001-55",
  address: {
    // O bairro vive dentro de `street` de propósito: `PostalAddress` do
    // schema.org não tem campo para bairro, e em endereço brasileiro ele
    // pertence à linha do logradouro.
    street: "Barão de Monte Alegre, 361, sb4 — Jardim das Américas",
    locality: "Curitiba",
    region: "PR",
    country: "BR",
    postalCode: "81540-200",
  },
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "18:00",
    display: "Segunda a sexta, das 8h às 18h",
  },
  social: {
    instagram: "https://instagram.com/mitramimoveis",
    instagramHandle: "@mitramimoveis",
  },
  logo: {
    path: "/images/mitram-full-ouro-degrade.png",
    width: 900,
    height: 560,
  },
  ogImage: "/opengraph-image.jpg",
} as const;

/** Link do WhatsApp com mensagem pré-preenchida. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}
