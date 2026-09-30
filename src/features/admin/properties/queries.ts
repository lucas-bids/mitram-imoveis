import { createClient } from "@/lib/supabase/client";
import { CityOption, NeighborhoodOption } from "@/features/admin/properties/components/address/types";

/** Tipo de imóvel no formulário; `olx_property_type` null = sem mapeamento no portal. */
export type PropertyTypeOption = { id: string; name: string; olx_property_type: string | null };

export async function getPropertyFormLookups() {
  const supabase = createClient();
  const [
    { data: propertyTypes },
    { data: cities },
    { data: neighborhoods },
    { data: features },
  ] = await Promise.all([
    supabase.from("property_types").select("id, name, olx_property_type").eq("active", true).order("name"),
    supabase.from("cities").select("id, name, state, slug").eq("active", true).order("name"),
    supabase.from("neighborhoods").select("id, city_id, name, slug").eq("active", true).order("name"),
    supabase.from("features").select("id, name, slug").eq("active", true).order("name"),
  ]);

  return {
    propertyTypes: (propertyTypes || []) as PropertyTypeOption[],
    cities: (cities || []) as CityOption[],
    neighborhoods: (neighborhoods || []) as NeighborhoodOption[],
    features: features || [],
  };
}
