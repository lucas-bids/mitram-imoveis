import { createClient } from "@/lib/supabase/server";
import PropertyCard from "@/components/properties/PropertyCard";
import AdvancedFilters from "@/components/public/AdvancedFilters";
import PropertiesMap from "@/components/maps/PropertiesMap";
import { PROPERTY_MEDIA_FIELDS } from "@/lib/properties/queries";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();

  // Load locations for Filters
  const [
    { data: propertyTypes },
    { data: cities },
    { data: neighborhoods },
    { data: features }
  ] = await Promise.all([
    supabase.from("property_types").select("id, name").eq("active", true),
    supabase.from("cities").select("id, name").eq("active", true),
    supabase.from("neighborhoods").select("id, city_id, name").eq("active", true),
    supabase.from("features").select("id, name").eq("active", true)
  ]);

  // Build Query based on searchParams
  let query = supabase
    .from("properties")
    .select(`
      id,
      title,
      slug,
      price,
      purpose,
      status,
      total_area,
      bedrooms,
      suites,
      bathrooms,
      parking_spaces,
      latitude,
      longitude,
      property_types (name),
      neighborhoods (name, cities (name)),
      ${PROPERTY_MEDIA_FIELDS}
    `)
    .in("status", ["published", "sold", "rented"]);

  if (searchParams.type) {
    const types = Array.isArray(searchParams.type) ? searchParams.type : searchParams.type.split(',');
    query = query.in("property_type_id", types);
  }
  if (searchParams.city) {
    const cityIds = Array.isArray(searchParams.city) ? searchParams.city : searchParams.city.split(',');
    query = query.in("city_id", cityIds);
  }
  if (searchParams.neighborhood) {
    const neighborhoodIds = Array.isArray(searchParams.neighborhood) ? searchParams.neighborhood : searchParams.neighborhood.split(',');
    query = query.in("neighborhood_id", neighborhoodIds);
  }
  if (searchParams.purpose) {
    query = query.eq("purpose", searchParams.purpose);
  }
  if (searchParams.bedrooms) {
    query = query.gte("bedrooms", parseInt(searchParams.bedrooms as string));
  }
  if (searchParams.parking_spaces) {
    query = query.gte("parking_spaces", parseInt(searchParams.parking_spaces as string));
  }
  if (searchParams.min_price) {
    query = query.gte("price", parseFloat(searchParams.min_price as string));
  }
  if (searchParams.max_price) {
    query = query.lte("price", parseFloat(searchParams.max_price as string));
  }

  // Order
  const order = (searchParams.order as string) || "recentes";
  switch (order) {
    case "menor_preco":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "maior_preco":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "maior_area":
      query = query.order("total_area", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Limit for MVP, ideally use pagination
  query = query.limit(50);

  const { data: properties, error } = await query;

  if (error) {
    console.error(error);
  }

  const isMapView = searchParams.view === 'map';

  return (
    <div className="flex flex-col min-h-screen bg-mitram-grayLight">
      <div className="bg-white shadow-sm sticky top-[72px] z-40 border-t">
        <div className="container mx-auto px-4 py-4">
          <Suspense fallback={<div>Carregando filtros...</div>}>
            <AdvancedFilters 
              types={propertyTypes || []} 
              cities={cities || []} 
              neighborhoods={neighborhoods || []} 
            />
          </Suspense>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-mitram-dark">
            {properties ? properties.length : 0} imóveis encontrados
          </h1>
        </div>

        {isMapView ? (
          <div className="bg-white rounded-lg shadow-sm h-[600px] border border-gray-200 overflow-hidden">
            <PropertiesMap properties={properties || []} />
          </div>
        ) : (
          <>
            {properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-medium text-mitram-dark mb-2">Nenhum imóvel encontrado</h3>
                <p className="text-gray-500">Tente ajustar seus filtros de busca para encontrar mais opções.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
