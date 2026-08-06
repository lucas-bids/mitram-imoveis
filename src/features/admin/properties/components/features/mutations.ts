import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/features/admin/properties/slug";

export type FeatureOption = { id: string; name: string; slug: string };

const UNIQUE_VIOLATION = "23505";

export async function fetchActiveFeatures(): Promise<FeatureOption[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("features")
    .select("id, name, slug")
    .eq("active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

// Reuses an existing feature when the slug already matches (case-insensitive names collapse to the same slug),
// so creating "academia" twice never produces duplicate reusable records.
export async function createFeature(name: string): Promise<FeatureOption> {
  const supabase = createClient();
  const trimmedName = name.trim();
  const slug = generateSlug(trimmedName);

  const { data: existing } = await supabase
    .from("features")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("features")
    .insert({ name: trimmedName, slug })
    .select("id, name, slug")
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      const { data: raceExisting, error: raceError } = await supabase
        .from("features")
        .select("id, name, slug")
        .eq("slug", slug)
        .single();
      if (raceError) throw raceError;
      return raceExisting;
    }
    throw error;
  }

  return data;
}

// Permanently deletes the reusable feature; property_features rows cascade via the FK's ON DELETE CASCADE.
export async function deleteFeatureGlobally(featureId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("features").delete().eq("id", featureId);
  if (error) throw error;
}

export async function addPropertyFeature(propertyId: string, featureId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("property_features")
    .insert({ property_id: propertyId, feature_id: featureId });
  if (error && error.code !== UNIQUE_VIOLATION) throw error;
}

export async function removePropertyFeature(propertyId: string, featureId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("property_features")
    .delete()
    .eq("property_id", propertyId)
    .eq("feature_id", featureId);
  if (error) throw error;
}

export async function addPropertyFeatures(propertyId: string, featureIds: string[]): Promise<void> {
  if (featureIds.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("property_features")
    .insert(featureIds.map((featureId) => ({ property_id: propertyId, feature_id: featureId })));
  if (error) throw error;
}
