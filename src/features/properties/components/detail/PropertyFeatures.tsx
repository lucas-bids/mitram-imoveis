import { PropertyDetail } from "@/features/properties/types";
import { Check } from "lucide-react";

export function PropertyFeatures({ property }: { property: PropertyDetail }) {
  if (!property.property_features || property.property_features.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-base md:text-lg font-bold text-mitram-dark mb-4">Características</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3">
        {property.property_features.map((pf: { features: { name: string } }, index: number) => (
          <div key={index} className="flex items-center gap-2 text-gray-700">
            <Check size={18} className="text-mitram-gold" />
            {pf.features.name}
          </div>
        ))}
      </div>
    </div>
  );
}
