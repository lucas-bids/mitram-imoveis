/**
 * Limites que o feed VrSync (OLX/ZAP/VivaReal) impõe a cada anúncio.
 *
 * Vivem aqui, e não em `vrsync.ts`, porque o cadastro no painel valida os
 * mesmos números (`propertySchema`, upload de fotos). Se as cópias
 * divergissem, o painel aceitaria um imóvel que o feed depois descartaria.
 */
export const FEED_LIMITS = {
  MIN_IMAGES: 5,
  MIN_TITLE: 10,
  MAX_TITLE: 100,
  MIN_DESCRIPTION: 50,
  MAX_DESCRIPTION: 3000,
} as const;

/** Tipos cuja área relevante é a do lote (`LotArea`), não a área útil. */
export const LOT_AREA_TYPES: ReadonlySet<string> = new Set([
  "Residential / Land Lot",
  "Residential / Farm Ranch",
  "Residential / Agricultural",
  "Commercial / Land Lot",
  "Commercial / Industrial",
]);

/**
 * Tipos residenciais em que o portal exige `Bedrooms` e `Bathrooms`. Kitnet
 * fica de fora de propósito: a doc aceita quartos = 0 (default) para ela.
 */
export const ROOMS_REQUIRED_TYPES: ReadonlySet<string> = new Set([
  "Residential / Apartment",
  "Residential / Home",
  "Residential / Condo",
  "Residential / Penthouse",
  "Residential / Loft",
  "Residential / Studio",
  "Residential / Flat",
  "Residential / Village House",
  "Residential / Sobrado",
]);

/** Studio precisa declarar ao menos um quarto. */
export const MIN_BEDROOMS_BY_TYPE: Readonly<Record<string, number>> = {
  "Residential / Studio": 1,
};

/** O único vídeo aceito no `<Media>` é do YouTube. */
export const YOUTUBE_HOSTS: ReadonlySet<string> = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

/** `VirtualTourLink` não pode ser encurtador de URL. Lista dos mais comuns. */
export const URL_SHORTENER_HOSTS: ReadonlySet<string> = new Set([
  "bit.ly",
  "tinyurl.com",
  "goo.gl",
  "t.co",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rebrand.ly",
  "shorturl.at",
  "encurtador.com.br",
]);
