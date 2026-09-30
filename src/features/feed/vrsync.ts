import { SITE, SITE_URL, absoluteUrl } from "@/lib/site";
import { BRAZILIAN_STATES } from "@/features/admin/properties/components/address/states";
import { FEED_LIMITS } from "./eligibility";
import type { FeedBuildResult, FeedExclusion, FeedMedia, FeedProperty } from "./types";

/**
 * Gera o XML no formato VrSync consumido por OLX, ZAP e VivaReal.
 *
 * Regras que vêm da doc do GrupoZap (ver a skill `olx-zap-feed`):
 * - Title 10-100 caracteres, Description 50-3.000, ambos sem HTML cru.
 * - Mínimo de 5 imagens, só JPG, no máximo uma marcada como `primary`.
 * - No máximo um vídeo, e só do YouTube.
 * - Preços e áreas são inteiros, sem separador nem símbolo de moeda.
 * - PropertyType e Feature são enums fechados: valor fora da lista é erro, por
 *   isso eles vêm mapeados do banco em vez de serem traduzidos aqui.
 *
 * Um imóvel que não atende a alguma regra é **omitido**, nunca emitido
 * inválido: um anúncio quebrado derruba a nota de qualidade da carga inteira.
 */

const { MIN_IMAGES, MIN_TITLE, MAX_TITLE, MIN_DESCRIPTION, MAX_DESCRIPTION } = FEED_LIMITS;

/** Tipos cuja área relevante é a do lote, não a área útil. */
const LOT_AREA_TYPES = new Set([
  "Residential / Land Lot",
  "Residential / Farm Ranch",
  "Residential / Agricultural",
  "Commercial / Land Lot",
  "Commercial / Industrial",
]);

const STATE_NAMES = new Map<string, string>(BRAZILIAN_STATES.map(([uf, name]) => [uf, name]));

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Envolve em CDATA. `]]>` dentro do conteúdo encerraria a seção no meio — a
 * saída padrão é quebrar em duas seções, que é o jeito correto de escapar isso.
 */
function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

/** Remove tags HTML e normaliza espaços. Title e Description não aceitam HTML. */
function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Inteiro positivo, ou null. Preços e áreas do VrSync não aceitam decimais. */
function positiveInt(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const rounded = Math.round(value);
  return Number.isFinite(rounded) && rounded > 0 ? rounded : null;
}

/** Inteiro >= 0, ou null. Para contagens, onde `0` é uma resposta válida. */
function countInt(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const rounded = Math.round(value);
  return Number.isFinite(rounded) && rounded >= 0 ? rounded : null;
}

function tag(name: string, value: string | number | null, attrs = ""): string {
  if (value === null || value === "") return "";
  return `<${name}${attrs}>${value}</${name}>`;
}

/** Só fotos de verdade: plantas baixas e PDFs não podem ir para `<Media>`. */
function imageMedia(media: FeedMedia[] | null): FeedMedia[] {
  return (media ?? [])
    .filter((item) => (item.media_type ?? "image") === "image" && !!item.public_url)
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);
}

function locationBlock(property: FeedProperty): string {
  const city = property.neighborhoods?.cities;
  const uf = (city?.state || property.state || "").toUpperCase();
  const stateName = STATE_NAMES.get(uf) ?? uf;

  const parts = [
    `<Country abbreviation="BR">Brasil</Country>`,
    `<State abbreviation="${escapeXml(uf)}">${cdata(stateName)}</State>`,
    `<City>${cdata(city?.name ?? "")}</City>`,
    `<Neighborhood>${cdata(property.neighborhoods?.name ?? "")}</Neighborhood>`,
    `<PostalCode>${escapeXml(property.postal_code ?? "")}</PostalCode>`,
  ];

  if (property.street) parts.push(`<Address>${cdata(property.street)}</Address>`);
  if (property.number) parts.push(`<StreetNumber>${cdata(property.number)}</StreetNumber>`);
  if (property.complement) parts.push(`<Complement>${cdata(property.complement)}</Complement>`);
  if (property.latitude !== null) parts.push(tag("Latitude", property.latitude));
  if (property.longitude !== null) parts.push(tag("Longitude", property.longitude));

  return `<Location displayAddress="${property.display_address}">${parts.join("")}</Location>`;
}

