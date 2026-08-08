import { PropertyDetail } from "@/features/properties/types";
import { MapPin } from "lucide-react";
import { locationLabel, purposeLabel, statusLabel } from "@/features/properties/format";
import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";

export function PropertyHeading({ property }: { property: PropertyDetail }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge tone="gold">{purposeLabel(property.purpose)}</Badge>
        <Badge tone="gray">{property.property_types?.name}</Badge>
        {property.status === 'sold' && <Badge tone="red">{statusLabel(property.status)}</Badge>}
        {property.status === 'rented' && <Badge tone="red">{statusLabel(property.status)}</Badge>}
      </div>
      <Heading as="h1" variant="h2" className="mb-2">{property.title}</Heading>
      <p className="text-gray-600 flex items-center gap-1">
        <MapPin size={18} />
        {property.street && `${property.street}, `}
        {property.number && `${property.number} - `}
        {locationLabel(property.neighborhoods)} - {property.neighborhoods?.cities?.state}
      </p>
    </div>
  );
}
