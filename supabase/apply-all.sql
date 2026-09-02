-- psql only: \i is a psql meta-command, the Supabase SQL Editor does not
-- implement it. Run from the repo root on a fresh project:
--
--   psql "$DATABASE_URL" -f supabase/apply-all.sql
--
-- In the SQL Editor, paste setup-complete.sql instead (README.md §1, Opção A).
-- Order: schema -> storage/auth -> hardening -> seed
--
-- Every migration must be listed here, in the same order npm run db:apply
-- applies them (filename order). A missing entry means a project bootstrapped
-- this way is weaker than a migrated one.
--
-- Afterwards run verify.sql (schema exists) and security-check.sql (schema is
-- locked down). See README.md §4 before publishing.

\i supabase/migrations/20240101000000_initial_schema.sql
\i supabase/migrations/20240101000001_storage_and_auth.sql
\i supabase/migrations/20260806000000_address_location.sql
\i supabase/migrations/20260811000000_fix_profile_role_escalation.sql
\i supabase/migrations/20260811000001_profiles_role_guard.sql
\i supabase/seed.sql
