export const GOOGLE_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "all", stylers: [{ visibility: "on" }] },
  { featureType: "poi.attraction", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.business", elementType: "all", stylers: [{ visibility: "on" }] },
  { featureType: "poi.business", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.business", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi.government", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.school", elementType: "all", stylers: [{ visibility: "on" }] },
  { featureType: "poi.school", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "all", stylers: [{ visibility: "on" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
];

export const GOOGLE_MAP_MARKER_ICON =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44"><path fill="#D4AF37" stroke="#FFFFFF" stroke-width="2" d="M16 1C7.7 1 1 7.7 1 16c0 11 15 27 15 27s15-16 15-27C31 7.7 24.3 1 16 1Z"/><circle cx="16" cy="16" r="5" fill="#FFFFFF"/></svg>',
  );
