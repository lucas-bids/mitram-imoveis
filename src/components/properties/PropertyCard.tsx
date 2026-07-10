import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Car, Square } from "lucide-react";

export default function PropertyCard({ property }: { property: any }) {
  const coverImage = property.property_media?.find((m: any) => m.is_cover)?.public_url 
    || property.property_media?.[0]?.public_url 
    || "/images/placeholder.jpg"; // Replace with actual placeholder

  const priceFormatted = property.price 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)
    : 'Consulte';

  return (
    <Link href={`/imovel/${property.slug}`} className="group block bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative h-64 w-full bg-gray-200">
        <Image 
          src={coverImage}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-mitram-dark/80 text-white text-xs font-semibold px-2 py-1 rounded backdrop-blur-sm">
            {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
          </span>
          {property.status === 'sold' && (
            <span className="bg-red-600/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">VENDIDO</span>
          )}
          {property.status === 'rented' && (
            <span className="bg-red-600/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">ALUGADO</span>
          )}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-medium text-mitram-gold uppercase tracking-wider">
            {property.property_types?.name}
          </p>
          <p className="text-lg font-bold text-mitram-dark">
            {priceFormatted}
          </p>
        </div>
        
        <h3 className="text-lg font-semibold text-mitram-dark mb-1 line-clamp-1">{property.title}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-1">
          {property.neighborhoods?.name}, {property.neighborhoods?.cities?.name}
        </p>
        
        <div className="flex items-center gap-4 text-gray-600 text-sm border-t pt-4">
          {property.total_area && (
            <div className="flex items-center gap-1" title="Área Total">
              <Square size={16} />
              <span>{property.total_area} m²</span>
            </div>
          )}
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1" title="Quartos">
              <Bed size={16} />
              <span>{property.bedrooms} {property.suites ? `(${property.suites} suítes)` : ''}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1" title="Banheiros">
              <Bath size={16} />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.parking_spaces > 0 && (
            <div className="flex items-center gap-1" title="Vagas">
              <Car size={16} />
              <span>{property.parking_spaces}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
