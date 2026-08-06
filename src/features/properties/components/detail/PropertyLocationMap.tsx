"use client";

import { APIProvider, AdvancedMarker, Map, Pin } from "@vis.gl/react-google-maps";

export function PropertyLocationMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">Google Maps não configurado.</div>;
  const position = { lat: Number(latitude), lng: Number(longitude) };

  return (
    <APIProvider apiKey={apiKey}>
      <Map defaultCenter={position} defaultZoom={16} mapId="MITRAM_MAP_ID" gestureHandling="cooperative" mapTypeControl={false} streetViewControl={false}>
        <AdvancedMarker position={position}>
          <Pin background="#D4AF37" borderColor="#1A1A1A" glyphColor="#1A1A1A" />
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
}
