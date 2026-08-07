"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

import { GOOGLE_MAP_MARKER_ICON, GOOGLE_MAP_STYLES } from "@/lib/googleMaps";

export function PropertyLocationMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">Google Maps não configurado.</div>;
  const position = { lat: Number(latitude), lng: Number(longitude) };

  return (
    <APIProvider apiKey={apiKey}>
      <Map defaultCenter={position} defaultZoom={16} styles={GOOGLE_MAP_STYLES} gestureHandling="cooperative" mapTypeControl={false} streetViewControl={false}>
        <Marker position={position} icon={GOOGLE_MAP_MARKER_ICON} />
      </Map>
    </APIProvider>
  );
}
