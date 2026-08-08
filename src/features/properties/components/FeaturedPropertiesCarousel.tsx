"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "@/features/properties/components/PropertyCard";
import { PropertyListItem } from "@/features/properties/types";

interface FeaturedPropertiesCarouselProps {
  properties: PropertyListItem[];
}

export default function FeaturedPropertiesCarousel({
  properties,
}: FeaturedPropertiesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);

    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const lastIndex = Math.max(0, properties.length - itemsPerView);

  const moveTo = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const nextIndex = Math.min(Math.max(index, 0), lastIndex);
      const track = trackRef.current;
      const item = track?.children[nextIndex] as HTMLElement | undefined;

      if (track && item) {
        track.scrollTo({ left: item.offsetLeft, behavior });
      }

      setCurrentIndex(nextIndex);
    },
    [lastIndex],
  );

  useEffect(() => {
    if (currentIndex > lastIndex) {
      moveTo(lastIndex, "auto");
    }
  }, [currentIndex, lastIndex, moveTo]);

  // Keep dots in sync when the user swipes on mobile (native scroll-snap).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const syncIndexFromScroll = () => {
      if (window.innerWidth >= 768) return;

      const children = Array.from(track.children) as HTMLElement[];
      let closest = 0;
      let minDistance = Infinity;

      children.forEach((child, index) => {
        const distance = Math.abs(child.offsetLeft - track.scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          closest = index;
        }
      });

      setCurrentIndex(Math.min(closest, lastIndex));
    };

    track.addEventListener("scroll", syncIndexFromScroll, { passive: true });
    track.addEventListener("scrollend", syncIndexFromScroll);

    return () => {
      track.removeEventListener("scroll", syncIndexFromScroll);
      track.removeEventListener("scrollend", syncIndexFromScroll);
    };
  }, [lastIndex]);

  return (
    <div>
      <div className="relative">
        <div
          ref={trackRef}
          className="relative grid auto-cols-[100%] grid-flow-col gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:auto-cols-[calc((100%_-_1.5rem)/2)] md:overflow-hidden lg:auto-cols-[calc((100%_-_3rem)/3)]"
          aria-label="Imóveis em destaque"
          aria-live="polite"
        >
          {properties.map((property) => (
            <div key={property.id} className="snap-start">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

        {properties.length > itemsPerView && (
          <>
            <button
              type="button"
              onClick={() => moveTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              aria-label="Ver imóveis anteriores"
              className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-mitram-dark shadow-lg transition-colors hover:bg-mitram-gold disabled:cursor-not-allowed disabled:opacity-40 md:-left-5 md:flex"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => moveTo(currentIndex + 1)}
              disabled={currentIndex === lastIndex}
              aria-label="Ver próximos imóveis"
              className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-mitram-dark shadow-lg transition-colors hover:bg-mitram-gold disabled:cursor-not-allowed disabled:opacity-40 md:-right-5 md:flex"
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {lastIndex > 0 && (
        <div
          className="mt-4 flex justify-center gap-2 md:mt-7"
          aria-label="Escolher posição do carrossel"
        >
          {Array.from({ length: lastIndex + 1 }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => moveTo(index)}
              aria-label={`Ir para a posição ${index + 1}`}
              aria-current={currentIndex === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index
                  ? "w-7 bg-mitram-gold"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
