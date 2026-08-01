"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { List, Map, Filter, X } from "lucide-react";

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

  const selectBg = 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")';

  // Derivar pílulas ativas
  const activePills = [];
  if (filters.purpose) {
    const label = filters.purpose === 'sale' ? 'Comprar' : 'Alugar';
    activePills.push({ key: 'purpose', label: `Negócio: ${label}` });
  }
  if (filters.type) {
    const name = types.find(t => t.id === filters.type)?.name;
    if (name) activePills.push({ key: 'type', label: `Tipo: ${name}` });
  }
  if (filters.city) {
    const name = cities.find(c => c.id === filters.city)?.name;
    if (name) activePills.push({ key: 'city', label: `Cidade: ${name}` });
  }
  if (filters.neighborhood) {
    const name = neighborhoods.find(n => n.id === filters.neighborhood)?.name;
    if (name) activePills.push({ key: 'neighborhood', label: `Bairro: ${name}` });
  }
  if (filters.bedrooms) activePills.push({ key: 'bedrooms', label: `Quartos: ${filters.bedrooms}+` });
  if (filters.suites) activePills.push({ key: 'suites', label: `Suítes: ${filters.suites}+` });
  if (filters.parking_spaces) activePills.push({ key: 'parking_spaces', label: `Vagas: ${filters.parking_spaces}+` });
  if (filters.features) {
    const name = features.find(f => f.id === filters.features)?.name;
    if (name) activePills.push({ key: 'features', label: `Extra: ${name}` });
  }
  if (filters.min_price) activePills.push({ key: 'min_price', label: `Preço Mín: R$ ${filters.min_price}` });
  if (filters.max_price) activePills.push({ key: 'max_price', label: `Preço Máx: R$ ${filters.max_price}` });
  if (filters.min_area) activePills.push({ key: 'min_area', label: `Área Mín: ${filters.min_area}m²` });
  if (filters.max_area) activePills.push({ key: 'max_area', label: `Área Máx: ${filters.max_area}m²` });

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
    const newFilters = {
      ...filters,
      purpose: "",
      type: "",
      city: "",
      neighborhood: "",
      bedrooms: "",
      suites: "",
      parking_spaces: "",
      features: "",
      min_price: "",
      max_price: "",
      min_area: "",
      max_area: "",
    };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams.toString());
    const keysToRemove = ["purpose", "type", "city", "neighborhood", "bedrooms", "suites", "parking_spaces", "features", "min_price", "max_price", "min_area", "max_area"];
    keysToRemove.forEach(k => params.delete(k));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-[#FAFAFA] rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm">
      <form onSubmit={handleApply} className="space-y-6">
        {/* Top Row: Toggle Comprar / Alugar */}
        <div className="flex">
          <div className="bg-white rounded-full p-1.5 flex shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => handleChange("purpose", "rent")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                filters.purpose === "rent"
                  ? "bg-mitram-gold text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Alugar
            </button>
            <button
              type="button"
              onClick={() => handleChange("purpose", "sale")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                filters.purpose === "sale"
                  ? "bg-mitram-gold text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Comprar
            </button>
          </div>
        </div>

        {/* Middle Row: Main Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* 1. Tipo */}
          <div>
            <select
              value={filters.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className={`w-full bg-white rounded-2xl px-4 py-3.5 text-mitram-dark outline-none focus:ring-2 focus:ring-mitram-gold border border-gray-100 shadow-sm appearance-none cursor-pointer transition-all ${filters.type ? 'ring-2 ring-mitram-gold border-transparent' : ''}`}
              style={{ backgroundImage: selectBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="">Tipo de Imóvel</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Localização */}
          <div>
            <div className="flex gap-2">
              <select
                value={filters.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className={`w-1/2 bg-white rounded-2xl px-4 py-3.5 text-mitram-dark outline-none focus:ring-2 focus:ring-mitram-gold border border-gray-100 shadow-sm appearance-none cursor-pointer text-sm transition-all ${filters.city ? 'ring-2 ring-mitram-gold border-transparent' : ''}`}
                style={{ backgroundImage: selectBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="">Cidade</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <select
                value={filters.neighborhood}
                onChange={(e) => handleChange("neighborhood", e.target.value)}
                disabled={!filters.city}
                className={`w-1/2 bg-white rounded-2xl px-4 py-3.5 text-mitram-dark outline-none focus:ring-2 focus:ring-mitram-gold border border-gray-100 shadow-sm appearance-none cursor-pointer text-sm disabled:opacity-50 transition-all ${filters.neighborhood ? 'ring-2 ring-mitram-gold border-transparent' : ''}`}
                style={{ backgroundImage: selectBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="">Bairro</option>
                {filteredNeighborhoods.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Preço */}
          <div>
            <div className={`flex items-center bg-white rounded-2xl shadow-sm border border-gray-100 px-2 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-mitram-gold focus-within:border-transparent ${(filters.min_price || filters.max_price) ? 'ring-2 ring-mitram-gold border-transparent' : ''}`}>
              <input
                type="number"
                min="0"
                placeholder="R$ Mínimo"
                value={filters.min_price}
                onChange={(e) => handleChange("min_price", e.target.value)}
                className="w-full bg-transparent px-3 py-3.5 outline-none text-mitram-dark text-sm"
              />
              <span className="text-gray-300">Até</span>
              <input
                type="number"
                min="0"
                placeholder="R$ Máximo"
                value={filters.max_price}
                onChange={(e) => handleChange("max_price", e.target.value)}
                className="w-full bg-transparent px-3 py-3.5 outline-none text-mitram-dark text-sm"
              />
            </div>
          </div>

          {/* 4. Área */}
          <div>
            <div className={`flex items-center bg-white rounded-2xl shadow-sm border border-gray-100 px-2 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-mitram-gold focus-within:border-transparent ${(filters.min_area || filters.max_area) ? 'ring-2 ring-mitram-gold border-transparent' : ''}`}>
              <input
                type="number"
                min="0"
                placeholder="Mínima m²"
                value={filters.min_area}
                onChange={(e) => handleChange("min_area", e.target.value)}
                className="w-full bg-transparent px-3 py-3.5 outline-none text-mitram-dark text-sm"
              />
              <span className="text-gray-300">Até</span>
              <input
                type="number"
                min="0"
                placeholder="Máxima m²"
                value={filters.max_area}
                onChange={(e) => handleChange("max_area", e.target.value)}
                className="w-full bg-transparent px-3 py-3.5 outline-none text-mitram-dark text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Secondary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Quartos */}
          <div>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleChange("bedrooms", e.target.value)}
              className={`w-full bg-white rounded-2xl px-4 py-3.5 text-mitram-dark outline-none focus:ring-2 focus:ring-mitram-gold border border-gray-100 shadow-sm appearance-none cursor-pointer transition-all ${filters.bedrooms ? 'ring-2 ring-mitram-gold border-transparent' : ''}`}
              style={{ backgroundImage: selectBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="">Quartos</option>
              {minimumQuantityOptions.map((q) => (
                <option key={q} value={q}>{q}+ Quartos</option>
              ))}
            </select>
          </div>

          {/* Suítes */}
          <div>
            <select
              value={filters.suites}
              onChange={(e) => handleChange("suites", e.target.value)}
              className={`w-full bg-white rounded-2xl px-4 py-3.5 text-mitram-dark outline-none focus:ring-2 focus:ring-mitram-gold border border-gray-100 shadow-sm appearance-none cursor-pointer transition-all ${filters.suites ? 'ring-2 ring-mitram-gold border-transparent' : ''}`}
              style={{ backgroundImage: selectBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="">Suítes</option>
              {minimumQuantityOptions.map((q) => (
                <option key={q} value={q}>{q}+ Suítes</option>
              ))}
            </select>
          </div>

          {/* Vagas */}
          <div>
            <select
              value={filters.parking_spaces}
              onChange={(e) => handleChange("parking_spaces", e.target.value)}
              className={`w-full bg-white rounded-2xl px-4 py-3.5 text-mitram-dark outline-none focus:ring-2 focus:ring-mitram-gold border border-gray-100 shadow-sm appearance-none cursor-pointer transition-all ${filters.parking_spaces ? 'ring-2 ring-mitram-gold border-transparent' : ''}`}
              style={{ backgroundImage: selectBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="">Vagas</option>
              {minimumQuantityOptions.map((q) => (
                <option key={q} value={q}>{q}+ Vagas</option>
              ))}
            </select>
          </div>

          {/* Características */}
          <div>
            <select
              value={filters.features}
              onChange={(e) => handleChange("features", e.target.value)}
              className={`w-full bg-white rounded-2xl px-4 py-3.5 text-mitram-dark outline-none focus:ring-2 focus:ring-mitram-gold border border-gray-100 shadow-sm appearance-none cursor-pointer transition-all ${filters.features ? 'ring-2 ring-mitram-gold border-transparent' : ''}`}
              style={{ backgroundImage: selectBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="">Características</option>
              {features.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions Row with Active Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4">
          {/* Active Pills (Bottom Left) */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {activePills.map(pill => (
              <div key={pill.key} className="flex items-center gap-1.5 bg-mitram-gold/10 text-[#A6851D] px-3 py-1.5 rounded-full text-xs font-bold border border-mitram-gold/30">
                <span>{pill.label}</span>
                <button 
                  type="button" 
                  onClick={() => removeFilter(pill.key)}
                  className="hover:bg-mitram-gold/20 rounded-full p-0.5 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Buttons (Bottom Right) */}
          <div className="flex items-center gap-3 shrink-0">
            {activePills.length > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-mitram-dark underline underline-offset-2 transition-colors mr-2"
              >
                Limpar filtros
              </button>
            )}

            <button
              type="button"
              onClick={toggleView}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm text-mitram-dark border border-gray-100"
            >
              {isMapView ? (
                <>
                  <List size={18} /> Lista
                </>
              ) : (
                <>
                  <Map size={18} /> Mapa
                </>
              )}
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-mitram-dark px-8 py-3 text-sm font-bold text-white hover:bg-mitram-gold hover:text-mitram-dark transition-all duration-300 shadow-md"
            >
              Buscar <Filter size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
