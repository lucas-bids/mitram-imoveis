import {
  FEED_LIMITS,
  LOT_AREA_TYPES,
  MIN_BEDROOMS_BY_TYPE,
  ROOMS_REQUIRED_TYPES,
  URL_SHORTENER_HOSTS,
  YOUTUBE_HOSTS,
} from "./limits";
import type { FeedMedia, FeedProperty } from "./types";

/**
 * Regras que o portal (OLX/ZAP/VivaReal) impõe a cada anúncio.
 *
 * Fonte única: o feed usa para decidir se omite um imóvel, o formulário do
 * painel usa para bloquear a publicação e a listagem do painel usa para
 * sinalizar imóveis publicados que estão fora do portal. Se cada um tivesse a
 * sua cópia, o painel aceitaria algo que o feed descartaria em silêncio.
 */

const { MIN_IMAGES, MIN_TITLE, MAX_TITLE, MIN_DESCRIPTION, MAX_DESCRIPTION } = FEED_LIMITS;

/** Campo do formulário ao qual o problema se refere; `media` são as fotos. */
export type FeedIssueField =
  | "internal_code"
  | "title"
  | "description"
  | "property_type_id"
  | "price"
  | "postal_code"
  | "neighborhood_id"
  | "city_id"
  | "state"
  | "total_area"
  | "private_area"
  | "bedrooms"
  | "bathrooms"
  | "youtube_url"
  | "virtual_tour_url"
  | "media";

export type FeedIssue = { field: FeedIssueField; message: string };

export type FeedRuleInput = {
  internal_code: string | null | undefined;
  title: string | null | undefined;
  description: string | null | undefined;
  purpose: "sale" | "rent";
  /** Valor em `property_types.olx_property_type`; null = tipo sem mapeamento. */
  olxPropertyType: string | null | undefined;
  price: number | null | undefined;
  postal_code: string | null | undefined;
  hasNeighborhood: boolean;
  hasCity: boolean;
  hasState: boolean;
  total_area: number | null | undefined;
  private_area: number | null | undefined;
  bedrooms: number | null | undefined;
  bathrooms: number | null | undefined;
  imageCount: number;
  youtube_url: string | null | undefined;
  virtual_tour_url: string | null | undefined;
};

/** Remove tags HTML e normaliza espaços. Title e Description não aceitam HTML. */
export function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Inteiro positivo, ou null. Preços e áreas do VrSync não aceitam decimais. */
export function positiveInt(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const rounded = Math.round(value);
  return Number.isFinite(rounded) && rounded > 0 ? rounded : null;
}

/**
 * Área que vai para o XML. `private_area` é a área útil; boa parte do acervo
 * só preencheu "área total", que entra como fallback. Um campo vazio no
 * formulário vira `0`, por isso o fallback é por valor positivo, não por null.
 */
export function feedArea(
  olxPropertyType: string,
  totalArea: number | null | undefined,
  privateArea: number | null | undefined,
): number | null {
  if (LOT_AREA_TYPES.has(olxPropertyType)) return positiveInt(totalArea);
  return positiveInt(privateArea) ?? positiveInt(totalArea);
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/** Problema no link do vídeo, se houver. Campo vazio é válido (é opcional). */
export function youtubeUrlIssue(value: string | null | undefined): string | null {
  if (!value) return null;
  const url = parseUrl(value);
  if (!url) return "Informe uma URL válida";
  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) {
    return "O OLX, ZAP e VivaReal só aceitam vídeo do YouTube";
  }
  return null;
}

/** Problema no link do tour virtual, se houver. Campo vazio é válido. */
export function virtualTourUrlIssue(value: string | null | undefined): string | null {
  if (!value) return null;
  const url = parseUrl(value);
  if (!url) return "Informe uma URL válida";
  if (url.protocol !== "https:") return "O tour virtual precisa usar HTTPS";
  if (URL_SHORTENER_HOSTS.has(url.hostname.toLowerCase().replace(/^www\./, ""))) {
    return "O tour virtual não pode usar encurtador de URL";
  }
  return null;
}

/** CEP com 8 dígitos, com ou sem máscara. */
export function isValidPostalCode(value: string | null | undefined): boolean {
  return (value ?? "").replace(/\D/g, "").length === 8;
}

