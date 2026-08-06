"use client";

import { APIProvider, AdvancedMarker, Map, Pin } from "@vis.gl/react-google-maps";

interface Props {
  latitude: number;
  longitude: number;
  onPositionChange: (latitude: number, longitude: number) => void;
}

export function AddressMapPreview({ latitude, longitude, onPositionChange }: Props) {
  const position = { lat: latitude, lng: longitude };
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Google Maps não está configurado.</p>;

  return (
    <div className="h-72 overflow-hidden rounded-xl border border-gray-200">
      <APIProvider apiKey={apiKey}>
        <Map center={position} defaultZoom={17} mapId="MITRAM_MAP_ID" disableDefaultUI gestureHandling="greedy">
          <AdvancedMarker
            position={position}
            draggable
            onDragEnd={(event) => {
              const next = event.latLng;
              if (next) onPositionChange(next.lat(), next.lng());
            }}
          >
            <Pin background="#D4AF37" borderColor="#1A1A1A" glyphColor="#1A1A1A" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}
