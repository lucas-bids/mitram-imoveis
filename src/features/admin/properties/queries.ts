import { createClient } from "@/lib/supabase/client";

export async function getPropertyFormLookups() {
  const supabase = createClient();
  const [
    { data: propertyTypes },
    { data: cities },
    { data: neighborhoods },
    { data: features },
  ] = await Promise.all([
    supabase.from("property_types").select("id, name").eq("active", true),
    supabase.from("cities").select("id, name").eq("active", true),
    supabase.from("neighborhoods").select("id, city_id, name").eq("active", true),
    supabase.from("features").select("id, name").eq("active", true),
  ]);

  return {
    propertyTypes: propertyTypes || [],
    cities: cities || [],
    neighborhoods: neighborhoods || [],
    features: features || [],
  };
}
