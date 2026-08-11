import { createClient } from "@/lib/supabase/client";
import { CityOption, NeighborhoodOption } from "@/features/admin/properties/components/address/types";

export async function getPropertyFormLookups() {
  const supabase = createClient();
  const [
    { data: propertyTypes },
    { data: cities },
    { data: neighborhoods },
    { data: features },
  ] = await Promise.all([
    supabase.from("property_types").select("id, name").eq("active", true).order("name"),
    supabase.from("cities").select("id, name, state, slug").eq("active", true).order("name"),
    supabase.from("neighborhoods").select("id, city_id, name, slug").eq("active", true).order("name"),
    supabase.from("features").select("id, name, slug").eq("active", true).order("name"),
  ]);

  return {
    propertyTypes: propertyTypes || [],
    cities: (cities || []) as CityOption[],
    neighborhoods: (neighborhoods || []) as NeighborhoodOption[],
    features: features || [],
  };
}
