"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home, Building2 } from "lucide-react";

import { cardClasses } from "@/components/ui/cardStyles";
import { FilterOption, pruneNeighborhoodIds } from "@/features/search/filters";
import { MultiSelectField } from "@/features/search/components/MultiSelectField";

interface QuickSearchProps {
  types: FilterOption[];
  cities: FilterOption[];
  neighborhoods: (FilterOption & { city_id?: string })[];
}

const TRIGGER_CLASSES =
  "w-full bg-transparent border-0 p-0 text-sm text-gray-500 focus:ring-0 cursor-pointer appearance-none outline-none";

export default function QuickSearch({ types, cities, neighborhoods }: QuickSearchProps) {
  const [selectedType, setSelectedType] = useState("");
  const [selectedCities, setSelectedCities] = useState("");
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState("");
  const router = useRouter();

  const selectedCityIds = selectedCities ? selectedCities.split(",").filter(Boolean) : [];
  const filteredNeighborhoods = neighborhoods.filter(
    n => selectedCityIds.length === 0 || (n.city_id && selectedCityIds.includes(n.city_id)),
  );

  const handleCitiesChange = (value: string) => {
    setSelectedCities(value);
    setSelectedNeighborhoods((prev) => pruneNeighborhoodIds(prev, value, neighborhoods));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedType) params.append("type", selectedType);
    if (selectedCities) params.append("city", selectedCities);
    if (selectedNeighborhoods) params.append("neighborhood", selectedNeighborhoods);

    router.push(`/imoveis?${params.toString()}`);
  };

  return (
    <div className={cardClasses("bg-white rounded-[2rem] p-1 md:p-3 max-w-4xl mx-auto")}>
      <form onSubmit={handleSearch} className="grid grid-cols-2 md:flex md:flex-row md:items-center md:divide-x md:divide-gray-100">
        
        <div className="col-span-1 border-r border-b border-gray-100 md:border-0 md:flex-1 px-4 py-3 md:py-2">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-mitram-gold" />
            <label className="text-sm font-semibold text-mitram-dark">Localização</label>
          </div>
          <MultiSelectField
            options={cities}
            value={selectedCities}
            onChange={handleCitiesChange}
            placeholder="Qualquer cidade"
            triggerClassName={TRIGGER_CLASSES}
          />
        </div>

        <div className="col-span-1 border-b border-gray-100 md:border-0 md:flex-1 px-4 py-3 md:py-2">
          <div className="flex items-center gap-2 mb-1">
            <Home size={16} className="text-mitram-gold" />
            <label className="text-sm font-semibold text-mitram-dark">Bairro</label>
          </div>
          <MultiSelectField
            options={filteredNeighborhoods}
            value={selectedNeighborhoods}
            onChange={setSelectedNeighborhoods}
            placeholder="Qualquer bairro"
            disabled={selectedCityIds.length === 0 && filteredNeighborhoods.length === 0}
            emptyMessage="Nenhum bairro disponível."
            triggerClassName={TRIGGER_CLASSES}
          />
        </div>
        
        <div className="col-span-2 border-b border-gray-100 md:border-0 md:flex-1 px-4 py-3 md:py-2">
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

        <div className="col-span-2 md:w-auto px-3 py-3 md:py-0 md:px-3">
          <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-mitram-dark text-white rounded-full font-semibold hover:bg-black transition-all shadow-md">
            <Search size={18} />
            <span>Buscar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
