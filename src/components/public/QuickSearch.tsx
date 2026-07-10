"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuickSearchProps {
  types: any[];
  cities: any[];
  neighborhoods: any[];
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
    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tipo de imóvel</label>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-gray-50 border-0 rounded px-4 py-3 text-mitram-dark focus:ring-2 focus:ring-mitram-gold"
          >
            <option value="">Todos os tipos</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Cidade</label>
          <select 
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedNeighborhood("");
            }}
            className="w-full bg-gray-50 border-0 rounded px-4 py-3 text-mitram-dark focus:ring-2 focus:ring-mitram-gold"
          >
            <option value="">Todas as cidades</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Bairro</label>
          <select 
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="w-full bg-gray-50 border-0 rounded px-4 py-3 text-mitram-dark focus:ring-2 focus:ring-mitram-gold"
            disabled={!selectedCity && filteredNeighborhoods.length === 0}
          >
            <option value="">Todos os bairros</option>
            {filteredNeighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>

        <div className="flex items-end">
          <button type="submit" className="w-full md:w-auto px-8 py-3 bg-mitram-gold text-mitram-dark font-semibold rounded hover:bg-yellow-500 transition-colors">
            Buscar
          </button>
        </div>
      </form>
    </div>
  );
}
