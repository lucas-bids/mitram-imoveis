import { PropertyPurpose, PropertyStatus, PropertyMedia, PropertyDetail } from "./types";

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "Consulte";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export function purposeLabel(purpose: PropertyPurpose | string | undefined): string {
  if (purpose === "sale") return "Venda";
  if (purpose === "rent") return "Aluguel";
  return String(purpose);
}

export function statusLabel(status: PropertyStatus | string | undefined): string {
  switch (status) {
    case "published": return "Publicado";
    case "draft": return "Rascunho";
    case "sold": return "Vendido";
    case "rented": return "Alugado";
    case "archived": return "Arquivado";
    case "trashed": return "Lixeira";
    default: return String(status);
  }
}

export function coverImageUrl(media: PropertyMedia[] | null | undefined): string {
  if (!media || media.length === 0) return "/images/keys-on-table.jpg";
  const cover = media.find(m => m.is_cover);
  if (cover) return cover.public_url;
  return media[0].public_url;
}

export function locationLabel(neighborhoods: { name: string; cities: { name: string } | null } | null | undefined): string {
  if (!neighborhoods) return "Localização não informada";
  const city = neighborhoods.cities?.name ? `, ${neighborhoods.cities.name}` : "";
  return `${neighborhoods.name}${city}`;
}

const META_DESCRIPTION_LIMIT = 155;

/** Corta no último limite de palavra antes de `limit`, sem partir palavra ao meio. */
function truncateAtWord(text: string, limit = META_DESCRIPTION_LIMIT): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  const slice = clean.slice(0, limit);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 40 ? slice.slice(0, lastSpace) : slice).replace(/[\s,;.–-]+$/, "")}…`;
}

/**
 * Meta description do imóvel, com fallback determinístico.
 *
 * A mesma string alimenta `description`, `og:description` e o JSON-LD, para que
 * o que o Google lê e o que as redes sociais mostram não divirjam.
 */
export function propertyDescription(property: PropertyDetail): string {
  if (property.description?.trim()) return truncateAtWord(property.description);

  const type = property.property_types?.name ?? "Imóvel";
  const parts: string[] = [`${type} para ${purposeLabel(property.purpose).toLowerCase()}`];

  if (property.neighborhoods) parts.push(`em ${locationLabel(property.neighborhoods)}`);

  const attributes: string[] = [];
  if (property.bedrooms) attributes.push(`${property.bedrooms} quarto${property.bedrooms > 1 ? "s" : ""}`);
  if (property.bathrooms) attributes.push(`${property.bathrooms} banheiro${property.bathrooms > 1 ? "s" : ""}`);
  if (property.parking_spaces) attributes.push(`${property.parking_spaces} vaga${property.parking_spaces > 1 ? "s" : ""}`);
  if (property.total_area) attributes.push(`${property.total_area} m²`);

  const head = parts.join(" ");
  const body = attributes.length ? `${head} — ${attributes.join(", ")}.` : `${head}.`;
  return truncateAtWord(`${body} ${formatPrice(property.price)}.`);
}
