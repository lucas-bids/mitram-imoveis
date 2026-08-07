"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home, Building2 } from "lucide-react";

import { FilterOption } from "@/features/search/filters";

interface QuickSearchProps {
  types: FilterOption[];
  cities: FilterOption[];
  neighborhoods: (FilterOption & { city_id?: string })[];
}

export default function QuickSearch({ types, cities, neighborhoods }: QuickSearchProps) {
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const router = useRouter();

  const filteredNeighborhoods = neighborhoods.filter(n => !selectedCity || n.city_id === selectedCity);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedType) params.append("type", selectedType);
    if (selectedCity) params.append("city", selectedCity);
    if (selectedNeighborhood) params.append("neighborhood", selectedNeighborhood);
    
    router.push(`/imoveis?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-2 md:p-3 max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
        
        <div className="w-full md:flex-1 px-4 py-2">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-mitram-gold" />
            <label className="text-sm font-semibold text-mitram-dark">Localização</label>
          </div>
          <select 
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedNeighborhood("");
            }}
            className="w-full bg-transparent border-0 p-0 text-sm text-gray-500 focus:ring-0 cursor-pointer appearance-none outline-none"
          >
            <option value="">Qualquer cidade</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="w-full md:flex-1 px-4 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Home size={16} className="text-mitram-gold" />
            <label className="text-sm font-semibold text-mitram-dark">Bairro</label>
          </div>
          <select 
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="w-full bg-transparent border-0 p-0 text-sm text-gray-500 focus:ring-0 cursor-pointer appearance-none outline-none"
            disabled={!selectedCity && filteredNeighborhoods.length === 0}
          >
            <option value="">Qualquer bairro</option>
            {filteredNeighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>
        
        <div className="w-full md:flex-1 px-4 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-mitram-gold" />
            <label className="text-sm font-semibold text-mitram-dark">Tipo de imóvel</label>
          </div>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-transparent border-0 p-0 text-sm text-gray-500 focus:ring-0 cursor-pointer appearance-none outline-none"
          >
            <option value="">Qualquer tipo</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="w-full md:w-auto px-2 py-2 md:py-0 mt-2 md:mt-0">
          <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-mitram-dark text-white rounded-full font-semibold hover:bg-black transition-all shadow-md">
            <Search size={18} />
            <span>Buscar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
