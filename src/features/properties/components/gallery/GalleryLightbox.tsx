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
    <div
      className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-black/95 rounded-full hover:bg-white/20 transition-colors text-white z-10"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-black/95 rounded-full hover:bg-black/20 transition-colors text-white z-10"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-black/95 rounded-full hover:bg-black/20 transition-colors text-white z-10"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div
        className="relative w-full h-full max-w-5xl max-h-[80vh] mx-auto px-4 md:px-16 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index].public_url}
          alt={`Imagem ampliada ${index + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
