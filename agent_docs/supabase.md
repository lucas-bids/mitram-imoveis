# Supabase: clients, auth, RLS

Client boundaries, the admin gate, and where database rules live.

## The four clients

| Module | Use in | RLS |
| --- | --- | --- |
| `src/lib/supabase/server.ts` | Server Components, route handlers, server actions | Respects RLS |
| `src/lib/supabase/client.ts` | Client Components only | Respects RLS (anon/authenticated) |
| `src/lib/supabase/static.ts` | Cached routes that must not touch cookies — today only `src/app/sitemap.ts` | Respects RLS (anon) |
| `src/lib/supabase/admin.ts` | Trusted server-side admin mutations | **Bypasses RLS** |

`createStaticClient()` exists because `server.ts` calls `cookies()`, and that call
is exactly what marks a route dynamic — using it in `sitemap.ts` would defeat
`revalidate`. It uses the **publishable** key, so RLS still applies and the
sitemap cannot leak a draft. It is not a substitute for `server.ts` anywhere a
user session matters.

`createAdminClient()` uses `SUPABASE_SECRET_KEY` and is **server-only** — never
import it into a Client Component or any module reachable from one. It is
currently **not used anywhere in `src/`**; the guardrail is preventative. If a
task appears to need it, say why before reaching for it — the RLS-respecting
server client is almost always the right answer.

Because admin property writes happen from a Client Component (see `admin.md`),
**RLS policies are the real authorization layer** for the admin panel. A change
that relaxes a policy relaxes the panel's security.

## Middleware / auth gate

`src/middleware.ts` → `src/lib/supabase/middleware.ts::updateSession`.

- Short-circuits immediately for any path **not** under `/admin` — the public
  site never pays for a Supabase round trip.
- Refreshes the session cookie via `@supabase/ssr`.
- For non-auth `/admin/*` paths: redirects to `/admin/login?next=…` when there
  is no user, and to `/admin/login?error=unauthorized` when
  `profiles.role !== 'admin'`.
- Auth routes excluded from the gate: `/admin/login`,
  `/admin/recuperar-senha`, `/admin/redefinir-senha`.
- A signed-in admin hitting `/admin/login` or `/admin` is redirected to
  `/admin/imoveis`.

Changing the route matcher in `src/middleware.ts` or the `AUTH_ROUTES` list can
silently open the panel — treat it as a security-relevant edit.

## Database

`supabase/` is the source of truth.

- `migrations/*.sql` — applied in filename order by `npm run db:apply`
  (`scripts/apply-migrations.mjs`), followed by `seed.sql`.
- `setup-complete.sql` — the consolidated bootstrap run in the SQL Editor. **A
  new migration must also be reflected here**, or fresh projects diverge from
  migrated ones.
- `apply-all.sql` — `\i` list of every migration, in filename order. A new
  migration must be added here too.
- `verify.sql` — post-setup assertions (8 tables, 3 enums, 2 buckets).
- `security-check.sql` — read-only security audit: RLS on every public table,
  `profiles.role` unwritable by anon/authenticated (checked with
  `has_column_privilege`, so grants to `PUBLIC` count), guard trigger present
  and enabled, `is_admin()`'s own body intact, and no write policy whose gating
  expression omits `is_admin()`. Every row must read `OK`. That last check is a
  substring test — it catches a missing gate, not an `OR`-ed one, so README §4.3
  pairs it with a manual read of the policy expressions. Re-run after any
  migration touching policies, grants or `profiles`.
- `promote-admin.sql` — the only supported way to grant `role = 'admin'`.

Storage buckets: `property-images` and `property-floorplans`, with policies in
`20240101000001_storage_and_auth.sql`.

### Role-escalation hardening — do not regress

An earlier `"Users can update own profile"` policy let an authenticated user
run `update profiles set role = 'admin'` on their own row. Fixed by two
migrations that run in this order and must stay in it:

1. `20260811000000_fix_profile_role_escalation.sql` — drops the policy and, more
   importantly, revokes the table-level UPDATE grant, re-granting only
   `full_name` and `updated_at`. That grant is what actually makes `role`
   unwritable through PostgREST.
2. `20260811000001_profiles_role_guard.sql` — re-creates
   `"Users can update own profile"` in a column-constrained form and adds the
   `enforce_profile_role_change` trigger.

So the canonical end state has **two** UPDATE policies on `profiles`, not one.
`security-check.sql` asserts exactly that. **Never add a policy or grant that
lets a non-admin write `profiles.role`.**

Public signup must stay disabled in the Supabase dashboard — admins are created
manually, and while it is open every "authenticated can X" policy effectively
reads "anyone can X". `supabase/README.md` §4 is the operational source of truth
for the full pre-launch checklist; the SQL in this repo is not evidence about
the live database.

Any migration touching policies, grants or `profiles` warrants a
`security-reviewer` pass.