/** Todos os problemas que impedem o imóvel de ir para o portal, em ordem. */
export function feedIssues(input: FeedRuleInput): FeedIssue[] {
  const issues: FeedIssue[] = [];
  const add = (field: FeedIssueField, message: string) => issues.push({ field, message });

  const title = plainText(input.title ?? "");
  const description = plainText(input.description ?? "");

  if (!input.internal_code) add("internal_code", "Informe o código do imóvel");
  if (title.length < MIN_TITLE || title.length > MAX_TITLE) {
    add("title", `Título com ${title.length} caracteres (exigido entre ${MIN_TITLE} e ${MAX_TITLE})`);
  }
  if (description.length < MIN_DESCRIPTION || description.length > MAX_DESCRIPTION) {
    add(
      "description",
      `Descrição com ${description.length} caracteres (exigido entre ${MIN_DESCRIPTION} e ${MAX_DESCRIPTION.toLocaleString("pt-BR")})`,
    );
  }

  const olxType = input.olxPropertyType;
  if (!olxType) add("property_type_id", "Este tipo de imóvel não tem correspondência no OLX, ZAP e VivaReal");

  if (!isValidPostalCode(input.postal_code)) add("postal_code", "Informe um CEP válido");
  if (!input.hasNeighborhood) add("neighborhood_id", "Selecione o bairro");
  if (!input.hasCity) add("city_id", "Selecione a cidade");
  if (!input.hasState) add("state", "Selecione o estado");

  if (input.imageCount < MIN_IMAGES) {
    add("media", `${input.imageCount} foto(s); o OLX, ZAP e VivaReal exigem ao menos ${MIN_IMAGES}`);
  }

  if (positiveInt(input.price) === null) {
    add("price", input.purpose === "sale" ? "Informe o preço de venda" : "Informe o valor do aluguel");
  }

  if (olxType) {
    if (feedArea(olxType, input.total_area, input.private_area) === null) {
      if (LOT_AREA_TYPES.has(olxType)) add("total_area", "Informe a área total do terreno");
      else add("private_area", "Informe a área privativa ou a área total");
    }

    if (ROOMS_REQUIRED_TYPES.has(olxType)) {
      const minBedrooms = MIN_BEDROOMS_BY_TYPE[olxType] ?? 0;
      if (input.bedrooms === null || input.bedrooms === undefined || input.bedrooms < minBedrooms) {
        add("bedrooms", minBedrooms > 0 ? `Informe ao menos ${minBedrooms} quarto` : "Informe o número de quartos");
      }
      if (input.bathrooms === null || input.bathrooms === undefined || input.bathrooms < 1) {
        add("bathrooms", "Informe o número de banheiros");
      }
    }
  }

  const youtubeIssue = youtubeUrlIssue(input.youtube_url);
  if (youtubeIssue) add("youtube_url", youtubeIssue);
  const tourIssue = virtualTourUrlIssue(input.virtual_tour_url);
  if (tourIssue) add("virtual_tour_url", tourIssue);

  return issues;
}

/**
 * Links opcionais: o formulário bloqueia a publicação com um link inválido,
 * mas o feed apenas omite o link em vez de derrubar o anúncio inteiro.
 */
const OMITTABLE_FIELDS: ReadonlySet<FeedIssueField> = new Set<FeedIssueField>(["youtube_url", "virtual_tour_url"]);

/** Motivo pelo qual o feed omite o imóvel, ou null se ele entra no arquivo. */
export function feedExclusionReason(input: FeedRuleInput): string | null {
  return feedIssues(input).find((issue) => !OMITTABLE_FIELDS.has(issue.field))?.message ?? null;
}

/** Campos de `FeedProperty` que as regras leem; a listagem do painel usa o mesmo recorte. */
export type FeedRuleProperty = Pick<
  FeedProperty,
  | "internal_code"
  | "title"
  | "description"
  | "purpose"
  | "price"
  | "postal_code"
  | "state"
  | "total_area"
  | "private_area"
  | "bedrooms"
  | "bathrooms"
  | "youtube_url"
  | "virtual_tour_url"
  | "property_types"
  | "neighborhoods"
  | "property_media"
>;

/** Só fotos de verdade: plantas baixas e PDFs não contam para o `<Media>`. */
export function imageMedia(media: FeedMedia[] | null): FeedMedia[] {
  return (media ?? [])
    .filter((item) => (item.media_type ?? "image") === "image" && !!item.public_url)
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);
}

export function ruleInputFromProperty(property: FeedRuleProperty): FeedRuleInput {
  return {
    internal_code: property.internal_code,
    title: property.title,
    description: property.description,
    purpose: property.purpose,
    olxPropertyType: property.property_types?.olx_property_type,
    price: property.price,
    postal_code: property.postal_code,
    hasNeighborhood: !!property.neighborhoods?.name,
    hasCity: !!property.neighborhoods?.cities?.name,
    hasState: !!(property.neighborhoods?.cities?.state || property.state),
    total_area: property.total_area,
    private_area: property.private_area,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    imageCount: imageMedia(property.property_media).length,
    youtube_url: property.youtube_url,
    virtual_tour_url: property.virtual_tour_url,
  };
}
