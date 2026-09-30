import { createStaticClient } from "@/lib/supabase/static";
import { FEED_RULE_FIELDS } from "@/features/properties/queries";
import { logError } from "@/lib/logger";
import type { FeedProperty } from "./types";

/** Teto de anúncios por arquivo XML imposto pelo GrupoZap. */
export const FEED_MAX_LISTINGS = 50000;

/**
 * Imóveis elegíveis ao feed dos portais: todo imóvel publicado.
 *
 * O XML é a única fonte de anúncios do portal — a carga substitui tudo o que
 * existe lá —, então não há seleção por imóvel.
 *
 * O filtro é `status = 'published'` e **não** `PUBLIC_STATUSES`. Imóveis
 * vendidos e alugados continuam visíveis no site, mas não podem seguir
 * anunciados no portal. A policy anônima deixa os três passarem, então o
 * filtro precisa estar aqui.
 *
 * Usa `createStaticClient()` pelo mesmo motivo do sitemap: sem `cookies()`, a
 * rota continua cacheável.
 */
export async function getFeedProperties(): Promise<FeedProperty[]> {
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from("properties")
    .select(`
      id, slug, condominium_fee, iptu, iptu_period, street, number,
      complement, latitude, longitude, display_address, suites,
      parking_spaces, floor, building_floors, year_built, furnished,
      ${FEED_RULE_FIELDS},
      property_features (features (olx_code))
    `)
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(FEED_MAX_LISTINGS);

  if (error) {
    logError("feed/getFeedProperties", error);
    throw error;
  }

  return (data ?? []) as unknown as FeedProperty[];
}
