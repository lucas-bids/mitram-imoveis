import { PropertyPurpose, PropertyStatus, PropertyMedia } from "./types";

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
