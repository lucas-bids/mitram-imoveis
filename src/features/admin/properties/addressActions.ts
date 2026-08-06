"use server";

import { createClient } from "@/lib/supabase/server";

export type GeocodedAddress = { latitude: number; longitude: number; formattedAddress: string };

export async function geocodePropertyAddress(address: {
  street: string; number: string; neighborhood: string; city: string; state: string; postalCode: string;
}): Promise<GeocodedAddress> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Entre novamente.");

  const apiKey = process.env.GOOGLE_MAPS_GEOCODING_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("A chave da API de geocodificação não está configurada.");

  const query = [address.street, address.number, address.neighborhood, address.city, address.state, address.postalCode, "Brasil"].filter(Boolean).join(", ");
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("region", "br");
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("O Google Maps não respondeu. Tente novamente.");
  const result = await response.json() as {
    status: string; error_message?: string;
    results?: { formatted_address: string; geometry: { location: { lat: number; lng: number } } }[];
  };
  const match = result.results?.[0];
  if (result.status !== "OK" || !match) {
    if (result.status === "ZERO_RESULTS") throw new Error("Endereço não encontrado. Confira os campos e tente novamente.");
    throw new Error(result.error_message || "Não foi possível confirmar o endereço.");
  }

  return { latitude: match.geometry.location.lat, longitude: match.geometry.location.lng, formattedAddress: match.formatted_address };
}

