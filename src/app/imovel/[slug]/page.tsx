import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPropertyBySlug, getSimilarProperties } from "@/features/properties/queries";
import { coverImageUrl, propertyDescription } from "@/features/properties/format";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { absoluteUrl } from "@/lib/site";
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
  // Mesma consulta que a página faz, memoizada por `cache()`: um round trip só,
  // e a regra de elegibilidade não pode divergir entre metadata e página.
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return { title: "Imóvel não encontrado", robots: { index: false, follow: false } };
  }

  const path = `/imovel/${property.slug}`;
  const description = propertyDescription(property);
  const cover = coverImageUrl(property.property_media);
  // `coverImageUrl` cai num JPG local em retrato quando o imóvel não tem mídia,
  // e retrato corta mal em todo card social. Omitir `images` aqui faz herdar a
  // convenção `src/app/opengraph-image.jpg`, que é 1200×630.
  const hasRemoteCover = /^https?:\/\//i.test(cover);

  return {
    title: property.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      title: property.title,
      description,
      ...(hasRemoteCover
        ? { images: [{ url: cover, width: 1200, height: 630, alt: property.title }] }
        : {}),
    },
    twitter: { card: "summary_large_image" },
    // Vendido/alugado continua acessível (HTTP 200) e auto-canônico, mas fora do
    // índice e do sitemap: ninguém deve chegar do Google num imóvel que não pode
    // mais comprar. `follow` preserva o fluxo para os imóveis semelhantes.
    //
    // Publicado omite a chave em vez de defini-la como `undefined`, que
    // sobrescreveria o pai e apagaria o `max-image-preview: large` (importante
    // numa página de imóvel) e o noindex global dos deploy previews.
    ...(property.status === "published" ? {} : { robots: { index: false, follow: true } }),
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

  // Via `absoluteUrl`, nunca `${process.env.NEXT_PUBLIC_SITE_URL}`: a variável
  // ausente gravava a string literal `undefined/imovel/<slug>` tanto no JSON-LD
  // quanto no lead enviado ao Netlify Forms.
  const propertyUrl = absoluteUrl(`/imovel/${property.slug}`);

  return (
    <div className="bg-white min-h-screen">
      <PropertyJsonLd property={property} propertyUrl={propertyUrl} />

      <Container className="py-4 md:py-8">
        <Breadcrumbs
          className="mb-4"
          items={[
            { name: "Início", href: "/" },
            { name: "Imóveis", href: "/imoveis" },
            { name: property.title, href: `/imovel/${property.slug}` },
          ]}
        />

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
