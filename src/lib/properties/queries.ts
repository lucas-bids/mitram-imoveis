/**
 * Disambiguated embed for property gallery images.
 * Required because properties also has cover_image_id -> property_media FK.
 */
export const PROPERTY_MEDIA_EMBED =
  "property_media!property_media_property_id_fkey";

export const PROPERTY_MEDIA_FIELDS = `${PROPERTY_MEDIA_EMBED} (public_url, is_cover, sort_order)`;

export const PROPERTY_MEDIA_ALL = `${PROPERTY_MEDIA_EMBED} (*)`;
