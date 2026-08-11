import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/client";
import { CityOption, NeighborhoodOption } from "@/features/admin/properties/components/address/types";
import { LOOKUP_CACHE_TAGS } from "@/features/admin/properties/cacheTags";

const LOOKUP_CACHE_REVALIDATE_SECONDS = 3600;

const getCachedPropertyTypes = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("property_types").select("id, name").eq("active", true).order("name");
    if (error) throw error;
    return data || [];
  },
  ["property-form-property-types"],
  { tags: [LOOKUP_CACHE_TAGS.propertyTypes], revalidate: LOOKUP_CACHE_REVALIDATE_SECONDS },
);

const getCachedCities = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("cities").select("id, name, state, slug").eq("active", true).order("name");
    if (error) throw error;
    return (data || []) as CityOption[];
  },
  ["property-form-cities"],
  { tags: [LOOKUP_CACHE_TAGS.cities], revalidate: LOOKUP_CACHE_REVALIDATE_SECONDS },
);

const getCachedNeighborhoods = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("neighborhoods").select("id, city_id, name, slug").eq("active", true).order("name");
    if (error) throw error;
    return (data || []) as NeighborhoodOption[];
  },
  ["property-form-neighborhoods"],
  { tags: [LOOKUP_CACHE_TAGS.neighborhoods], revalidate: LOOKUP_CACHE_REVALIDATE_SECONDS },
);

const getCachedFeatures = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("features").select("id, name, slug").eq("active", true).order("name");
    if (error) throw error;
    return data || [];
  },
  ["property-form-features"],
  { tags: [LOOKUP_CACHE_TAGS.features], revalidate: LOOKUP_CACHE_REVALIDATE_SECONDS },
);

export async function getPropertyFormLookups() {
  const [propertyTypes, cities, neighborhoods, features] = await Promise.all([
    getCachedPropertyTypes(),
    getCachedCities(),
    getCachedNeighborhoods(),
    getCachedFeatures(),
  ]);

  return { propertyTypes, cities, neighborhoods, features };
}
