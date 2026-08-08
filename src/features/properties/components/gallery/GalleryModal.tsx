import { X } from "lucide-react";

interface GalleryModalProps {
  isOpen: boolean;
  images: { public_url: string }[];
  onClose: () => void;
  onOpenLightbox: (index: number) => void;
}

export function GalleryModal({ isOpen, images, onClose, onOpenLightbox }: GalleryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <h2 className="text-base md:text-lg font-bold text-mitram-dark">Galeria de Fotos</h2>
        <button
          onClick={onClose}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={24} className="text-mitram-dark" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto columns-2 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {images.map((img, index) => (
            <div
              key={index}
              className="break-inside-avoid relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => onOpenLightbox(index)}
            >
              {/* Native img keeps the natural aspect ratio the masonry columns rely on */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.public_url}
                alt={`Imagem ${index + 1}`}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
