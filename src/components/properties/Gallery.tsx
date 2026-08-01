"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryProps {
  media: any[];
}

export default function Gallery({ media }: GalleryProps) {
  const images = media.filter(m => m.media_type === 'image');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen || lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen, lightboxIndex]);

  if (images.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-gray-200 flex items-center justify-center rounded-2xl">
        <span className="text-gray-500">Sem imagens disponíveis</span>
      </div>
    );
  }

  // Helper to safely get image URL or placeholder
  const getImgUrl = (index: number) => {
    if (index < images.length) return images[index].public_url;
    return "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"; // Placeholder for missing images if we want to force the grid, but better to just show what we have.
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  const prevLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    }
  };

  // Render the initial grid based on how many images we have
  const renderGrid = () => {
    if (images.length === 1) {
      return (
        <div className="w-full h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden cursor-pointer group" onClick={openModal}>
          <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[500px]">
          <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={openModal}>
            <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
          </div>
          <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group hidden md:block" onClick={openModal}>
            <Image src={getImgUrl(1)} alt="Imagem 2" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
          </div>
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[500px]">
          <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={openModal}>
            <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4 h-full">
            <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={openModal}>
              <Image src={getImgUrl(1)} alt="Imagem 2" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
            </div>
            <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={openModal}>
              <Image src={getImgUrl(2)} alt="Imagem 3" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
            </div>
          </div>
        </div>
      );
    }

    // 4 or more images (The reference layout)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[500px]">
        {/* Left Image */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={openModal}>
          <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        
        {/* Right Side */}
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          {/* Top Image */}
          <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={openModal}>
            <Image src={getImgUrl(1)} alt="Imagem 2" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority sizes="50vw" />
          </div>
          
          {/* Bottom Row */}
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={openModal}>
              <Image src={getImgUrl(2)} alt="Imagem 3" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
            </div>
            <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={openModal}>
              <Image src={getImgUrl(3)} alt="Imagem 4" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
              {images.length > 4 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                  <span className="text-white text-2xl font-bold">+{images.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Grid */}
      {renderGrid()}

      {/* Fullscreen Masonry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
            <h2 className="text-xl font-bold text-mitram-dark">Galeria de Fotos</h2>
            <button 
              onClick={closeModal}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={24} className="text-mitram-dark" />
            </button>
          </div>
          
          {/* Masonry Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto columns-2 gap-4 md:gap-6 space-y-4 md:space-y-6">
              {images.map((img, idx) => (
                <div 
                  key={img.id || idx} 
                  className="break-inside-avoid relative rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => openLightbox(idx)}
                >
                  {/* Using standard img tag for masonry to allow natural height, or Image with layout="responsive" */}
                  <img 
                    src={img.public_url} 
                    alt={`Imagem ${idx + 1}`} 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox (Enlarged Image) */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center"
          onClick={closeLightbox}
        >
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white z-10"
          >
            <X size={24} />
          </button>

          {images.length > 1 && (
            <>
              <button 
                onClick={prevLightboxImage}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white z-10"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={nextLightboxImage}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white z-10"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-auto px-4 md:px-16 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIndex].public_url}
              alt={`Imagem ampliada ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
