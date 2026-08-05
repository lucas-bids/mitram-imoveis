import PropertyCard from "@/features/properties/components/PropertyCard";
import { PropertyListItem } from "@/features/properties/types";

export function PropertySimilar({ properties }: { properties: PropertyListItem[] }) {
  if (!properties || properties.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-xl font-bold text-mitram-dark mb-6">Imóveis Semelhantes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((prop) => (
          <PropertyCard key={prop.id} property={prop} />
        ))}
      </div>
    </div>
  );
}
