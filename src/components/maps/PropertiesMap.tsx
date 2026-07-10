"use client";

import { APIProvider, Map, Marker, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface PropertiesMapProps {
  properties: any[];
}

export default function PropertiesMap({ properties }: PropertiesMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  // Default to Curitiba if no properties
  const defaultCenter = { lat: -25.4284, lng: -49.2733 };

  // Calculate center based on properties or fallback to default
  const center = properties.length > 0 && properties[0].latitude && properties[0].longitude
    ? { lat: Number(properties[0].latitude), lng: Number(properties[0].longitude) }
    : defaultCenter;

  const validProperties = properties.filter(p => p.latitude && p.longitude);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">Google Maps API Key não configurada.</div>;
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={center}
        defaultZoom={12}
        mapId="MITRAM_MAP_ID"
        disableDefaultUI={false}
      >
        {validProperties.map((prop) => (
          <AdvancedMarker
            key={prop.id}
            position={{ lat: Number(prop.latitude), lng: Number(prop.longitude) }}
            onClick={() => setSelectedProperty(prop)}
          >
            <Pin background={"#D4AF37"} borderColor={"#1A1A1A"} glyphColor={"#1A1A1A"} />
          </AdvancedMarker>
        ))}

        {selectedProperty && (
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg w-64 border border-gray-200 z-10 flex gap-3">
            <div className="relative w-20 h-20 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
              <Image 
                src={selectedProperty.property_media?.find((m: any) => m.is_cover)?.public_url || "/images/placeholder.jpg"}
                alt={selectedProperty.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col flex-1 justify-center">
              <h4 className="text-xs font-bold text-mitram-dark line-clamp-2 leading-tight mb-1">{selectedProperty.title}</h4>
              <p className="text-sm font-semibold text-mitram-gold mb-1">
                {selectedProperty.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProperty.price) : 'Consulte'}
              </p>
              <Link href={`/imovel/${selectedProperty.slug}`} className="text-xs text-blue-600 hover:underline">
                Ver detalhes
              </Link>
            </div>
            <button 
              className="absolute top-1 right-2 text-gray-400 hover:text-black text-lg leading-none" 
              onClick={() => setSelectedProperty(null)}
            >
              &times;
            </button>
          </div>
        )}
      </Map>
    </APIProvider>
  );
}
