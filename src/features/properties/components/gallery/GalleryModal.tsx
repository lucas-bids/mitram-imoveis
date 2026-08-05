import { X } from "lucide-react";
// eslint-disable-next-line @next/next/no-img-element

interface GalleryModalProps {
  isOpen: boolean;
  images: { public_url: string }[];
  onClose: () => void;
  onOpenLightbox: (index: number) => void;
}

export function GalleryModal({ isOpen, images, onClose, onOpenLightbox }: GalleryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b z-10">
        <h2 className="text-xl font-bold text-mitram-dark">Todas as Fotos ({images.length})</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      <div className="p-4 md:p-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {images.map((img, index) => (
            <div 
              key={index} 
              className="relative break-inside-avoid rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => onOpenLightbox(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img.public_url} 
                alt={`Imagem ${index + 1}`} 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
