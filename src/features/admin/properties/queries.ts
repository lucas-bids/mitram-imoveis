import type { SupabaseClient } from "@supabase/supabase-js";
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

/**
 * Caminhos no bucket das fotos de um imóvel. Recebe o client porque é chamado
 * pela server action de exclusão definitiva, que precisa ler os caminhos antes
 * de apagar o imóvel — depois disso o cascade leva as linhas embora e não há
 * mais como saber quais arquivos eram dele (a pasta nem sempre é o id do
 * imóvel: fotos de um imóvel novo sobem numa pasta com id provisório).
 */
export async function getPropertyMediaStoragePaths(
  supabase: SupabaseClient,
  propertyId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("property_media")
    .select("storage_path")
    .eq("property_id", propertyId);

  if (error) throw error;
  return (data ?? []).map((row) => row.storage_path as string);
}
