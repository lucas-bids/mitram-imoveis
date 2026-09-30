/**
 * Limites que o feed VrSync (OLX/ZAP/VivaReal) impõe a cada anúncio.
 *
 * Vivem aqui, e não em `vrsync.ts`, porque o painel admin precisa dos mesmos
 * números para avisar o corretor *antes* de a carga ir para o portal. Se as
 * duas cópias divergissem, o painel diria que está tudo certo e o imóvel
 * sumiria do OLX sem explicação.
 */
export const FEED_LIMITS = {
  MIN_IMAGES: 5,
  MIN_TITLE: 10,
  MAX_TITLE: 100,
  MIN_DESCRIPTION: 50,
  MAX_DESCRIPTION: 3000,
} as const;

/** O que o painel sabe sobre um imóvel sem carregar o registro inteiro. */
export type AdminFeedInput = {
  status: string;
  olx_enabled: boolean;
  title: string | null;
  description: string | null;
  image_count: number;
  olx_property_type: string | null;
};

export type AdminFeedStatus =
  | { state: "enviado" }
  | { state: "desativado" }
  | { state: "nao-publicado" }
  | { state: "bloqueado"; reason: string };

/**
 * Por que este imóvel está (ou não está) indo para os portais.
 *
 * Só cobre o que dá para checar a partir da listagem — preço, CEP e área são
 * validados na geração do feed (`vrsync.ts`). O objetivo aqui é pegar os três
 * motivos que de longe mais acontecem: poucas fotos, descrição curta e tipo
 * sem mapeamento.
 */
export function adminFeedStatus(property: AdminFeedInput): AdminFeedStatus {
  if (!property.olx_enabled) return { state: "desativado" };
  if (property.status !== "published") return { state: "nao-publicado" };

  const title = (property.title ?? "").trim();
  const description = (property.description ?? "").trim();

  if (property.image_count < FEED_LIMITS.MIN_IMAGES) {
    return {
      state: "bloqueado",
      reason: `${property.image_count} de ${FEED_LIMITS.MIN_IMAGES} fotos`,
    };
  }
  if (description.length < FEED_LIMITS.MIN_DESCRIPTION) {
    return { state: "bloqueado", reason: "descrição curta" };
  }
  if (description.length > FEED_LIMITS.MAX_DESCRIPTION) {
    return { state: "bloqueado", reason: "descrição longa" };
  }
  if (title.length < FEED_LIMITS.MIN_TITLE || title.length > FEED_LIMITS.MAX_TITLE) {
    return { state: "bloqueado", reason: "título fora de 10-100 caracteres" };
  }
  if (!property.olx_property_type) {
    return { state: "bloqueado", reason: "tipo sem mapeamento OLX" };
  }

  return { state: "enviado" };
}
