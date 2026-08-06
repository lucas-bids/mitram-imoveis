export type GeocodedAddress = { latitude: number; longitude: number; formattedAddress: string };

export type AddressQuery = {
  street: string; number: string; neighborhood: string; city: string; state: string; postalCode: string;
};

const NOT_FOUND = "Endereço não encontrado. Confira os campos e tente novamente.";

const STATUS_MESSAGES: Record<string, string> = {
  ZERO_RESULTS: NOT_FOUND,
  REQUEST_DENIED: "A chave do Google Maps não tem permissão para geocodificar. Habilite a Geocoding API no projeto.",
  OVER_QUERY_LIMIT: "Limite de consultas do Google Maps atingido. Tente novamente em instantes.",
};

function statusOf(error: unknown): string | null {
  if (!(error instanceof Error) || !("code" in error)) return null;
  const { code } = error as Error & { code: unknown };
  return typeof code === "string" ? code : null;
}

/**
 * Uses the Maps JavaScript API geocoder instead of the Geocoding web service because the
 * browser key is restricted by HTTP referrer, which the web service rejects.
 */
export async function geocodePropertyAddress(geocoder: google.maps.Geocoder, address: AddressQuery): Promise<GeocodedAddress> {
  const query = [address.street, address.number, address.neighborhood, address.city, address.state, address.postalCode].filter(Boolean).join(", ");

  let response: google.maps.GeocoderResponse;
  try {
    response = await geocoder.geocode({ address: query, componentRestrictions: { country: "BR" } });
  } catch (error) {
    const status = statusOf(error);
    throw new Error((status && STATUS_MESSAGES[status]) || "Não foi possível confirmar o endereço.");
  }

  const match = response.results[0];
  if (!match) throw new Error(NOT_FOUND);
  const { location } = match.geometry;
  return { latitude: location.lat(), longitude: location.lng(), formattedAddress: match.formatted_address };
}