function mediaBlock(property: FeedProperty, images: FeedMedia[]): string {
  const items: string[] = [];

  // Um vídeo por imóvel, no máximo, e antes das fotos (como nos exemplos da doc).
  if (property.youtube_url) {
    items.push(`<Item medium="video">${escapeXml(property.youtube_url)}</Item>`);
  }

  images.forEach((image, index) => {
    // `primary` marca a foto de destaque e só pode existir uma. A ordenação já
    // colocou a capa em primeiro.
    const primary = index === 0 ? ` primary="true"` : "";
    const caption = image.alt_text ? ` caption="${escapeXml(image.alt_text)}"` : "";
    items.push(`<Item medium="image"${caption}${primary}>${escapeXml(image.public_url)}</Item>`);
  });

  return `<Media>${items.join("")}</Media>`;
}

function contactInfoBlock(): string {
  // `Location` é opcional dentro de ContactInfo e exigiria separar bairro do
  // logradouro, que em `SITE.address.street` vêm na mesma linha. Fica de fora.
  return [
    "<ContactInfo>",
    `<Name>${cdata(SITE.name)}</Name>`,
    `<Email>${escapeXml(SITE.email)}</Email>`,
    `<Website>${escapeXml(SITE_URL)}</Website>`,
    `<Logo>${escapeXml(absoluteUrl(SITE.logo.path))}</Logo>`,
    `<Telephone>${escapeXml(SITE.phone.display)}</Telephone>`,
    "</ContactInfo>",
  ].join("");
}

function featureList(property: FeedProperty): string[] {
  const codes = new Set<string>();

  for (const entry of property.property_features ?? []) {
    const code = entry.features?.olx_code;
    // Característica sem mapeamento é apenas omitida: o portal rejeitaria um
    // valor fora da lista fechada dele.
    if (code) codes.add(code);
  }

  if (property.furnished) codes.add("Furnished");

  return Array.from(codes);
}

function detailsBlock(property: FeedProperty, olxPropertyType: string): string {
  const parts: string[] = [];
  const price = positiveInt(property.price);

  if (property.purpose === "sale") {
    parts.push(tag("ListPrice", price, ` currency="BRL"`));
  } else {
    parts.push(tag("RentalPrice", price, ` currency="BRL" period="Monthly"`));
  }

  parts.push(tag("Iptu", positiveInt(property.iptu), ` currency="BRL" period="${property.iptu_period}"`));
  // `0` é significativo aqui: quer dizer condomínio isento.
  parts.push(tag("PropertyAdministrationFee", countInt(property.condominium_fee), ` currency="BRL"`));

  parts.push(`<Description>${cdata(plainText(property.description ?? ""))}</Description>`);
  parts.push(`<PropertyType>${escapeXml(olxPropertyType)}</PropertyType>`);

  const usageType = property.property_types?.olx_usage_type;
  if (usageType) parts.push(tag("UsageType", escapeXml(usageType)));

  if (LOT_AREA_TYPES.has(olxPropertyType)) {
    parts.push(tag("LotArea", positiveInt(property.total_area), ` unit="square metres"`));
  } else {
    // `private_area` é a área útil. Boa parte do acervo só preencheu "área
    // total", então ela entra como fallback — sem isso esses imóveis sairiam
    // sem nenhuma área, o que o portal recusa.
    parts.push(
      tag("LivingArea", positiveInt(property.private_area ?? property.total_area), ` unit="square metres"`),
    );
  }

  parts.push(tag("Bedrooms", countInt(property.bedrooms)));
  parts.push(tag("Bathrooms", countInt(property.bathrooms)));
  parts.push(tag("Suites", countInt(property.suites)));
  parts.push(tag("Garage", countInt(property.parking_spaces)));
  parts.push(tag("Floors", positiveInt(property.building_floors)));
  parts.push(tag("UnitFloor", countInt(property.floor)));
  parts.push(tag("YearBuilt", positiveInt(property.year_built)));

  const features = featureList(property);
  if (features.length) {
    parts.push(`<Features>${features.map((code) => `<Feature>${escapeXml(code)}</Feature>`).join("")}</Features>`);
  }

  return `<Details>${parts.filter(Boolean).join("")}</Details>`;
}

/**
 * Motivo pelo qual o imóvel não pode virar `<Listing>`, ou null se puder.
 * Todas as checagens são regras do portal, não preferências nossas.
 */
