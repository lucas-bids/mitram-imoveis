import type { DisplayAddress, IptuPeriod, PropertyPurpose } from "@/features/properties/types";

/** Uma foto do imóvel, já no formato que o `<Media>` do VrSync consome. */
export type FeedMedia = {
  public_url: string;
  is_cover: boolean;
  sort_order: number;
  media_type: string | null;
  alt_text: string | null;
};

/**
 * O que a consulta do feed devolve por imóvel. É um recorte proposital de
 * `properties`: só os campos que viram XML, mais os mapeamentos OLX das
 * tabelas de apoio.
 */
export type FeedProperty = {
  id: string;
  internal_code: string;
  title: string;
  slug: string;
  purpose: PropertyPurpose;
  price: number | null;
  condominium_fee: number | null;
  iptu: number | null;
  iptu_period: IptuPeriod;
  description: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  state: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  display_address: DisplayAddress;
  total_area: number | null;
  private_area: number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  floor: number | null;
  building_floors: number | null;
  year_built: number | null;
  furnished: boolean | null;
  youtube_url: string | null;
  virtual_tour_url: string | null;
  property_types: {
    name: string;
    olx_property_type: string | null;
    olx_usage_type: string | null;
  } | null;
  neighborhoods: {
    name: string;
    cities: { name: string; state: string } | null;
  } | null;
  property_media: FeedMedia[] | null;
  property_features: { features: { olx_code: string | null } | null }[] | null;
};

/**
 * Por que um imóvel publicado não entrou no arquivo. Serve tanto
 * para o log da rota quanto para explicar a ausência a quem cadastrou.
 */
export type FeedExclusion = {
  internal_code: string;
  title: string;
  reason: string;
};

export type FeedBuildResult = {
  xml: string;
  included: number;
  excluded: FeedExclusion[];
};
