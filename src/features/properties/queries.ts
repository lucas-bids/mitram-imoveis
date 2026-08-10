import { createClient } from "@/lib/supabase/server";
import { PropertyListItem, PropertyDetail, AdminPropertyListItem } from "./types";

export const PROPERTY_MEDIA_EMBED = "property_media!property_media_property_id_fkey";
export const PROPERTY_MEDIA_FIELDS = `${PROPERTY_MEDIA_EMBED} (public_url, is_cover, sort_order)`;
export const PROPERTY_MEDIA_ALL = `${PROPERTY_MEDIA_EMBED} (*)`;

export async function getFeaturedProperties(): Promise<PropertyListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
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
      property_types (name),
      neighborhoods (name, cities (name)),
      ${PROPERTY_MEDIA_FIELDS}
    `)
    .in("status", ["published", "sold", "rented"])
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) throw error;
  return (data as unknown) as PropertyListItem[];
}

export async function getPublicProperties(searchParams: { [key: string]: string | string[] | undefined }): Promise<PropertyListItem[]> {
  const supabase = createClient();

  const selectedFeatureIds = searchParams.features
    ? (Array.isArray(searchParams.features)
        ? searchParams.features
        : searchParams.features.split(","))
    : [];

  let propertyIdsWithSelectedFeatures: string[] | null = null;
  if (selectedFeatureIds.length > 0) {
    const { data: matchingFeatures } = await supabase
      .from("property_features")
      .select("property_id")
      .in("feature_id", selectedFeatureIds);

    propertyIdsWithSelectedFeatures = Array.from(
      new Set((matchingFeatures || []).map(({ property_id }) => property_id)),
    );
  }

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
    query = query.eq("purpose", searchParams.purpose as string);
  }
  if (searchParams.bedrooms) {
    query = query.gte("bedrooms", parseInt(searchParams.bedrooms as string));
  }
  if (searchParams.suites) {
    query = query.gte("suites", parseInt(searchParams.suites as string));
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
  if (searchParams.min_area) {
    query = query.gte("total_area", parseFloat(searchParams.min_area as string));
  }
  if (searchParams.max_area) {
    query = query.lte("total_area", parseFloat(searchParams.max_area as string));
  }
  if (propertyIdsWithSelectedFeatures) {
    query = query.in(
      "id",
      propertyIdsWithSelectedFeatures.length > 0
        ? propertyIdsWithSelectedFeatures
        : ["00000000-0000-0000-0000-000000000000"],
    );
  }

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

  query = query.limit(50);

  const { data, error } = await query;
  if (error) console.error(error);
  
  return ((data || []) as unknown) as PropertyListItem[];
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_types (name),
      neighborhoods (name, cities (name, state)),
      ${PROPERTY_MEDIA_ALL},
      property_features (features (name))
    `)
    .eq("slug", slug)
    .in("status", ["published", "sold", "rented"])
    .single();

  if (error) return null;
  return (data as unknown) as PropertyDetail;
}

export async function getPropertyMetaBySlug(slug: string): Promise<{ title: string; description: string | null } | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("properties")
    .select("title, description")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getSimilarProperties(property: { id: string; property_type_id: string; purpose: string }): Promise<PropertyListItem[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("properties")
    .select(`
      id, title, slug, price, purpose, status, total_area, bedrooms, suites, bathrooms, parking_spaces,
      property_types (name),
      neighborhoods (name, cities (name)),
      ${PROPERTY_MEDIA_FIELDS}
    `)
    .in("status", ["published", "sold", "rented"])
    .eq("property_type_id", property.property_type_id)
    .eq("purpose", property.purpose)
    .neq("id", property.id)
    .limit(3);

  return ((data || []) as unknown) as PropertyListItem[];
}

export async function getFilterLookups() {
  const supabase = createClient();
  const [
    { data: propertyTypes },
    { data: cities },
    { data: neighborhoods },
    { data: features },
  ] = await Promise.all([
    supabase.from("property_types").select("id, name").eq("active", true).order("name"),
    supabase.from("cities").select("id, name").eq("active", true).order("name"),
    supabase.from("neighborhoods").select("id, city_id, name").eq("active", true).order("name"),
    supabase.from("features").select("id, name").eq("active", true).order("name"),
  ]);

  return {
    propertyTypes: propertyTypes || [],
    cities: cities || [],
    neighborhoods: neighborhoods || [],
    features: features || [],
  };
}

export async function getAdminProperties(): Promise<AdminPropertyListItem[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("properties")
    .select(`
      id,
      internal_code,
      title,
      slug,
      purpose,
      status,
      price,
      featured,
      created_at,
      property_types (name),
      neighborhoods (name, cities (name))
    `)
    .in("status", ["draft", "published", "archived", "sold", "rented"])
    .order("created_at", { ascending: false });

  return ((data || []) as unknown) as AdminPropertyListItem[];
}

export async function getTrashedProperties() {
  const supabase = createClient();
  const { data } = await supabase
    .from("properties")
    .select("id, internal_code, title, deleted_at")
    .eq("status", "trashed")
    .order("deleted_at", { ascending: false });

  return data || [];
}
