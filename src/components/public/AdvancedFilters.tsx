"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { List, Map } from "lucide-react";

interface FilterOption {
  id: string;
  name: string;
}

interface NeighborhoodOption extends FilterOption {
  city_id: string;
}

interface AdvancedFiltersProps {
  types: FilterOption[];
  cities: FilterOption[];
  neighborhoods: NeighborhoodOption[];
  features: FilterOption[];
}

const minimumQuantityOptions = [1, 2, 3, 4, 5];

export default function AdvancedFilters({
  types,
  cities,
  neighborhoods,
  features,
}: AdvancedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    purpose: searchParams.get("purpose") || "",
    city: searchParams.get("city") || "",
    neighborhood: searchParams.get("neighborhood") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    suites: searchParams.get("suites") || "",
    parking_spaces: searchParams.get("parking_spaces") || "",
    features: searchParams.get("features") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    min_area: searchParams.get("min_area") || "",
    max_area: searchParams.get("max_area") || "",
    order: searchParams.get("order") || "recentes",
  });

  const isMapView = searchParams.get("view") === "map";

  const handleChange = (key: string, value: string) => {
    setFilters((previousFilters) => {
      const newFilters = { ...previousFilters, [key]: value };
      if (key === "city") {
        newFilters.neighborhood = "";
      }
      return newFilters;
    });
  };

  const handleApply = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleView = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isMapView) {
      params.delete("view");
    } else {
      params.set("view", "map");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredNeighborhoods = neighborhoods.filter(
    (neighborhood) => !filters.city || neighborhood.city_id === filters.city,
  );

  const selectClassName =
    "w-full rounded border-gray-300 bg-white px-3 py-2 text-sm text-mitram-dark";
  const inputClassName =
    "min-w-0 w-full rounded border-gray-300 bg-white px-3 py-2 text-sm text-mitram-dark";
  const labelClassName = "mb-1 block text-xs font-medium text-gray-600";

  return (
    <div>
      <form
        onSubmit={handleApply}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <div>
          <label htmlFor="property-type" className={labelClassName}>
            Tipo
          </label>
          <select
            id="property-type"
            value={filters.type}
            onChange={(event) => handleChange("type", event.target.value)}
            className={selectClassName}
          >
            <option value="">Todos</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city" className={labelClassName}>
            Cidade
          </label>
          <select
            id="city"
            value={filters.city}
            onChange={(event) => handleChange("city", event.target.value)}
            className={selectClassName}
          >
            <option value="">Todas</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="neighborhood" className={labelClassName}>
            Bairro
          </label>
          <select
            id="neighborhood"
            value={filters.neighborhood}
            onChange={(event) => handleChange("neighborhood", event.target.value)}
            className={selectClassName}
            disabled={!filters.city}
          >
            <option value="">Todos</option>
            {filteredNeighborhoods.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.id}>
                {neighborhood.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bedrooms" className={labelClassName}>
            Quartos
          </label>
          <select
            id="bedrooms"
            value={filters.bedrooms}
            onChange={(event) => handleChange("bedrooms", event.target.value)}
            className={selectClassName}
          >
            <option value="">Qualquer</option>
            {minimumQuantityOptions.map((quantity) => (
              <option key={quantity} value={quantity}>
                {quantity}+
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="suites" className={labelClassName}>
            Suítes
          </label>
          <select
            id="suites"
            value={filters.suites}
            onChange={(event) => handleChange("suites", event.target.value)}
            className={selectClassName}
          >
            <option value="">Qualquer</option>
            {minimumQuantityOptions.map((quantity) => (
              <option key={quantity} value={quantity}>
                {quantity}+
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="parking-spaces" className={labelClassName}>
            Vagas de garagem
          </label>
          <select
            id="parking-spaces"
            value={filters.parking_spaces}
            onChange={(event) => handleChange("parking_spaces", event.target.value)}
            className={selectClassName}
          >
            <option value="">Qualquer</option>
            {minimumQuantityOptions.map((quantity) => (
              <option key={quantity} value={quantity}>
                {quantity}+
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="features" className={labelClassName}>
            Características
          </label>
          <select
            id="features"
            value={filters.features}
            onChange={(event) => handleChange("features", event.target.value)}
            className={selectClassName}
          >
            <option value="">Todas</option>
            {features.map((feature) => (
              <option key={feature.id} value={feature.id}>
                {feature.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className={labelClassName}>Preço (Reais)</legend>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={filters.min_price}
              onChange={(event) => handleChange("min_price", event.target.value)}
              className={inputClassName}
              placeholder="Mínimo"
              aria-label="Preço mínimo em reais"
            />
            <input
              type="number"
              min="0"
              step="any"
              value={filters.max_price}
              onChange={(event) => handleChange("max_price", event.target.value)}
              className={inputClassName}
              placeholder="Máximo"
              aria-label="Preço máximo em reais"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className={labelClassName}>Área (m²)</legend>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={filters.min_area}
              onChange={(event) => handleChange("min_area", event.target.value)}
              className={inputClassName}
              placeholder="Mínima"
              aria-label="Área mínima em metros quadrados"
            />
            <input
              type="number"
              min="0"
              step="any"
              value={filters.max_area}
              onChange={(event) => handleChange("max_area", event.target.value)}
              className={inputClassName}
              placeholder="Máxima"
              aria-label="Área máxima em metros quadrados"
            />
          </div>
        </fieldset>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded bg-mitram-gold px-6 py-2 text-sm font-semibold text-mitram-dark hover:bg-yellow-500"
          >
            Buscar
          </button>
        </div>
      </form>

      <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={toggleView}
          className="flex items-center justify-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          {isMapView ? (
            <>
              <List size={16} /> Lista
            </>
          ) : (
            <>
              <Map size={16} /> Mapa
            </>
          )}
        </button>
      </div>
    </div>
  );
}
