export type PropertyPurpose = 'sale' | 'rent';
export type PropertyStatus = 'draft' | 'published' | 'archived' | 'sold' | 'rented' | 'trashed';
export type MediaType = 'image' | 'floorplan_image' | 'floorplan_pdf';

export type PropertyMedia = {
  id: string;
  public_url: string;
  is_cover: boolean;
  sort_order: number;
  storage_path?: string;
  // Absent on list queries, which only select a subset of the media columns
  media_type?: MediaType;
};

// Represents what is returned by the list query
export type PropertyListItem = {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  purpose: PropertyPurpose;
  status: PropertyStatus;
  total_area: number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  latitude?: number | null;
  longitude?: number | null;
  property_types: { name: string } | null;
  neighborhoods: { name: string; cities: { name: string } | null } | null;
  property_media: PropertyMedia[] | null;
};

// Represents what is returned by the detail query
export type PropertyDetail = {
  id: string;
  title: string;
  slug: string;
  purpose: PropertyPurpose;
  status: PropertyStatus;
  price: number | null;
  condominium_fee: number | null;
  iptu: number | null;
  description: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood_id: string | null;
  city_id: string | null;
  state: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  total_area: number | null;
  private_area: number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  furnished: boolean;
  youtube_url: string | null;
  virtual_tour_url: string | null;
  featured: boolean;
  cover_image_id: string | null;
  property_type_id: string | null;
  property_types: { name: string } | null;
  neighborhoods: { name: string; cities: { name: string; state: string } | null } | null;
  property_media: PropertyMedia[] | null;
  property_features: { features: { name: string } }[] | null;
};

export type AdminPropertyListItem = {
  id: string;
  internal_code: string;
  title: string;
  slug: string;
  purpose: PropertyPurpose;
  status: PropertyStatus;
  price: number | null;
  featured: boolean;
  created_at: string;
  property_types: { name: string } | null;
  neighborhoods: { name: string; cities: { name: string } | null } | null;
};
