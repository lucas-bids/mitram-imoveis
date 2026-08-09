import { PropertyDetail } from "@/features/properties/types";
import { ExternalLink } from "lucide-react";
import { buttonClasses, buttonShapeClasses } from "@/components/ui/buttonStyles";
import { Heading } from "@/components/ui/Heading";

export function PropertyMediaLinks({ property }: { property: PropertyDetail }) {
  if (!property.youtube_url && !property.virtual_tour_url) return null;

  return (
    <div>
      <Heading as="h2" variant="h4" className="mb-3 md:mb-4">Mídia</Heading>
      <div className="flex gap-4 flex-wrap">
        {property.youtube_url && (
          <a href={property.youtube_url} target="_blank" rel="noopener noreferrer" className={buttonShapeClasses("md", "bg-red-600 text-white shadow-md hover:bg-red-700")}>
            <ExternalLink size={18} /> Ver Vídeo no YouTube
          </a>
        )}
        {property.virtual_tour_url && (
          <a href={property.virtual_tour_url} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "md")}>
            <ExternalLink size={18} /> Abrir Tour Virtual
          </a>
        )}
      </div>
    </div>
  );
}
