import type { Metadata } from "next";
import PropertyCard from "@/features/properties/components/PropertyCard";
import AdvancedFilters from "@/features/search/components/AdvancedFilters";
import PropertiesMap from "@/features/properties/components/PropertiesMap";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heading } from "@/components/ui/Heading";
import { PropertyListItem } from "@/features/properties/types";
import { getFilterLookups, getPublicProperties } from "@/features/properties/queries";
import { hasActiveFacets } from "@/features/search/filters";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const LISTING_TITLE = "Imóveis à venda e para alugar em Curitiba";
const LISTING_DESCRIPTION =
  "Casas, apartamentos e terrenos disponíveis em Curitiba e região. Filtre por bairro, tipo, número de quartos e faixa de preço.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;

  return {
    title: LISTING_TITLE,
    description: LISTING_DESCRIPTION,
    // Sempre a URL nua: toda variação facetada aponta para cá.
    alternates: { canonical: "/imoveis" },
    openGraph: {
      url: absoluteUrl("/imoveis"),
      title: LISTING_TITLE,
      description: LISTING_DESCRIPTION,
    },
    // As URLs filtradas continuam rastreáveis (nada de Disallow no robots.txt),
    // justamente para que o crawler consiga ler este noindex. `follow` mantém o
    // fluxo de links para as páginas de imóvel.
    //
    // A chave é omitida — e não definida como `undefined` — quando não há
    // filtro: `robots: undefined` sobrescreve o pai, o que apagaria tanto o
    // `max-image-preview: large` quanto o noindex global dos deploy previews.
    ...(hasActiveFacets(resolvedSearchParams) ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const lookups = await getFilterLookups();
  const properties = await getPublicProperties(resolvedSearchParams);

  const isMapView = resolvedSearchParams.view === 'map';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Container className="pt-6 pb-4 md:pt-8">
        {/* Breadcrumb & Title */}
        <div className="mb-6 md:mb-8">
          <Breadcrumbs
            className="mb-2"
            items={[
              { name: "Início", href: "/" },
              { name: "Imóveis", href: "/imoveis" },
            ]}
          />
          <Heading variant="h1">
            Encontre a sua próxima casa
          </Heading>
        </div>

        {/* Filters */}
        <div className="mb-6 md:mb-10">
          <Suspense fallback={<div>Carregando filtros...</div>}>
            <AdvancedFilters
              types={lookups.propertyTypes}
              cities={lookups.cities}
              neighborhoods={lookups.neighborhoods}
              features={lookups.features}
            />
          </Suspense>
        </div>
      </Container>

      <Container className="pb-10 md:pb-16 flex-grow">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <Heading as="h2" variant="h4">
            {properties ? properties.length : 0} imóveis encontrados
          </Heading>
        </div>

        {isMapView ? (
          <div className="bg-white rounded-lg h-[600px] border border-gray-200 overflow-hidden">
            <PropertiesMap properties={properties || []} />
          </div>
        ) : (
          <>
            {properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhum imóvel encontrado"
                description="Tente ajustar seus filtros de busca para encontrar mais opções."
              />
            )}
          </>
        )}
      </Container>
    </div>
  );
}
