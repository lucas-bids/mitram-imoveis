import { PropertyDetail } from "@/features/properties/types";
import { Bed, Bath, Car, Square } from "lucide-react";

export function PropertySummary({ property }: { property: PropertyDetail }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-bold text-mitram-dark mb-4">Resumo</h2>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {property.total_area && (
          <div>
            <p className="text-gray-500 text-sm">Área Total</p>
            <p className="font-semibold flex items-center gap-1"><Square size={16} /> {property.total_area} m²</p>
          </div>
        )}
        {property.private_area && (
          <div>
            <p className="text-gray-500 text-sm">Área Útil</p>
            <p className="font-semibold flex items-center gap-1"><Square size={16} /> {property.private_area} m²</p>
          </div>
        )}
        {(property.bedrooms ?? 0) > 0 && (
          <div>
            <p className="text-gray-500 text-sm">Quartos</p>
            <p className="font-semibold flex items-center gap-1"><Bed size={16} /> {property.bedrooms}</p>
          </div>
        )}
        {(property.suites ?? 0) > 0 && (
          <div>
            <p className="text-gray-500 text-sm">Suítes</p>
            <p className="font-semibold flex items-center gap-1"><Bath size={16} /> {property.suites}</p>
          </div>
        )}
        {(property.bathrooms ?? 0) > 0 && (
          <div>
            <p className="text-gray-500 text-sm">Banheiros</p>
            <p className="font-semibold flex items-center gap-1"><Bath size={16} /> {property.bathrooms}</p>
          </div>
        )}
        {(property.parking_spaces ?? 0) > 0 && (
          <div>
            <p className="text-gray-500 text-sm">Vagas</p>
            <p className="font-semibold flex items-center gap-1"><Car size={16} /> {property.parking_spaces}</p>
          </div>
        )}
        {property.furnished && (
          <div>
            <p className="text-gray-500 text-sm">Mobiliado</p>
            <p className="font-semibold">Sim</p>
          </div>
        )}
      </div>
    </div>
  );
}
