"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/features/admin/properties/slug";
import { LOOKUP_CACHE_TAGS } from "@/features/admin/properties/cacheTags";
import { CityOption, NeighborhoodOption } from "./types";

const UNIQUE_VIOLATION = "23505";

export async function createCity(name: string, state: string): Promise<CityOption> {
  const supabase = createClient();
  const trimmedName = name.trim();
  const slug = generateSlug(trimmedName);
  const lookup = () =>
    supabase.from("cities").select("id, name, state, slug, active").eq("state", state).eq("slug", slug).maybeSingle();

  const { data: existing } = await lookup();
  if (existing) {
    if (existing.active) return existing;
    // Row was previously deactivated — recreate means "bring it back", not "return a hidden record".
    const { data: reactivated, error: reactivateError } = await supabase
      .from("cities")
      .update({ active: true })
      .eq("id", existing.id)
      .select("id, name, state, slug")
      .single();
    if (reactivateError) throw reactivateError;
    revalidateTag(LOOKUP_CACHE_TAGS.cities);
    return reactivated;
  }

  const { data, error } = await supabase.from("cities").insert({ name: trimmedName, state, slug }).select("id, name, state, slug").single();
  if (!error) {
    revalidateTag(LOOKUP_CACHE_TAGS.cities);
    return data;
  }
  if (error.code !== UNIQUE_VIOLATION) throw error;
  const { data: raced, error: raceError } = await lookup();
  if (raceError || !raced) throw raceError || error;
  return raced;
}

// Soft delete: `properties.city_id` is ON DELETE RESTRICT and `neighborhoods.city_id` is ON
// DELETE CASCADE, so a hard delete would either fail loudly or silently wipe out every
// neighborhood in the city. Deactivating just hides it from active lookups (recreating it
// with the same name/state reactivates it, see createCity above).
export async function deactivateCity(cityId: string): Promise<void> {
  const supabase = createClient();
  const { count, error: countError } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("city_id", cityId);
  if (countError) throw countError;
  if (count && count > 0) {
    throw new Error(`Não é possível excluir: ${count} imóvel(is) usam esta cidade.`);
  }

  const { error } = await supabase.from("cities").update({ active: false }).eq("id", cityId);
  if (error) throw error;
  revalidateTag(LOOKUP_CACHE_TAGS.cities);
}

export async function createNeighborhood(name: string, cityId: string): Promise<NeighborhoodOption> {
  const supabase = createClient();
  const trimmedName = name.trim();
  const slug = generateSlug(trimmedName);
  const lookup = () =>
    supabase.from("neighborhoods").select("id, name, city_id, slug, active").eq("city_id", cityId).eq("slug", slug).maybeSingle();

  const { data: existing } = await lookup();
  if (existing) {
    if (existing.active) return existing;
    const { data: reactivated, error: reactivateError } = await supabase
      .from("neighborhoods")
      .update({ active: true })
      .eq("id", existing.id)
      .select("id, name, city_id, slug")
      .single();
    if (reactivateError) throw reactivateError;
    revalidateTag(LOOKUP_CACHE_TAGS.neighborhoods);
    return reactivated;
  }

  const { data, error } = await supabase.from("neighborhoods").insert({ name: trimmedName, city_id: cityId, slug }).select("id, name, city_id, slug").single();
  if (!error) {
    revalidateTag(LOOKUP_CACHE_TAGS.neighborhoods);
    return data;
  }
  if (error.code !== UNIQUE_VIOLATION) throw error;
  const { data: raced, error: raceError } = await lookup();
  if (raceError || !raced) throw raceError || error;
  return raced;
}

// See deactivateCity above — properties.neighborhood_id is also ON DELETE RESTRICT.
export async function deactivateNeighborhood(neighborhoodId: string): Promise<void> {
  const supabase = createClient();
  const { count, error: countError } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("neighborhood_id", neighborhoodId);
  if (countError) throw countError;
  if (count && count > 0) {
    throw new Error(`Não é possível excluir: ${count} imóvel(is) usam este bairro.`);
  }

  const { error } = await supabase.from("neighborhoods").update({ active: false }).eq("id", neighborhoodId);
  if (error) throw error;
  revalidateTag(LOOKUP_CACHE_TAGS.neighborhoods);
}