function rejectionReason(property: FeedProperty, images: FeedMedia[]): string | null {
  const title = plainText(property.title ?? "");
  const description = plainText(property.description ?? "");

  if (!property.internal_code) return "sem código interno (ListingID)";
  if (title.length < MIN_TITLE || title.length > MAX_TITLE) {
    return `título com ${title.length} caracteres (exigido entre ${MIN_TITLE} e ${MAX_TITLE})`;
  }
  if (description.length < MIN_DESCRIPTION || description.length > MAX_DESCRIPTION) {
    return `descrição com ${description.length} caracteres (exigido entre ${MIN_DESCRIPTION} e ${MAX_DESCRIPTION})`;
  }
  if (!property.property_types?.olx_property_type) {
    return `tipo "${property.property_types?.name ?? "?"}" sem mapeamento OLX (property_types.olx_property_type)`;
  }
  if (!property.postal_code) return "sem CEP";
  if (!property.neighborhoods?.name) return "sem bairro";
  if (!property.neighborhoods?.cities?.name) return "sem cidade";
  if (!(property.neighborhoods?.cities?.state || property.state)) return "sem estado";
  if (images.length < MIN_IMAGES) {
    return `${images.length} foto(s); o portal exige ao menos ${MIN_IMAGES}`;
  }
  if (positiveInt(property.price) === null) {
    return property.purpose === "sale" ? "sem preço de venda" : "sem valor de aluguel";
  }

  const olxType = property.property_types.olx_property_type;
  const area = LOT_AREA_TYPES.has(olxType)
    ? positiveInt(property.total_area)
    : positiveInt(property.private_area ?? property.total_area);
  if (area === null) return "sem área informada";

  return null;
}

function listingXml(property: FeedProperty, images: FeedMedia[]): string {
  const olxPropertyType = property.property_types!.olx_property_type!;
  const transactionType = property.purpose === "sale" ? "For Sale" : "For Rent";

  const parts = [
    `<ListingID>${escapeXml(property.internal_code)}</ListingID>`,
    `<Title>${cdata(plainText(property.title))}</Title>`,
    `<TransactionType>${transactionType}</TransactionType>`,
    locationBlock(property),
    mediaBlock(property, images),
    contactInfoBlock(),
    // Não documentado na página de referência do Listing, mas presente em todos
    // os exemplos oficiais. Só um link de volta para a origem.
    `<DetailViewUrl>${escapeXml(absoluteUrl(`/imovel/${property.slug}`))}</DetailViewUrl>`,
  ];

  if (property.virtual_tour_url) {
    parts.push(`<VirtualTourLink>${escapeXml(property.virtual_tour_url)}</VirtualTourLink>`);
  }

  parts.push(detailsBlock(property, olxPropertyType));

  return `<Listing>${parts.join("")}</Listing>`;
}

function headerXml(publishDate: Date): string {
  // O formato é YYYY-MM-DDTHH:MM:SS, sem fuso.
  const timestamp = publishDate.toISOString().slice(0, 19);

  return [
    "<Header>",
    `<Provider>${cdata(SITE.name)}</Provider>`,
    `<Email>${escapeXml(SITE.email)}</Email>`,
    `<ContactName>${cdata(SITE.legalName)}</ContactName>`,
    `<PublishDate>${timestamp}</PublishDate>`,
    `<Telephone>${escapeXml(SITE.phone.display)}</Telephone>`,
    "</Header>",
  ].join("");
}

export function buildVrSyncFeed(properties: FeedProperty[], now = new Date()): FeedBuildResult {
  const listings: string[] = [];
  const excluded: FeedExclusion[] = [];

  for (const property of properties) {
    const images = imageMedia(property.property_media);
    const reason = rejectionReason(property, images);

    if (reason) {
      excluded.push({ internal_code: property.internal_code, title: property.title, reason });
      continue;
    }

    try {
      listings.push(listingXml(property, images));
    } catch (error) {
      // Um imóvel malformado nunca pode derrubar o arquivo inteiro: uma carga
      // que falha inteira é muito pior do que uma que sai com um anúncio a
      // menos.
      excluded.push({
        internal_code: property.internal_code,
        title: property.title,
        reason: `erro ao gerar o anúncio: ${error instanceof Error ? error.message : "desconhecido"}`,
      });
    }
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"` +
    ` xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"` +
    ` xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">` +
    headerXml(now) +
    `<Listings>${listings.join("")}</Listings>` +
    `</ListingDataFeed>`;

  return { xml, included: listings.length, excluded };
}
