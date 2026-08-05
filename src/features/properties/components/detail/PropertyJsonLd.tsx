import { PropertyDetail } from "@/features/properties/types";

export function PropertyJsonLd({ property, propertyUrl }: { property: PropertyDetail, propertyUrl: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": property.title,
          "description": property.description,
          "url": propertyUrl,
          "offers": {
            "@type": "Offer",
            "price": property.price,
            "priceCurrency": "BRL"
          }
        })
      }}
    />
  );
}
