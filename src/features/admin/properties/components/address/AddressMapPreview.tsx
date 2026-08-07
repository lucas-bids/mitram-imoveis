"use client";

import { Map, Marker } from "@vis.gl/react-google-maps";

import { GOOGLE_MAP_MARKER_ICON, GOOGLE_MAP_STYLES } from "@/lib/googleMaps";

interface Props {
  latitude: number;
  longitude: number;
  onPositionChange: (latitude: number, longitude: number) => void;
}

/** Relies on the APIProvider rendered by AddressSection. */
export function AddressMapPreview({ latitude, longitude, onPositionChange }: Props) {
  const position = { lat: latitude, lng: longitude };

  return (
    <div className="h-72 overflow-hidden rounded-xl border border-gray-200">
      <Map center={position} defaultZoom={17} styles={GOOGLE_MAP_STYLES} disableDefaultUI gestureHandling="greedy">
        <Marker
          position={position}
          draggable
          icon={GOOGLE_MAP_MARKER_ICON}
          onDragEnd={(event) => {
            const next = event.latLng;
            if (next) onPositionChange(next.lat(), next.lng());
          }}
        />
      </Map>
    </div>
  );
}
