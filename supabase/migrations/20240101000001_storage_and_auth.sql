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
