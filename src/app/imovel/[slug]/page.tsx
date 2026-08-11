import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPropertyBySlug, getPropertyMetaBySlug, getSimilarProperties } from "@/features/properties/queries";
import Gallery from "@/features/properties/components/gallery/Gallery";
import { PropertyLocationMap } from "@/features/properties/components/detail/PropertyLocationMap";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";

import { PropertyJsonLd } from "@/features/properties/components/detail/PropertyJsonLd";
import { PropertyHeading } from "@/features/properties/components/detail/PropertyHeading";
import { PropertySummary } from "@/features/properties/components/detail/PropertySummary";
import { PropertyFeatures } from "@/features/properties/components/detail/PropertyFeatures";
import { PropertyMediaLinks } from "@/features/properties/components/detail/PropertyMediaLinks";
import { PropertyCtaCard } from "@/features/properties/components/detail/PropertyCtaCard";
import { PropertySimilar } from "@/features/properties/components/detail/PropertySimilar";
import { SearchCta } from "@/features/properties/components/detail/SearchCta";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyMetaBySlug(slug);
  
  if (!property) return { title: "Imóvel não encontrado | Mitram Imóveis" };

  return {
    title: `${property.title} | Mitram Imóveis`,
    description: property.description?.substring(0, 160),
  };
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  // Similar properties
  const similarProperties = await getSimilarProperties({
    id: property.id,
    property_type_id: property.property_type_id || "",
    purpose: property.purpose
  });

  const propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel/${property.slug}`;

  return (
    <div className="bg-white min-h-screen">
      <PropertyJsonLd property={property} propertyUrl={propertyUrl} />

      <Container className="py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <Gallery media={property.property_media?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <PropertyHeading property={property} />
            <PropertySummary property={property} />

            <div>
              <Heading as="h2" variant="h4" className="mb-3 md:mb-4">Descrição</Heading>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {property.description}
              </div>
            </div>

            <PropertyFeatures property={property} />
            <PropertyMediaLinks property={property} />

            {property.latitude && property.longitude && (
              <div>
                <Heading as="h2" variant="h4" className="mb-3 md:mb-4">Localização</Heading>
                <div className="h-[320px] md:h-[400px] w-full rounded overflow-hidden border">
                  <PropertyLocationMap latitude={Number(property.latitude)} longitude={Number(property.longitude)} />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PropertyCtaCard property={property} propertyUrl={propertyUrl} />
            </div>
          </div>
        </div>

        <PropertySimilar properties={similarProperties} />
        <SearchCta />
      </Container>
    </div>
  );
}
