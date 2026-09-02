import { PropertyDetail } from "@/features/properties/types";
import { propertyDescription } from "@/features/properties/format";
import { ORGANIZATION_ID } from "@/components/seo/OrganizationJsonLd";
import { jsonLdProps } from "@/lib/jsonLd";
import { SITE } from "@/lib/site";

/** minúsculas e sem acento, para casar rótulos vindos do painel. */
function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const APARTMENT_TERMS = ["apartamento", "cobertura", "flat", "kitnet", "studio"];
const HOUSE_TERMS = ["casa", "sobrado", "chacara", "sitio"];
// Terreno e sala comercial não têm tipo de acomodação honesto no schema.org, e
// inventar um só para render marcação seria pior que omitir.
const NON_ACCOMMODATION_TERMS = ["terreno", "lote", "sala", "galpao", "comercial"];

function accommodationType(propertyTypeName: string | undefined): string | null {
  if (!propertyTypeName) return "Accommodation";
  const name = normalize(propertyTypeName);
  if (APARTMENT_TERMS.some((term) => name.includes(term))) return "Apartment";
  if (HOUSE_TERMS.some((term) => name.includes(term))) return "House";
  if (NON_ACCOMMODATION_TERMS.some((term) => name.includes(term))) return null;
  return "Accommodation";
}

const AVAILABILITY: Record<string, string> = {
  published: "https://schema.org/InStock",
  sold: "https://schema.org/SoldOut",
  rented: "https://schema.org/OutOfStock",
};

/**
 * `RealEstateListing` é subtipo de `WebPage` (Thing > CreativeWork > WebPage >
 * RealEstateListing), então quartos, área, endereço e geo não pertencem ao
 * anúncio: pertencem ao nó `Accommodation` pendurado em `about`.
 *
 * Só entra aqui dado verdadeiro e visível na página. `serializeJsonLd` remove o
 * que for nulo, então campo ausente é campo omitido — nunca declarado vazio.
 */
export function PropertyJsonLd({ property, propertyUrl }: { property: PropertyDetail; propertyUrl: string }) {
  const city = property.neighborhoods?.cities;
  const streetAddress = [property.street, property.number].filter(Boolean).join(", ") || null;

  const type = accommodationType(property.property_types?.name);
  const about = type
    ? {
        "@type": type,
        name: property.title,
        address: {
          "@type": "PostalAddress",
          streetAddress,
          addressLocality: city?.name ?? SITE.address.locality,
          addressRegion: city?.state ?? SITE.address.region,
          postalCode: property.postal_code,
          addressCountry: SITE.address.country,
        },
        geo:
          property.latitude != null && property.longitude != null
            ? {
                "@type": "GeoCoordinates",
                latitude: Number(property.latitude),
                longitude: Number(property.longitude),
              }
            : null,
        numberOfBedrooms: property.bedrooms,
        numberOfBathroomsTotal: property.bathrooms,
        numberOfRooms: property.bedrooms,
        floorSize: property.total_area
          ? { "@type": "QuantitativeValue", value: property.total_area, unitCode: "MTK" }
          : null,
      }
    : null;

  // Sem preço, `formatPrice` mostra "Consulte" — então a oferta é omitida
  // inteira em vez de declarar `price: null`.
  const offers = property.price
    ? {
        "@type": "Offer",
        url: propertyUrl,
        price: property.price,
        priceCurrency: "BRL",
        businessFunction:
          property.purpose === "rent"
            ? "https://schema.org/LeaseOut"
            : "https://schema.org/Sell",
        availability: AVAILABILITY[property.status] ?? null,
        seller: { "@id": ORGANIZATION_ID },
      }
    : null;

  const images = (property.property_media ?? [])
    .filter((media) => media.media_type === undefined || media.media_type === "image")
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
    .map((media) => media.public_url);

  return (
    <script
      {...jsonLdProps({
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "@id": propertyUrl,
        url: propertyUrl,
        name: property.title,
        description: propertyDescription(property),
        inLanguage: SITE.lang,
        datePosted: property.published_at ?? property.created_at,
        image: images,
        provider: { "@id": ORGANIZATION_ID },
        about,
        offers,
      })}
    />
  );
}
