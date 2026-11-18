# Supabase: clients, auth, RLS

Client boundaries, the admin gate, and where database rules live.

## The four clients

| Module | Use in | RLS |
| --- | --- | --- |
| `src/lib/supabase/server.ts` | Server Components, route handlers, server actions | Respects RLS |
| `src/lib/supabase/client.ts` | Client Components only | Respects RLS (anon/authenticated) |
| `src/lib/supabase/static.ts` | Cached routes that must not touch cookies — `src/app/sitemap.ts` and the portal feed (`src/features/feed/queries.ts`) | Respects RLS (anon) |
| `src/lib/supabase/admin.ts` | Trusted server-side admin mutations | **Bypasses RLS** |

`createStaticClient()` exists because `server.ts` calls `cookies()`, and that call
is exactly what marks a route dynamic — using it in `sitemap.ts` would defeat
`revalidate`. It uses the **publishable** key, so RLS still applies and the
sitemap cannot leak a draft. It is not a substitute for `server.ts` anywhere a
user session matters.

`createAdminClient()` uses `SUPABASE_SECRET_KEY` and is **server-only** — never
import it into a Client Component or any module reachable from one. Its **only**
importer is `src/features/admin/users/server.ts` (`import "server-only"`), for
what PostgREST can't do: the Auth Admin API (create user with password, set
password, ban, delete, change email, list users) and inserts into the
`user_management_events` audit log. Nothing in it sends email. Every caller
first passes `getAdminActor()`, which checks via `my_access()` that the caller
is an active admin with a non-revoked session. Profile writes (role, name,
deactivation, session cutoff) go through the `admin_update_profile` /
`admin_revoke_sessions` RPCs with the admin's own session — not the service
role — so the database checks `is_admin()` and the triggers still judge them. Do not add new importers
without saying why — the RLS-respecting server client is almost always right.

Because admin property writes happen from a Client Component (see `admin.md`),
**RLS policies are the real authorization layer** for the admin panel. A change
that relaxes a policy relaxes the panel's security.

## Middleware / auth gate

`src/middleware.ts` → `src/lib/supabase/middleware.ts::updateSession`.

- Short-circuits immediately for any path **not** under `/admin` — the public
  site never pays for a Supabase round trip.
- Refreshes the session cookie via `@supabase/ssr`.
- For non-auth `/admin/*` paths: redirects to `/admin/login?next=…` when there
  is no user; otherwise reads `my_access()` and redirects to
  `/admin/login?error=deactivated | session_expired | unauthorized`
  (`panelDenial`, `src/features/admin/users/roles.ts`), signing the local
  session out for the first two.
- `/admin/usuarios/*` additionally requires `admin` (`canManageUsers`);
  editors are redirected to `/admin/imoveis`. The users layout, pages and every
  action re-check via `getAdminActor()`.
- The only auth route excluded from the gate is `/admin/login`.
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
- `promote-admin.sql` — bootstraps the **first** admin. After that, admins
  invite and promote users from `/admin/usuarios`.

Storage buckets: `property-images` and `property-floorplans`, with policies in
`20240101000001_storage_and_auth.sql`.

### Roles: admin and editor

`20261116000000_user_roles.sql` defines the model:

- `profiles.role` ∈ {`admin`, `editor`} (NULL = no access);
  `profiles.deactivated_at` set = deactivated.
- `public.is_staff()` — active admin **or** editor. Gates every **content**
  write policy (properties, cities, neighborhoods, features, property types,
  media, `storage.objects`). Policies are named `"Staff can manage …"`.
- `public.is_admin()` — active admin only. Gates `profiles` and the audit log.
  Never gate `profiles` or `user_management_events` with `is_staff()`.
- `enforce_profile_role_change` blocks non-admin changes to `role` **and**
  `deactivated_at`.
- The column grant still leaves `role` / `deactivated_at` unwritable by
  `authenticated` — admins included. The only write path is
  `public.admin_update_profile(target_id, new_full_name, new_role,
  set_deactivated)`: SECURITY DEFINER, checks `is_admin()` itself, EXECUTE for
  `authenticated` only. Never "fix" an admin write by granting the column.
- `enforce_last_admin` (BEFORE UPDATE OR DELETE on `profiles`, advisory-locked)
  refuses any change leaving zero active admins — on every path, including the
  `auth.users` delete cascade and service role. Error: SQLSTATE `23514`, hint
  `last_admin`.
- `user_management_events` — append-only (trigger), SELECT for `is_admin()`,
  no write grant for anon/authenticated; inserts only via service role.

**No email anywhere.** Admins create users with a password
(`auth.admin.createUser`, `email_confirm: true`) and reset passwords in the
panel. There is no invite, confirmation or "forgot password" route; only
`/admin/login` is outside the middleware gate. Do not reintroduce email flows.

**Instant session cutoff** (`20261117000000_admin_managed_passwords.sql`):
`profiles.sessions_valid_after` is set by `admin_revoke_sessions()` (after a
password reset) and by `admin_update_profile(..., set_deactivated => true)`.
`is_staff()` / `is_admin()` reject any JWT whose `amr` sign-in timestamp
(`current_session_auth_time()`, preserved across refreshes) predates it.
`public.my_access()` returns `(role, active, session_current)` for the caller;
the middleware, login and `getAdminActor()` use it, so a cut-off session also
can't reach the service-role Admin API.

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

Public signup must stay disabled in the Supabase dashboard — users are created
only by admin invite, and while it is open every "authenticated can X" policy effectively
reads "anyone can X". `supabase/README.md` §4 is the operational source of truth
for the full pre-launch checklist; the SQL in this repo is not evidence about
the live database.

Any migration touching policies, grants or `profiles` warrants a
`security-reviewer` pass.
