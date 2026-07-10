-- Promote an existing Supabase Auth user to admin.
-- 1. Create the user in Authentication > Users (or sign up once, if enabled).
-- 2. Replace the email below and run in SQL Editor.

UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'seu-email@exemplo.com'
  LIMIT 1
);

-- If the profile row does not exist yet (user created before migrations):
INSERT INTO public.profiles (id, full_name, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'seu-email@exemplo.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', updated_at = now();
