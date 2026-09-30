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
