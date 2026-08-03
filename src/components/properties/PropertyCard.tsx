import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, CarFront, Maximize2, Heart } from "lucide-react";

export default function PropertyCard({ property }: { property: any }) {
  const coverImage = property.property_media?.find((m: any) => m.is_cover)?.public_url 
    || property.property_media?.[0]?.public_url 
    || "/images/keys-on-table.jpg"; // Fallback to an existing image

  const priceFormatted = property.price 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)
    : 'Consulte';

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col">
      <Link href={`/imovel/${property.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Ver imóvel</span>
      </Link>

      <div className="relative h-64 w-full bg-gray-200 overflow-hidden">
        <Image 
          src={coverImage}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <span className="bg-mitram-gold/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm uppercase tracking-wide">
            {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
          </span>
          {property.status === 'sold' && (
            <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm uppercase tracking-wide">VENDIDO</span>
          )}
          {property.status === 'rented' && (
            <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm uppercase tracking-wide">ALUGADO</span>
          )}
        </div>
        
        <button className="absolute bottom-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm">
          <Heart size={20} />
        </button>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-mitram-dark line-clamp-1 group-hover:text-mitram-gold transition-colors">{property.title}</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-mitram-gold">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.536c.038.018.067.032.086.042l.006.003.002.001zm-.234-11.458a2 2 0 102.828 2.828 2 2 0 00-2.828-2.828z" clipRule="evenodd" />
          </svg>
          {property.neighborhoods?.name}, {property.neighborhoods?.cities?.name}
        </p>

        <p className="text-2xl font-bold text-mitram-dark mb-6">
          {priceFormatted}
        </p>
        
        <div className="flex items-center justify-between text-gray-600 text-sm border-t border-gray-100 pt-4 mt-auto">
          {property.bedrooms > 0 && (
            <div className="flex flex-col items-center justify-center gap-1">
              <BedDouble size={20} className="text-mitram-gold" />
              <span className="font-medium text-mitram-dark">{property.bedrooms} <span className="text-gray-400 font-normal hidden sm:inline">Quartos</span></span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex flex-col items-center justify-center gap-1">
              <Bath size={20} className="text-mitram-gold" />
              <span className="font-medium text-mitram-dark">{property.bathrooms} <span className="text-gray-400 font-normal hidden sm:inline">Banhos</span></span>
            </div>
          )}
          {property.parking_spaces > 0 && (
            <div className="flex flex-col items-center justify-center gap-1">
              <CarFront size={20} className="text-mitram-gold" />
              <span className="font-medium text-mitram-dark">{property.parking_spaces} <span className="text-gray-400 font-normal hidden sm:inline">Vagas</span></span>
            </div>
          )}
          {property.total_area && (
            <div className="flex flex-col items-center justify-center gap-1">
              <Maximize2 size={20} className="text-mitram-gold" />
              <span className="font-medium text-mitram-dark">{property.total_area} <span className="text-gray-400 font-normal">m²</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
