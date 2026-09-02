import type { MetadataRoute } from "next";
import { getSitemapProperties } from "@/features/properties/queries";
import { logError } from "@/lib/logger";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

/**
 * Data em que o texto das páginas estáticas mudou pela última vez. É constante
 * de propósito: um <lastmod> que muda a cada fetch é ruído que o Google aprende
 * a ignorar. Atualize à mão quando editar a copy dessas páginas.
 */
const STATIC_CONTENT_DATE = new Date("2026-09-02T00:00:00.000Z");

function lastModified(property: {
  updated_at: string | null;
  published_at: string | null;
  created_at: string;
}): Date {
  return new Date(property.updated_at ?? property.published_at ?? property.created_at);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let properties;
  try {
    properties = await getSitemapProperties();
  } catch (error) {
    logError("sitemap", error);
    // Propagar é deliberado. Com `revalidate = 3600`, o Next continua servindo
    // o último sitemap gerado com sucesso enquanto a revalidação falha, então
    // uma instabilidade do Supabase passa despercebida. Sem cache, a rota
    // devolve 5xx, o Search Console reporta "Não foi possível buscar" e o
    // Google tenta de novo mantendo as URLs que já conhece. Qualquer um dos
    // dois é melhor que publicar um sitemap sem imóveis, que se parece com uma
    // remoção em massa deliberada.
    throw error;
  }

  // A home e a listagem mudam quando o estoque muda, então herdam a data do
  // imóvel mais recente (a consulta já vem ordenada por updated_at desc).
  const inventoryDate = properties.length ? lastModified(properties[0]) : STATIC_CONTENT_DATE;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: inventoryDate, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/imoveis"), lastModified: inventoryDate, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/contato"), lastModified: STATIC_CONTENT_DATE, changeFrequency: "yearly", priority: 0.6 },
    {
      url: absoluteUrl("/politica-de-privacidade"),
      lastModified: STATIC_CONTENT_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((property) => ({
    url: absoluteUrl(`/imovel/${property.slug}`),
    lastModified: lastModified(property),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
