"use client";

import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, CarFront, Maximize2, Heart } from "lucide-react";
import { PropertyListItem } from "@/features/properties/types";
import { formatPrice, purposeLabel, statusLabel, locationLabel } from "@/features/properties/format";

import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";

export default function PropertyCard({ property }: { property: PropertyListItem }) {
  const allMedia = property.property_media && property.property_media.length > 0 
    ? [...property.property_media].sort((a, b) => {
        if (a.is_cover) return -1;
        if (b.is_cover) return 1;
        return a.sort_order - b.sort_order;
      })
    : [{ public_url: '/images/keys-on-table.jpg', id: 'placeholder' }];
  
  const coverImage = allMedia[0];

  const priceFormatted = formatPrice(property.price);

  return (
    <div className="group relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md flex flex-col bg-mitram-dark">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-100">
          <Image 
            src={coverImage.public_url}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      </div>

      <Link href={`/imovel/${property.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Ver imóvel {property.title}</span>
      </Link>

      {/* Top section: Badges and Heart */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <Badge tone="gold">{purposeLabel(property.purpose)}</Badge>
          {property.status === 'sold' && <Badge tone="red">{statusLabel(property.status)}</Badge>}
          {property.status === 'rented' && <Badge tone="red">{statusLabel(property.status)}</Badge>}
        </div>
        <button 
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 hover:text-red-500 transition-all shadow-sm pointer-events-auto hover:bg-white"
          onClick={(e) => { e.preventDefault(); /* Handle heart */ }}
        >
          <Heart size={20} />
        </button>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20 pointer-events-none">
        
        {/* Title and Price */}
        <div className="flex justify-between items-end gap-3 mb-1">
          <Heading as="h3" variant="h4" tone="light" className="line-clamp-1 flex-1 leading-tight">{property.title}</Heading>
          <p className="text-lg md:text-xl font-bold text-white whitespace-nowrap">
            {priceFormatted}
          </p>
        </div>
        
        {/* Location */}
        <p className="text-sm text-gray-300 mb-3 md:mb-4 line-clamp-1">
          {locationLabel(property.neighborhoods)}
        </p>

        {/* Amenities */}
        <div className="flex items-center gap-3 md:gap-4 text-white text-sm font-medium">
          {(property.bedrooms ?? 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <BedDouble size={16} className="text-white/80" />
              <span>{property.bedrooms} <span className="font-normal opacity-80">Quartos</span></span>
            </div>
          )}
          {(property.bathrooms ?? 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath size={16} className="text-white/80" />
              <span>{property.bathrooms} <span className="font-normal opacity-80">Banhos</span></span>
            </div>
          )}
          {property.total_area && (
            <div className="flex items-center gap-1.5">
              <Maximize2 size={16} className="text-white/80" />
              <span>{property.total_area} <span className="font-normal opacity-80">m²</span></span>
            </div>
          )}
          {!property.total_area && (property.parking_spaces ?? 0) > 0 && (
             <div className="flex items-center gap-1.5">
               <CarFront size={16} className="text-white/80" />
               <span>{property.parking_spaces} <span className="font-normal opacity-80">Vagas</span></span>
             </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
