import { PropertyDetail } from "@/features/properties/types";
import { formatPrice } from "@/features/properties/format";
import { CalendarCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Text } from "@/components/ui/Text";

export function PropertyPriceCard({ property, whatsappLink }: { property: PropertyDetail, whatsappLink: string }) {
  const priceFormatted = formatPrice(property.price);

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
      <Text variant="bodySm" className="mb-1">Preço Total</Text>
      <p className="text-3xl font-bold text-mitram-dark mb-3 md:mb-4">{priceFormatted}</p>
      {property.condominium_fee && <Text variant="bodySm">Condomínio: R$ {property.condominium_fee}</Text>}
      {property.iptu && <Text variant="bodySm" className="mb-4">IPTU: R$ {property.iptu}</Text>}
      
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses("primary", "md", "w-full")}
      >
        <CalendarCheck size={18} />
        Agendar Visita
      </a>
    </div>
  );
}
