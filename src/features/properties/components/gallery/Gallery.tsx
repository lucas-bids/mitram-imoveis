"use client";

import { useState, useEffect } from "react";
import { GalleryGrid } from "@/features/properties/components/gallery/GalleryGrid";
import { GalleryModal } from "@/features/properties/components/gallery/GalleryModal";
import { GalleryLightbox } from "@/features/properties/components/gallery/GalleryLightbox";

import { PropertyMedia } from "@/features/properties/types";

interface GalleryProps {
  media: PropertyMedia[];
}

export default function Gallery({ media }: GalleryProps) {
  const images = media;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  return (
    <>
      <GalleryGrid images={images} onOpenModal={openModal} />
      
      <GalleryModal 
        isOpen={isModalOpen} 
        images={images} 
        onClose={closeModal} 
        onOpenLightbox={openLightbox} 
      />

      <GalleryLightbox 
        index={lightboxIndex} 
        images={images} 
        onClose={closeLightbox} 
        onNext={nextLightboxImage} 
        onPrev={prevLightboxImage} 
      />
    </>
  );
}
