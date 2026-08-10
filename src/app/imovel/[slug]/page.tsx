import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPropertyBySlug, getPropertyMetaBySlug, getSimilarProperties } from "@/features/properties/queries";
import Gallery from "@/features/properties/components/gallery/Gallery";
import SchedulingForm from "@/features/contact/components/SchedulingForm";
import { PropertyLocationMap } from "@/features/properties/components/detail/PropertyLocationMap";
import { MessageCircle } from "lucide-react";
import { buttonShapeClasses } from "@/components/ui/buttonStyles";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";

import { PropertyJsonLd } from "@/features/properties/components/detail/PropertyJsonLd";
import { PropertyHeading } from "@/features/properties/components/detail/PropertyHeading";
import { PropertySummary } from "@/features/properties/components/detail/PropertySummary";
import { PropertyFeatures } from "@/features/properties/components/detail/PropertyFeatures";
import { PropertyMediaLinks } from "@/features/properties/components/detail/PropertyMediaLinks";
import { PropertyPriceCard } from "@/features/properties/components/detail/PropertyPriceCard";
import { PropertySimilar } from "@/features/properties/components/detail/PropertySimilar";
import { SearchCta } from "@/features/properties/components/detail/SearchCta";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const property = await getPropertyMetaBySlug(params.slug);
  
  if (!property) return { title: "Imóvel não encontrado | Mitram Imóveis" };

  return {
    title: `${property.title} | Mitram Imóveis`,
    description: property.description?.substring(0, 160),
  };
}

export default async function PropertyDetailsPage({ params }: { params: { slug: string } }) {
  const property = await getPropertyBySlug(params.slug);

  if (!property) {
    notFound();
  }

  // Similar properties
  const similarProperties = await getSimilarProperties({
    id: property.id,
    property_type_id: property.property_type_id || "",
    purpose: property.purpose
  });

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5541996787173";
  const propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel/${property.slug}`;
  const whatsappMessage = encodeURIComponent(`Olá, gostaria de saber mais sobre o imóvel: ${property.title}. Link: ${propertyUrl}`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

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
            <div className="sticky top-24 space-y-4 md:space-y-6">
              <PropertyPriceCard property={property} whatsappLink={whatsappLink} />

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonShapeClasses("lg", "w-full bg-mitram-whatsapp text-white shadow-md hover:bg-mitram-whatsappDark")}
              >
                <MessageCircle size={20} />
                Conversar pelo WhatsApp
              </a>

              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                <Heading as="h3" variant="h3" className="mb-3 md:mb-4">Agendar Visita / Mais Informações</Heading>
                <SchedulingForm propertyTitle={property.title} propertyUrl={propertyUrl} />
              </div>
            </div>
          </div>
        </div>

        <PropertySimilar properties={similarProperties} />
        <SearchCta />
      </Container>
    </div>
  );
}
