import PropertyCard from "@/features/properties/components/PropertyCard";
import AdvancedFilters from "@/features/search/components/AdvancedFilters";
import PropertiesMap from "@/features/properties/components/PropertiesMap";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { PropertyListItem } from "@/features/properties/types";
import { getFilterLookups, getPublicProperties } from "@/features/properties/queries";

export const dynamic = "force-dynamic";

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const lookups = await getFilterLookups();
  const properties = await getPublicProperties(searchParams);

  const isMapView = searchParams.view === 'map';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Container className="pt-6 pb-4 md:pt-8">
        {/* Breadcrumb & Title */}
        <div className="mb-6 md:mb-8">
          <Text variant="bodySm" className="mb-2">Home page &gt; Imóveis</Text>
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
