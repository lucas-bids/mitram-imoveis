# Architecture details

## Property data model

`properties` is the central table; `status` is one of
`draft | published | archived | sold | rented | trashed`; `purpose` is
`sale | rent`. Public queries always filter
`status in (published, sold, rented)`. Trashing is a soft delete
(`status = 'trashed'`, `deleted_at` set) — see
`src/features/admin/properties/actions.ts` for trash/restore/permanent-delete.

`src/features/properties/queries.ts` centralizes all reads and defines the
media embed constants `PROPERTY_MEDIA_FIELDS` (list) and `PROPERTY_MEDIA_ALL`
(detail) — reuse these, don't rewrite the embed syntax. Types live in
`src/features/properties/types.ts`: `PropertyListItem`, `PropertyDetail`,
`AdminPropertyListItem`.

## Search & filtering

Filter state is URL-driven, not client state. `src/features/search/filters.ts`
defines `PropertyFilters`, parses/serializes it, and derives active filter
pills. `getPublicProperties()` in `properties/queries.ts` consumes the same
searchParams shape and builds the query incrementally, including a two-step
lookup for feature filters (query `property_features` for matching IDs
first, then filter `properties.id in (...)`).

## Admin property form

`src/features/admin/properties/schema.ts` defines the zod `propertySchema`
for both create and edit. Address fields require confirmed lat/lng via a
`superRefine`. Form is split into sections under `components/form/`; address,
features, and media each have their own subcomponents and `mutations.ts`.
Image upload uses `@hello-pangea/dnd` + `browser-image-compression`.

## Contact / lead forms

`src/features/contact/actions.ts` — `submitContactForm` handles both the
general contact form and property-scheduling. In-memory IP rate limiting
(3 req/min, not reliable across serverless instances — known limitation),
honeypot field, email via `nodemailer` (`SMTP_*` env vars). No external
rate-limit store; `LEAD_RATE_LIMIT_SECRET` is reserved for a future fix.

## Supabase clients

- `src/lib/supabase/server.ts` — Server Components/route handlers, respects RLS.
- `src/lib/supabase/client.ts` — Client Components only.
- `src/lib/supabase/admin.ts` — service-role, bypasses RLS, server-only (see
  guardrail in root CLAUDE.md).
- `src/middleware.ts` → `src/lib/supabase/middleware.ts` — refreshes session,
  gate-keeps `/admin/*` via `profiles.role === 'admin'`. Auth routes
  (`/admin/login`, `/admin/recuperar-senha`, `/admin/redefinir-senha`) excluded.