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
  if (filters.city) {
    const name = lookups.cities.find(c => c.id === filters.city)?.name;
    if (name) activePills.push({ key: 'city', label: `Cidade: ${name}` });
  }
  if (filters.neighborhood) {
    const name = lookups.neighborhoods.find(n => n.id === filters.neighborhood)?.name;
    if (name) activePills.push({ key: 'neighborhood', label: `Bairro: ${name}` });
  }
  if (filters.bedrooms) activePills.push({ key: 'bedrooms', label: `Quartos: ${filters.bedrooms}+` });
  if (filters.suites) activePills.push({ key: 'suites', label: `Suítes: ${filters.suites}+` });
  if (filters.parking_spaces) activePills.push({ key: 'parking_spaces', label: `Vagas: ${filters.parking_spaces}+` });
  if (filters.features) {
    const name = lookups.features.find(f => f.id === filters.features)?.name;
    if (name) activePills.push({ key: 'features', label: `Extra: ${name}` });
  }
  if (filters.min_price) activePills.push({ key: 'min_price', label: `Preço Mín: R$ ${filters.min_price}` });
  if (filters.max_price) activePills.push({ key: 'max_price', label: `Preço Máx: R$ ${filters.max_price}` });
  if (filters.min_area) activePills.push({ key: 'min_area', label: `Área Mín: ${filters.min_area}m²` });
  if (filters.max_area) activePills.push({ key: 'max_area', label: `Área Máx: ${filters.max_area}m²` });

  return activePills;
}
