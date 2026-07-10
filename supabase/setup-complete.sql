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
-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'property-images',
    'property-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'property-floorplans',
    'property-floorplans',
    true,
    20971520,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
CREATE POLICY "Public can read property storage"
ON storage.objects FOR SELECT
USING (bucket_id IN ('property-images', 'property-floorplans'));

CREATE POLICY "Admins can upload property storage"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('property-images', 'property-floorplans')
  AND public.is_admin()
);

CREATE POLICY "Admins can update property storage"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('property-images', 'property-floorplans')
  AND public.is_admin()
);

CREATE POLICY "Admins can delete property storage"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('property-images', 'property-floorplans')
  AND public.is_admin()
);

-- Auto-create profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Sequence for internal property codes (MIT-0001, MIT-0002, ...)
CREATE SEQUENCE IF NOT EXISTS property_internal_code_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_internal_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_value integer;
BEGIN
  next_value := nextval('property_internal_code_seq');
  RETURN 'MIT-' || lpad(next_value::text, 4, '0');
END;
$$;
-- Insert default Admin (password handled by Supabase Auth, but we can't create Auth easily in pure SQL without pgcrypto/extensions, usually we do it via Dashboard)
-- So the seed will insert types, cities, neighborhoods, features, and properties.

-- We assume an admin user exists or we create properties without checking auth (bypassing RLS or running as superuser)

-- Property Types
INSERT INTO property_types (id, name, slug, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'Casa', 'casa', 1),
('22222222-2222-2222-2222-222222222222', 'Apartamento', 'apartamento', 2),
('33333333-3333-3333-3333-333333333333', 'Sobrado', 'sobrado', 3),
('44444444-4444-4444-4444-444444444444', 'Terreno', 'terreno', 4),
('55555555-5555-5555-5555-555555555555', 'Chácara', 'chacara', 5),
('66666666-6666-6666-6666-666666666666', 'Casa em condomínio', 'casa-em-condominio', 6)
ON CONFLICT (slug) DO NOTHING;

-- Cities
INSERT INTO cities (id, name, state, slug) VALUES
('aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Curitiba', 'PR', 'curitiba')
ON CONFLICT (slug) DO NOTHING;

-- Neighborhoods
INSERT INTO neighborhoods (id, city_id, name, slug) VALUES
('bbbb1111-bbbb-1111-bbbb-1111bbbb1111', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Hauer', 'hauer'),
('bbbb2222-bbbb-2222-bbbb-2222bbbb2222', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Santa Felicidade', 'santa-felicidade'),
('bbbb3333-bbbb-3333-bbbb-3333bbbb3333', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Guaíra', 'guaira'),
('bbbb4444-bbbb-4444-bbbb-4444bbbb4444', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Bigorrilho', 'bigorrilho'),
('bbbb5555-bbbb-5555-bbbb-5555bbbb5555', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Pilarzinho', 'pilarzinho'),
('bbbb6666-bbbb-6666-bbbb-6666bbbb6666', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'Abranches', 'abranches')
ON CONFLICT (city_id, slug) DO NOTHING;

-- Features
INSERT INTO features (id, name, slug) VALUES
('cccc1111-cccc-1111-cccc-1111cccc1111', 'Churrasqueira', 'churrasqueira'),
('cccc2222-cccc-2222-cccc-2222cccc2222', 'Piscina', 'piscina'),
('cccc3333-cccc-3333-cccc-3333cccc3333', 'Elevador', 'elevador'),
('cccc4444-cccc-4444-cccc-4444cccc4444', 'Sacada', 'sacada'),
('cccc5555-cccc-5555-cccc-5555cccc5555', 'Área de serviço', 'area-de-servico'),
('cccc6666-cccc-6666-cccc-6666cccc6666', 'Portaria 24h', 'portaria-24h')
ON CONFLICT (slug) DO NOTHING;

-- Properties
INSERT INTO properties (id, internal_code, title, slug, purpose, property_type_id, status, price, description, city_id, neighborhood_id, bedrooms, bathrooms, parking_spaces, total_area, featured)
VALUES
('dddd1111-dddd-1111-dddd-1111dddd1111', 'MIT-0001', 'Casa Comercial no Hauer', 'casa-comercial-no-hauer', 'sale', '11111111-1111-1111-1111-111111111111', 'published', 1000000.00, 'Excelente casa comercial', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb1111-bbbb-1111-bbbb-1111bbbb1111', 4, 3, 2, 300, true),
('dddd2222-dddd-2222-dddd-2222dddd2222', 'MIT-0002', 'Apartamento em Santa Felicidade', 'apartamento-em-santa-felicidade', 'sale', '22222222-2222-2222-2222-222222222222', 'published', 599000.00, 'Apartamento bem localizado', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', 3, 2, 1, 90, true),
('dddd3333-dddd-3333-dddd-3333dddd3333', 'MIT-0003', 'Sobrado no Guaíra', 'sobrado-no-guaira', 'sale', '33333333-3333-3333-3333-333333333333', 'published', 499000.00, 'Sobrado amplo', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb3333-bbbb-3333-bbbb-3333bbbb3333', 3, 2, 2, 120, true),
('dddd4444-dddd-4444-dddd-4444dddd4444', 'MIT-0004', 'Apartamento no Bigorrilho', 'apartamento-no-bigorrilho', 'rent', '22222222-2222-2222-2222-222222222222', 'published', 4490.00, 'Excelente apartamento para alugar', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb4444-bbbb-4444-bbbb-4444bbbb4444', 2, 1, 1, 65, true),
('dddd5555-dddd-5555-dddd-5555dddd5555', 'MIT-0005', 'Casa em condomínio fechado Pilarzinho', 'casa-em-condominio-fechado-pilarzinho', 'sale', '66666666-6666-6666-6666-666666666666', 'published', 1795000.00, 'Casa alto padrão', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb5555-bbbb-5555-bbbb-5555bbbb5555', 4, 4, 3, 400, true),
('dddd6666-dddd-6666-dddd-6666dddd6666', 'MIT-0006', 'Terreno no Abranches', 'terreno-no-abranches', 'sale', '44444444-4444-4444-4444-444444444444', 'published', 730000.00, 'Excelente terreno para construção', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb6666-bbbb-6666-bbbb-6666bbbb6666', 0, 0, 0, 800, true),
('dddd7777-dddd-7777-dddd-7777dddd7777', 'MIT-0007', 'Apartamento vendido no Hauer', 'apartamento-vendido-no-hauer', 'sale', '22222222-2222-2222-2222-222222222222', 'sold', 420000.00, 'Imóvel vendido recentemente', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb1111-bbbb-1111-bbbb-1111bbbb1111', 2, 1, 1, 70, false),
('dddd8888-dddd-8888-dddd-8888dddd8888', 'MIT-0008', 'Casa alugada em Santa Felicidade', 'casa-alugada-em-santa-felicidade', 'rent', '11111111-1111-1111-1111-111111111111', 'rented', 3500.00, 'Imóvel alugado', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb2222-bbbb-2222-bbbb-2222bbbb2222', 3, 2, 2, 150, false),
('dddd9999-dddd-9999-dddd-9999dddd9999', 'MIT-0009', 'Rascunho de imóvel', 'rascunho-de-imovel', 'sale', '33333333-3333-3333-3333-333333333333', 'draft', 550000.00, 'Imóvel em rascunho para testes administrativos', 'aaaa1111-aaaa-1111-aaaa-1111aaaa1111', 'bbbb3333-bbbb-3333-bbbb-3333bbbb3333', 3, 2, 1, 110, false)
ON CONFLICT (internal_code) DO NOTHING;

-- Sync internal code sequence after fixed seed codes (only if migration 00001 was applied)
DO $$
BEGIN
  IF to_regclass('public.property_internal_code_seq') IS NOT NULL THEN
    PERFORM setval(
      'property_internal_code_seq',
      GREATEST(
        (SELECT COALESCE(MAX(CAST(SUBSTRING(internal_code FROM 5) AS integer)), 0) FROM properties),
        1
      ),
      true
    );
  END IF;
END $$;

-- Property Features
INSERT INTO property_features (property_id, feature_id) VALUES
('dddd2222-dddd-2222-dddd-2222dddd2222', 'cccc1111-cccc-1111-cccc-1111cccc1111'),
('dddd2222-dddd-2222-dddd-2222dddd2222', 'cccc3333-cccc-3333-cccc-3333cccc3333'),
('dddd5555-dddd-5555-dddd-5555dddd5555', 'cccc1111-cccc-1111-cccc-1111cccc1111'),
('dddd5555-dddd-5555-dddd-5555dddd5555', 'cccc2222-cccc-2222-cccc-2222cccc2222'),
('dddd5555-dddd-5555-dddd-5555dddd5555', 'cccc6666-cccc-6666-cccc-6666cccc6666')
ON CONFLICT DO NOTHING;

-- Insert bucket if we could (must be done in console or through API usually, but SQL can be used if extension pg_net is available or direct insert to storage.buckets)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true) ON CONFLICT DO NOTHING;
