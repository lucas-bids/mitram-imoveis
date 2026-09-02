import { jsonLdProps } from "@/lib/jsonLd";
import { SITE, SITE_URL, absoluteUrl } from "@/lib/site";

/** `@id` do nó da imobiliária, referenciado pelo JSON-LD dos imóveis. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Entidade única do negócio, renderizada uma vez pelo layout raiz.
 *
 * Só entra aqui informação verificada e visível no site — o endereço aparece no
 * rodapé e na página de contato, o telefone e o e-mail idem. `postalCode` segue
 * omitido enquanto o CEP não for confirmado: `serializeJsonLd` remove o que for
 * nulo, então nada é declarado vazio.
 */
export function OrganizationJsonLd() {
  const graph = [
    {
      "@type": "RealEstateAgent",
      "@id": ORGANIZATION_ID,
      name: SITE.name,
      legalName: SITE.legalName,
      url: SITE_URL,
      description: SITE.description,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SITE.logo.path),
        width: SITE.logo.width,
        height: SITE.logo.height,
      },
      image: absoluteUrl(SITE.ogImage),
      telephone: SITE.phone.e164,
      email: SITE.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address.street,
        postalCode: SITE.address.postalCode,
        addressLocality: SITE.address.locality,
        addressRegion: SITE.address.region,
        addressCountry: SITE.address.country,
      },
      areaServed: {
        "@type": "City",
        name: SITE.address.locality,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: SITE.openingHours.days,
          opens: SITE.openingHours.opens,
          closes: SITE.openingHours.closes,
        },
      ],
      // `taxID` é o campo certo para o CNPJ. Já o CRECI é registro
      // profissional, não fiscal: vai em `identifier`, não em `taxID`, e nunca
      // enfiado na description só para aparecer em algum lugar.
      taxID: SITE.cnpj,
      identifier: {
        "@type": "PropertyValue",
        name: "CRECI",
        value: SITE.creci,
      },
      sameAs: [SITE.social.instagram],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE.name,
      url: SITE_URL,
      inLanguage: SITE.lang,
      publisher: { "@id": ORGANIZATION_ID },
      // Sem `SearchAction`: o Google aposentou a sitelinks searchbox no fim de
      // 2024, então seria peso morto.
    },
  ];

  return <script {...jsonLdProps({ "@context": "https://schema.org", "@graph": graph })} />;
}
