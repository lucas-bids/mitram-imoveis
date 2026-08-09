import { PropertyDetail } from "@/features/properties/types";
import { Check } from "lucide-react";
import { Heading } from "@/components/ui/Heading";

export function PropertyFeatures({ property }: { property: PropertyDetail }) {
  if (!property.property_features || property.property_features.length === 0) return null;

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
      <Heading as="h2" variant="h4" className="mb-3 md:mb-4">Características</Heading>
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
