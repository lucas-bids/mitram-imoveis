import PropertyCard from "@/features/properties/components/PropertyCard";
import AdvancedFilters from "@/features/search/components/AdvancedFilters";
import PropertiesMap from "@/features/properties/components/PropertiesMap";
import { Suspense } from "react";
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
      <div className="container mx-auto px-4 pt-6 pb-4 md:pt-8">
        {/* Breadcrumb & Title */}
        <div className="mb-6 md:mb-8">
          <div className="text-sm text-gray-500 mb-2">Home page &gt; Imóveis</div>
          <h1 className="text-3xl md:text-5xl font-bold text-mitram-dark tracking-tight">
            Encontre a sua próxima casa
          </h1>
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
      </div>

      <div className="container mx-auto px-4 pb-10 md:pb-16 flex-grow">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-base md:text-lg font-bold text-mitram-dark">
            {properties ? properties.length : 0} imóveis encontrados
          </h2>
        </div>

        {isMapView ? (
          <div className="bg-white rounded-lg shadow-sm h-[600px] border border-gray-200 overflow-hidden">
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
              <div className="text-center p-8 md:p-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg md:text-xl font-medium text-mitram-dark mb-2">Nenhum imóvel encontrado</h3>
                <p className="text-gray-500">Tente ajustar seus filtros de busca para encontrar mais opções.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
