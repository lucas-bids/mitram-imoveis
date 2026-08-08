import { PropertyDetail } from "@/features/properties/types";
import { ExternalLink } from "lucide-react";
import { buttonClasses, buttonShapeClasses } from "@/components/ui/buttonStyles";

export function PropertyMediaLinks({ property }: { property: PropertyDetail }) {
  if (!property.youtube_url && !property.virtual_tour_url) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-base md:text-lg font-bold text-mitram-dark mb-4">Mídia</h2>
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
