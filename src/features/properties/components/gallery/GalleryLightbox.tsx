import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface GalleryLightboxProps {
  index: number | null;
  images: { public_url: string }[];
  onClose: () => void;
  onNext: (e: React.MouseEvent) => void;
  onPrev: (e: React.MouseEvent) => void;
}

export function GalleryLightbox({ index, images, onClose, onNext, onPrev }: GalleryLightboxProps) {
  if (index === null) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
      >
        <X size={32} />
      </button>

      <button 
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50"
      >
        <ChevronLeft size={40} />
      </button>

      <button 
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50"
      >
        <ChevronRight size={40} />
      </button>

      <div className="relative w-full h-full max-w-6xl max-h-[85vh] px-16">
        <Image 
          src={images[index].public_url}
          alt={`Imagem ${index + 1}`}
          fill
          className="object-contain"
          priority
        />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-medium">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
