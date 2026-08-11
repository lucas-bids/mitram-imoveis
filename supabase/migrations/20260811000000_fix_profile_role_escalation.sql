-- SECURITY FIX: privilege escalation through self-service profile updates.
--
-- The "Users can update own profile" policy allowed any authenticated user to
-- run `update profiles set role = 'admin' where id = auth.uid()`, because the
-- USING/WITH CHECK expressions only constrained the row (auth.uid() = id), not
-- the columns. Combined with public signup, that made full admin takeover a
-- single PostgREST call away: public.is_admin() would then return true and every
-- policy built on it (properties, cities, neighborhoods, features, storage)
-- would open up.
--
-- Nothing in the application updates the profiles table from the client — it is
-- only read (login screen and middleware) — so the policy is removed outright.

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Defense in depth: make the role column unwritable through PostgREST, so a
-- permissive policy added later cannot reopen the escalation path.
--
-- The table-level UPDATE grant Supabase gives anon/authenticated covers every
-- column, and a column-level REVOKE does not subtract from it — the table-level
-- grant has to be dropped first and the allowed columns granted back.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (full_name, updated_at) ON public.profiles TO authenticated;

-- Admin promotion stays a deliberate, out-of-band action (see
-- supabase/promote-admin.sql), which runs as postgres/service_role and is
-- unaffected by the grants above. The handle_new_user() trigger is
-- SECURITY DEFINER, so profile creation on signup is unaffected too.
