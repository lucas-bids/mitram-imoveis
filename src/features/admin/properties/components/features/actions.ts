"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/features/admin/properties/slug";
import { LOOKUP_CACHE_TAGS } from "@/features/admin/properties/cacheTags";
import type { FeatureOption } from "./mutations";

const UNIQUE_VIOLATION = "23505";

// Reuses an existing feature when the slug already matches (case-insensitive names collapse to the same slug),
// so creating "academia" twice never produces duplicate reusable records.
export async function createFeature(name: string): Promise<FeatureOption> {
  const supabase = createClient();
  const trimmedName = name.trim();
  const slug = generateSlug(trimmedName);
  const lookup = () => supabase.from("features").select("id, name, slug, active").eq("slug", slug).maybeSingle();

  const { data: existing } = await lookup();
  if (existing) {
    if (existing.active) return existing;
    // Row was previously deactivated — recreate means "bring it back", not "return a hidden record".
    const { data: reactivated, error: reactivateError } = await supabase
      .from("features")
      .update({ active: true })
      .eq("id", existing.id)
      .select("id, name, slug")
      .single();
    if (reactivateError) throw reactivateError;
    revalidateTag(LOOKUP_CACHE_TAGS.features);
    return reactivated;
  }

  const { data, error } = await supabase.from("features").insert({ name: trimmedName, slug }).select("id, name, slug").single();
  if (!error) {
    revalidateTag(LOOKUP_CACHE_TAGS.features);
    return data;
  }
  if (error.code !== UNIQUE_VIOLATION) throw error;
  const { data: raced, error: raceError } = await lookup();
  if (raceError || !raced) throw raceError || error;
  return raced;
}

// Permanently deletes the reusable feature; property_features rows cascade via the FK's ON DELETE CASCADE.
export async function deleteFeatureGlobally(featureId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("features").delete().eq("id", featureId);
  if (error) throw error;
  revalidateTag(LOOKUP_CACHE_TAGS.features);
}
