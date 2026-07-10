"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryProps {
  media: any[];
}

export default function Gallery({ media }: GalleryProps) {
  const images = media.filter(m => m.media_type === 'image');
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-500">Sem imagens disponíveis</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full h-[400px] md:h-[500px] bg-black rounded-lg overflow-hidden">
        <Image
          src={images[currentIndex].public_url}
          alt={`Imagem ${currentIndex + 1}`}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
        />
        {images.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              &#10094;
            </button>
            <button 
              onClick={() => setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              &#10095;
            </button>
          </>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {images.map((img, idx) => (
            <button 
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-24 h-24 rounded overflow-hidden transition-all ${currentIndex === idx ? 'ring-2 ring-mitram-gold opacity-100' : 'opacity-60 hover:opacity-100'}`}
            >
              <Image
                src={img.public_url}
                alt={`Miniatura ${idx + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
