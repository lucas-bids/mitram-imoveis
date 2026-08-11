import { createClient } from "@/lib/supabase/client";

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
