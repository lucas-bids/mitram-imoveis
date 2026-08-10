export type PropertyFilters = {
  type: string;
  purpose: string;
  city: string;
  neighborhood: string;
  bedrooms: string;
  suites: string;
  parking_spaces: string;
  features: string;
  min_price: string;
  max_price: string;
  min_area: string;
  max_area: string;
  order: string;
};

export function parseFilters(searchParams: URLSearchParams | { [key: string]: string | string[] | undefined }): PropertyFilters {
  const getParam = (key: string) => {
    if (searchParams instanceof URLSearchParams) return searchParams.get(key) || "";
    const val = searchParams[key];
    return Array.isArray(val) ? val[0] : (val || "");
  };

  return {
    type: getParam("type"),
    purpose: getParam("purpose"),
    city: getParam("city"),
    neighborhood: getParam("neighborhood"),
    bedrooms: getParam("bedrooms"),
    suites: getParam("suites"),
    parking_spaces: getParam("parking_spaces"),
    features: getParam("features"),
    min_price: getParam("min_price"),
    max_price: getParam("max_price"),
    min_area: getParam("min_area"),
    max_area: getParam("max_area"),
    order: getParam("order") || "recentes",
  };
}

export function serializeFilters(filters: Partial<PropertyFilters>): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params;
}

export type FilterOption = { id: string; name: string };

/** Extrai os ids selecionados de um campo multi-valor serializado como CSV. */
function csvIds(value: string): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

/**
 * Remove da seleção de bairros (CSV) os ids cuja cidade não está mais entre as
 * cidades selecionadas (CSV). Sem cidade selecionada, nenhum bairro é descartado,
 * pois a lista de bairros passa a exibir todas as opções.
 */
export function pruneNeighborhoodIds(
  neighborhoodCsv: string,
  cityCsv: string,
  neighborhoods: { id: string; city_id?: string }[],
): string {
  const cityIds = csvIds(cityCsv);
  if (cityIds.length === 0) return neighborhoodCsv;

  return csvIds(neighborhoodCsv)
    .filter((id) => {
      const neighborhood = neighborhoods.find((item) => item.id === id);
      return !!neighborhood?.city_id && cityIds.includes(neighborhood.city_id);
    })
    .join(",");
}

export function deriveActivePills(
  filters: PropertyFilters,
  lookups: { types: FilterOption[]; cities: FilterOption[]; neighborhoods: FilterOption[]; features: FilterOption[] }
) {
  const activePills: { key: string; label: string }[] = [];

  if (filters.purpose) {
    const label = filters.purpose === 'sale' ? 'Comprar' : 'Alugar';
    activePills.push({ key: 'purpose', label: `Negócio: ${label}` });
  }
  if (filters.type) {
    const name = lookups.types.find(t => t.id === filters.type)?.name;
    if (name) activePills.push({ key: 'type', label: `Tipo: ${name}` });
  }
  csvIds(filters.city).forEach((id) => {
    const name = lookups.cities.find(c => c.id === id)?.name;
    if (name) activePills.push({ key: `city:${id}`, label: `Cidade: ${name}` });
  });
  csvIds(filters.neighborhood).forEach((id) => {
    const name = lookups.neighborhoods.find(n => n.id === id)?.name;
    if (name) activePills.push({ key: `neighborhood:${id}`, label: `Bairro: ${name}` });
  });
  if (filters.bedrooms) activePills.push({ key: 'bedrooms', label: `Quartos: ${filters.bedrooms}+` });
  if (filters.suites) activePills.push({ key: 'suites', label: `Suítes: ${filters.suites}+` });
  if (filters.parking_spaces) activePills.push({ key: 'parking_spaces', label: `Vagas: ${filters.parking_spaces}+` });
  csvIds(filters.features).forEach((id) => {
    const name = lookups.features.find(f => f.id === id)?.name;
    if (name) activePills.push({ key: `features:${id}`, label: `Extra: ${name}` });
  });
  if (filters.min_price) activePills.push({ key: 'min_price', label: `Preço Mín: R$ ${filters.min_price}` });
  if (filters.max_price) activePills.push({ key: 'max_price', label: `Preço Máx: R$ ${filters.max_price}` });
  if (filters.min_area) activePills.push({ key: 'min_area', label: `Área Mín: ${filters.min_area}m²` });
  if (filters.max_area) activePills.push({ key: 'max_area', label: `Área Máx: ${filters.max_area}m²` });

  return activePills;
}
