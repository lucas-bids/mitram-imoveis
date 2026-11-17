/**
 * Bucket das fotos dos imóveis. Fica num módulo sem dependências para poder
 * ser importado tanto pelo upload (cliente) quanto pelas server actions —
 * `components/media/mutations.ts` puxa o client do navegador.
 */
export const PROPERTY_IMAGES_BUCKET = "property-images";
