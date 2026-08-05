import { PropertyDetail } from "@/features/properties/types";
import { formatPrice } from "@/features/properties/format";
import { CalendarCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";

export function PropertyPriceCard({ property, whatsappLink }: { property: PropertyDetail, whatsappLink: string }) {
  const priceFormatted = formatPrice(property.price);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">Preço Total</p>
      <p className="text-3xl font-bold text-mitram-dark mb-4">{priceFormatted}</p>
      {property.condominium_fee && <p className="text-sm text-gray-500">Condomínio: R$ {property.condominium_fee}</p>}
      {property.iptu && <p className="text-sm text-gray-500 mb-4">IPTU: R$ {property.iptu}</p>}
      
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
