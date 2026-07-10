"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Map, List, SlidersHorizontal, X } from "lucide-react";

interface AdvancedFiltersProps {
  types: any[];
  cities: any[];
  neighborhoods: any[];
}

export default function AdvancedFilters({ types, cities, neighborhoods }: AdvancedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);

  // Parse state from URL
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    purpose: searchParams.get("purpose") || "",
    city: searchParams.get("city") || "",
    neighborhood: searchParams.get("neighborhood") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    order: searchParams.get("order") || "recentes",
  });

  const isMapView = searchParams.get("view") === "map";

  const handleChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key === "city") {
        newFilters.neighborhood = "";
      }
      return newFilters;
    });
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    const defaultFilters = {
      type: "",
      purpose: "",
      city: "",
      neighborhood: "",
      bedrooms: "",
      min_price: "",
      max_price: "",
      order: "recentes",
    };
    setFilters(defaultFilters);
    
    const params = new URLSearchParams();
    if (isMapView) params.set("view", "map");
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
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

  const filteredNeighborhoods = neighborhoods.filter(n => !filters.city || n.city_id === filters.city);

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-4">
        {/* Quick horizontal filters for desktop */}
        <div className="hidden lg:flex items-center gap-4 flex-1">
          <select 
            value={filters.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
            className="border-gray-300 rounded text-sm py-2 px-3 bg-white"
          >
            <option value="">Finalidade</option>
            <option value="sale">Comprar</option>
            <option value="rent">Alugar</option>
          </select>

          <select 
            value={filters.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="border-gray-300 rounded text-sm py-2 px-3 bg-white"
          >
            <option value="">Tipo de Imóvel</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <select 
            value={filters.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="border-gray-300 rounded text-sm py-2 px-3 bg-white"
          >
            <option value="">Cidade</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <button 
            onClick={(e) => handleApply(e as unknown as React.FormEvent)}
            className="bg-mitram-gold text-mitram-dark font-medium px-4 py-2 rounded text-sm hover:bg-yellow-500"
          >
            Buscar
          </button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 border border-gray-300 rounded px-4 py-2 text-sm bg-white hover:bg-gray-50"
          >
            <SlidersHorizontal size={16} /> Filtros Avançados
          </button>
          
          <button 
            onClick={toggleView}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 border border-gray-300 rounded px-4 py-2 text-sm bg-white hover:bg-gray-50"
          >
            {isMapView ? <><List size={16} /> Lista</> : <><Map size={16} /> Mapa</>}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isOpen && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-inner">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-semibold text-mitram-dark">Filtros Avançados</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Finalidade</label>
              <select value={filters.purpose} onChange={(e) => handleChange("purpose", e.target.value)} className="w-full border-gray-300 rounded py-2 px-3">
                <option value="">Qualquer</option>
                <option value="sale">Comprar</option>
                <option value="rent">Alugar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo</label>
              <select value={filters.type} onChange={(e) => handleChange("type", e.target.value)} className="w-full border-gray-300 rounded py-2 px-3">
                <option value="">Qualquer</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Cidade</label>
              <select value={filters.city} onChange={(e) => handleChange("city", e.target.value)} className="w-full border-gray-300 rounded py-2 px-3">
                <option value="">Qualquer</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bairro</label>
              <select value={filters.neighborhood} onChange={(e) => handleChange("neighborhood", e.target.value)} className="w-full border-gray-300 rounded py-2 px-3" disabled={!filters.city}>
                <option value="">Qualquer</option>
                {filteredNeighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Quartos Mínimo</label>
              <input type="number" value={filters.bedrooms} onChange={(e) => handleChange("bedrooms", e.target.value)} min={0} className="w-full border-gray-300 rounded py-2 px-3" placeholder="Ex: 2" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ordenação</label>
              <select value={filters.order} onChange={(e) => handleChange("order", e.target.value)} className="w-full border-gray-300 rounded py-2 px-3">
                <option value="recentes">Mais recentes</option>
                <option value="menor_preco">Menor preço</option>
                <option value="maior_preco">Maior preço</option>
                <option value="maior_area">Maior área</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t mt-2">
              <button type="button" onClick={handleClear} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100">
                Limpar Filtros
              </button>
              <button type="submit" className="px-6 py-2 text-sm bg-mitram-dark text-white rounded hover:bg-black font-medium">
                Aplicar Filtros
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
