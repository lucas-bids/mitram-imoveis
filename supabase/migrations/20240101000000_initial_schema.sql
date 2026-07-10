-- Create ENUMs
CREATE TYPE property_purpose AS ENUM ('sale', 'rent');
CREATE TYPE property_status AS ENUM ('draft', 'published', 'archived', 'sold', 'rented', 'trashed');
CREATE TYPE media_type AS ENUM ('image', 'floorplan_image', 'floorplan_pdf');

-- PROFILES
CREATE TABLE profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin')),
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROPERTY TYPES
CREATE TABLE property_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CITIES
CREATE TABLE cities (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  state text not null,
  slug text unique not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NEIGHBORHOODS
CREATE TABLE neighborhoods (
  id uuid default gen_random_uuid() primary key,
  city_id uuid references cities(id) on delete cascade not null,
  name text not null,
  slug text not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(city_id, slug)
);

-- FEATURES
CREATE TABLE features (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROPERTIES
CREATE TABLE properties (
  id uuid default gen_random_uuid() primary key,
  internal_code text unique not null,
  title text not null,
  slug text unique not null,
  purpose property_purpose not null,
  property_type_id uuid references property_types(id) on delete restrict not null,
  status property_status default 'draft' not null,
  price numeric,
  condominium_fee numeric,
  iptu numeric,
  description text,
  street text,
  number text,
  complement text,
  neighborhood_id uuid references neighborhoods(id) on delete restrict,
  city_id uuid references cities(id) on delete restrict,
  state text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  total_area numeric,
  private_area numeric,
  bedrooms integer,
  suites integer,
  bathrooms integer,
  parking_spaces integer,
  floor integer,
  furnished boolean default false,
  youtube_url text,
  virtual_tour_url text,
  featured boolean default false,
  cover_image_id uuid, -- will add FK later
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- PROPERTY FEATURES
CREATE TABLE property_features (
  property_id uuid references properties(id) on delete cascade,
  feature_id uuid references features(id) on delete cascade,
  primary key (property_id, feature_id)
);

-- PROPERTY MEDIA
CREATE TABLE property_media (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  storage_path text not null,
  public_url text not null,
  media_type media_type default 'image' not null,
  alt_text text,
  width integer,
  height integer,
  file_size integer,
  sort_order integer default 0,
  is_cover boolean default false,
  created_at timestamptz default now()
);

ALTER TABLE properties ADD CONSTRAINT fk_cover_image FOREIGN KEY (cover_image_id) REFERENCES property_media(id) ON DELETE SET NULL;

-- INDEXES
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_purpose ON properties(purpose);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_total_area ON properties(total_area);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_city_id ON properties(city_id);
CREATE INDEX idx_properties_neighborhood_id ON properties(neighborhood_id);
CREATE INDEX idx_properties_property_type_id ON properties(property_type_id);
CREATE INDEX idx_properties_featured ON properties(featured);

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;

-- Helper to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Profiles: users read own row; admins manage all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view profiles" ON profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (public.is_admin());

-- Property Types: Public can read active. Admin can read/write all.
CREATE POLICY "Public can read active property types" ON property_types FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage property types" ON property_types FOR ALL USING (public.is_admin());

-- Cities: Public can read active. Admin can read/write all.
CREATE POLICY "Public can read active cities" ON cities FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage cities" ON cities FOR ALL USING (public.is_admin());

-- Neighborhoods: Public can read active. Admin can read/write all.
CREATE POLICY "Public can read active neighborhoods" ON neighborhoods FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage neighborhoods" ON neighborhoods FOR ALL USING (public.is_admin());

-- Features: Public can read active. Admin can read/write all.
CREATE POLICY "Public can read active features" ON features FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage features" ON features FOR ALL USING (public.is_admin());

-- Properties: Public can read published, sold, rented. Admin can read/write all.
CREATE POLICY "Public can read public properties" ON properties FOR SELECT USING (status IN ('published', 'sold', 'rented'));
CREATE POLICY "Admins can manage properties" ON properties FOR ALL USING (public.is_admin());

-- Property Features: Public can read if property is public. Admin can read/write all.
CREATE POLICY "Public can read property features" ON property_features FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE id = property_id AND status IN ('published', 'sold', 'rented'))
);
CREATE POLICY "Admins can manage property features" ON property_features FOR ALL USING (public.is_admin());

-- Property Media: Public can read if property is public. Admin can read/write all.
CREATE POLICY "Public can read property media" ON property_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE id = property_id AND status IN ('published', 'sold', 'rented'))
);
CREATE POLICY "Admins can manage property media" ON property_media FOR ALL USING (public.is_admin());

-- Storage policies (assuming buckets 'property-images' and 'property-floorplans' exist)
-- We will create them via seed or documentation.
