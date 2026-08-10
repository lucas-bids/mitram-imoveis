import { PropertyDetail } from "@/features/properties/types";
import { Bed, Bath, Car, Square } from "lucide-react";
import { cardClasses } from "@/components/ui/cardStyles";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export function PropertySummary({ property }: { property: PropertyDetail }) {
  return (
    <div className={cardClasses("bg-white p-4 md:p-6 rounded-xl")}>
      <Heading as="h2" variant="h4" className="mb-3 md:mb-4">Resumo</Heading>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {property.total_area && (
          <div>
            <Text variant="bodySm">Área Total</Text>
            <p className="font-semibold flex items-center gap-1"><Square size={16} /> {property.total_area} m²</p>
          </div>
        )}
        {property.private_area && (
          <div>
            <Text variant="bodySm">Área Útil</Text>
            <p className="font-semibold flex items-center gap-1"><Square size={16} /> {property.private_area} m²</p>
          </div>
        )}
        {(property.bedrooms ?? 0) > 0 && (
          <div>
            <Text variant="bodySm">Quartos</Text>
            <p className="font-semibold flex items-center gap-1"><Bed size={16} /> {property.bedrooms}</p>
          </div>
        )}
        {(property.suites ?? 0) > 0 && (
          <div>
            <Text variant="bodySm">Suítes</Text>
            <p className="font-semibold flex items-center gap-1"><Bath size={16} /> {property.suites}</p>
          </div>
        )}
        {(property.bathrooms ?? 0) > 0 && (
          <div>
            <Text variant="bodySm">Banheiros</Text>
            <p className="font-semibold flex items-center gap-1"><Bath size={16} /> {property.bathrooms}</p>
          </div>
        )}
        {(property.parking_spaces ?? 0) > 0 && (
          <div>
            <Text variant="bodySm">Vagas</Text>
            <p className="font-semibold flex items-center gap-1"><Car size={16} /> {property.parking_spaces}</p>
          </div>
        )}
        {property.furnished && (
          <div>
            <Text variant="bodySm">Mobiliado</Text>
            <p className="font-semibold">Sim</p>
          </div>
        )}
      </div>
    </div>
  );
}
