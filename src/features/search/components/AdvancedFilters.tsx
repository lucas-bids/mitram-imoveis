"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { List, Map, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { FormField, SELECT_ARROW_STYLE, SELECT_EXTRA, fieldClasses } from "@/components/ui/FormField";
import { FilterOption, parseFilters, serializeFilters, deriveActivePills, PropertyFilters } from "@/features/search/filters";
import { PurposeToggle } from "@/features/search/components/PurposeToggle";
import { RangeField } from "@/features/search/components/RangeField";
import { FilterPills } from "@/features/search/components/FilterPills";

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

  const [filters, setFilters] = useState<PropertyFilters>(() => parseFilters(searchParams));
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const isMapView = searchParams.get("view") === "map";

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key === "city") newFilters.neighborhood = "";
      return newFilters;
    });
  };

  const handleApply = (event: React.FormEvent) => {
    event.preventDefault();
    setIsMobileFiltersOpen(false);
    const params = serializeFilters(filters);
    if (isMapView) params.set("view", "map");
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
    (n) => !filters.city || n.city_id === filters.city,
  );

  const filterSelectClasses = (isActive: boolean, extra?: string) =>
    fieldClasses(false, [SELECT_EXTRA, isActive ? "border-mitram-gold" : "", extra].filter(Boolean).join(" "));

  const activePills = deriveActivePills(filters, { types, cities, neighborhoods, features });
  const hasActiveFilters = activePills.length > 0;

  const removeFilter = (key: string) => {
    const newFilters = { ...filters, [key]: "" };
    if (key === "city") newFilters.neighborhood = "";
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    if (key === "city") params.delete("neighborhood");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const emptyFilters = parseFilters(new URLSearchParams());
    setFilters(emptyFilters);

    const params = new URLSearchParams(searchParams.toString());
    Object.keys(emptyFilters).forEach(k => params.delete(k));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-[#FAFAFA] rounded-[2rem] p-4 md:p-8 border border-gray-100 shadow-sm">
      <form onSubmit={handleApply} className="flex flex-col gap-2 md:gap-6">
        
        {/* Mobile Top Bar */}
        <div className="flex flex-row items-center justify-between gap-4">
          <PurposeToggle purpose={filters.purpose} onChange={(v) => handleChange("purpose", v)} />
          
          <button 
            type="button" 
            className="md:hidden flex items-center justify-between bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm font-semibold text-mitram-dark shadow-sm"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-mitram-gold"></span>
              )}
            </div>
            {isMobileFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <div className={`${isMobileFiltersOpen ? 'grid' : 'hidden'} md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6`}>
          <FormField label="Tipo de Imóvel" alwaysFloat>
            <select
              value={filters.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className={filterSelectClasses(!!filters.type)}
              style={SELECT_ARROW_STYLE}
            >
              <option value="">Qualquer</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Cidade" alwaysFloat>
            <select
              value={filters.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className={filterSelectClasses(!!filters.city)}
              style={SELECT_ARROW_STYLE}
            >
              <option value="">Qualquer</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Bairro" alwaysFloat>
            <select
              value={filters.neighborhood}
              onChange={(e) => handleChange("neighborhood", e.target.value)}
              disabled={!filters.city}
              className={filterSelectClasses(!!filters.neighborhood, "disabled:cursor-not-allowed disabled:opacity-50")}
              style={SELECT_ARROW_STYLE}
            >
              <option value="">Qualquer</option>
              {filteredNeighborhoods.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Preço" alwaysFloat>
            <RangeField 
              isActive={!!(filters.min_price || filters.max_price)}
              minValue={filters.min_price}
              maxValue={filters.max_price}
              minPlaceholder="R$ Mínimo"
              maxPlaceholder="R$ Máximo"
              unit="R$"
              onChangeMin={(v) => handleChange("min_price", v)}
              onChangeMax={(v) => handleChange("max_price", v)}
            />
          </FormField>

          <FormField label="Área" alwaysFloat>
            <RangeField 
              isActive={!!(filters.min_area || filters.max_area)}
              minValue={filters.min_area}
              maxValue={filters.max_area}
              minPlaceholder="Mínima m²"
              maxPlaceholder="Máxima m²"
              unit="m²"
              onChangeMin={(v) => handleChange("min_area", v)}
              onChangeMax={(v) => handleChange("max_area", v)}
            />
          </FormField>

          <FormField label="Quartos" alwaysFloat>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleChange("bedrooms", e.target.value)}
              className={filterSelectClasses(!!filters.bedrooms)}
              style={SELECT_ARROW_STYLE}
            >
              <option value="">Qualquer</option>
              {minimumQuantityOptions.map((q) => (
                <option key={q} value={q}>{q}+ Quartos</option>
              ))}
            </select>
          </FormField>

          <FormField label="Suítes" alwaysFloat>
            <select
              value={filters.suites}
              onChange={(e) => handleChange("suites", e.target.value)}
              className={filterSelectClasses(!!filters.suites)}
              style={SELECT_ARROW_STYLE}
            >
              <option value="">Qualquer</option>
              {minimumQuantityOptions.map((q) => (
                <option key={q} value={q}>{q}+ Suítes</option>
              ))}
            </select>
          </FormField>

          <FormField label="Vagas" alwaysFloat>
            <select
              value={filters.parking_spaces}
              onChange={(e) => handleChange("parking_spaces", e.target.value)}
              className={filterSelectClasses(!!filters.parking_spaces)}
              style={SELECT_ARROW_STYLE}
            >
              <option value="">Qualquer</option>
              {minimumQuantityOptions.map((q) => (
                <option key={q} value={q}>{q}+ Vagas</option>
              ))}
            </select>
          </FormField>

          <FormField label="Características" alwaysFloat>
            <select
              value={filters.features}
              onChange={(e) => handleChange("features", e.target.value)}
              className={filterSelectClasses(!!filters.features)}
              style={SELECT_ARROW_STYLE}
            >
              <option value="">Qualquer</option>
              {features.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
          <div className="min-w-0 flex-1">
            <FilterPills activePills={activePills} onRemove={removeFilter} onClearAll={clearAllFilters} />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={toggleView} className={buttonClasses("secondary", "md")}>
              {isMapView ? <><List size={18} /> Lista</> : <><Map size={18} /> Mapa</>}
            </button>

            <button type="submit" className={buttonClasses("primary", "md")}>
              Buscar <Filter size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}