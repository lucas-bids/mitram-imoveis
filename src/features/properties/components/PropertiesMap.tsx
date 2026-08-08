"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { PropertyListItem } from "@/features/properties/types";
import { formatPrice, coverImageUrl } from "@/features/properties/format";
import { GOOGLE_MAP_MARKER_ICON, GOOGLE_MAP_STYLES } from "@/lib/googleMaps";
import { Heading } from "@/components/ui/Heading";

interface PropertiesMapProps {
  properties: PropertyListItem[];
}

export default function PropertiesMap({ properties }: PropertiesMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyListItem | null>(null);

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
        styles={GOOGLE_MAP_STYLES}
        disableDefaultUI={false}
      >
        {validProperties.map((prop) => (
          <Marker
            key={prop.id}
            position={{ lat: Number(prop.latitude), lng: Number(prop.longitude) }}
            onClick={() => setSelectedProperty(prop)}
            icon={GOOGLE_MAP_MARKER_ICON}
          />
        ))}

        {selectedProperty && (
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg w-64 border border-gray-200 z-10 flex gap-3">
            <div className="relative w-20 h-20 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
              <Image 
                src={coverImageUrl(selectedProperty.property_media)}
                alt={selectedProperty.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col flex-1 justify-center">
              <Heading as="h4" variant="micro" className="line-clamp-2 mb-1">{selectedProperty.title}</Heading>
              <p className="text-sm font-semibold text-mitram-gold mb-1">
                {formatPrice(selectedProperty.price)}
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
