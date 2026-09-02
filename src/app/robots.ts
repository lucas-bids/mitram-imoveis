import type { MetadataRoute } from "next";
import { IS_PRODUCTION_DEPLOY, SITE_URL, absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Deploy preview e branch deploy nunca devem ser rastreados. Esta é uma das
  // três camadas — as outras são o `robots` do metadata raiz e o header
  // `X-Robots-Tag` emitido por next.config.mjs.
  if (!IS_PRODUCTION_DEPLOY) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Ausentes de propósito:
        // - `/imoveis?...`: as URLs filtradas precisam ser rastreáveis para que
        //   o crawler consiga ler a meta `noindex` delas. Um Disallow aqui
        //   impediria justamente isso.
        // - `/__forms.html`: mesmo motivo; recebe `X-Robots-Tag` no lugar.
        //
        // robots.txt é diretiva de rastreamento, nunca controle de acesso:
        // /admin é protegido por middleware + RLS, não por esta linha.
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
