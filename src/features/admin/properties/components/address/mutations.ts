import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/features/admin/properties/slug";
import { CityOption, NeighborhoodOption } from "./types";

const UNIQUE_VIOLATION = "23505";

export async function createCity(name: string, state: string): Promise<CityOption> {
  const supabase = createClient();
  const trimmedName = name.trim();
  const slug = generateSlug(trimmedName);
  const lookup = () => supabase.from("cities").select("id, name, state, slug").eq("state", state).eq("slug", slug).maybeSingle();
  const { data: existing } = await lookup();
  if (existing) return existing;

  const { data, error } = await supabase.from("cities").insert({ name: trimmedName, state, slug }).select("id, name, state, slug").single();
  if (!error) return data;
  if (error.code !== UNIQUE_VIOLATION) throw error;
  const { data: raced, error: raceError } = await lookup();
  if (raceError || !raced) throw raceError || error;
  return raced;
}

export async function createNeighborhood(name: string, cityId: string): Promise<NeighborhoodOption> {
  const supabase = createClient();
  const trimmedName = name.trim();
  const slug = generateSlug(trimmedName);
  const lookup = () => supabase.from("neighborhoods").select("id, name, city_id, slug").eq("city_id", cityId).eq("slug", slug).maybeSingle();
  const { data: existing } = await lookup();
  if (existing) return existing;

  const { data, error } = await supabase.from("neighborhoods").insert({ name: trimmedName, city_id: cityId, slug }).select("id, name, city_id, slug").single();
  if (!error) return data;
  if (error.code !== UNIQUE_VIOLATION) throw error;
  const { data: raced, error: raceError } = await lookup();
  if (raceError || !raced) throw raceError || error;
  return raced;
}

