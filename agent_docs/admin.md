# Admin property management

The `/admin` panel: property form, validation, mutations, media. The shared
data model is in `properties.md`; client/RLS boundaries are in `supabase.md`.

## Where the write actually happens

**The create/update write runs client-side.** `PropertyForm.tsx` is a Client
Component that calls `@/lib/supabase/client` and does
`.from("properties").insert(...)` / `.update(...)` directly. There is no server
action wrapping it, so **authorization is enforced by RLS admin policies, not
by a server-action boundary**. Do not assume server-side validation is running:
anything that must be enforced has to exist as an RLS policy or a DB
constraint. The same is true of media writes (`media/mutations.ts`) and address
/ feature writes (`address/mutations.ts`, `features/mutations.ts`).

`src/features/admin/properties/actions.ts` (`"use server"`) covers **only**
lifecycle transitions: `movePropertyToTrash`, `restorePropertyFromTrash`,
`deletePropertyPermanently`. These use the RLS-respecting server client and
call `revalidatePath`.

`queries.ts` exposes `getPropertyFormLookups()` for the form's select options.

## Validation

`src/features/admin/properties/schema.ts` defines a single zod `propertySchema`
used for **both create and edit**; `PropertyFormValues` is its inferred type.

- `internal_code` and `title` are required; `status` here excludes `trashed`.
- `title` (10–100) and `description` (50–3000) carry the feed's length limits
  **at every status**, so a published property can't drift out of the portal.
  The numbers come from `FEED_LIMITS` (`src/features/feed/limits.ts`).
  `internal_code` is read-only when `isEdit` — see `properties.md`.
- Address fields (`street`, `number`, `neighborhood_id`, `city_id`, `state`,
  `postal_code`) are required.
- A `superRefine` rejects null `latitude`/`longitude` with "Confirme o endereço
  no mapa" — **the address must be confirmed on the map before saving**.
- Numeric fields use `z.coerce.number()` because they arrive as form strings.

Validation messages are pt-BR and user-facing. Slugs come from
`slug.ts::generateSlug` (NFD-normalized, accent-stripped, hyphenated).

## Form structure

Sections are declared in `components/form/sections.ts` (`FORM_SECTIONS`:
informações, preço, características, endereço, descrição, fotos) and driven by
`useSectionNavigation.ts`. Adding a field means touching the schema, the
section component, and the payload built in `PropertyForm.tsx`.

Address, features and media each own a subdirectory under `components/` with
their own `mutations.ts`. Address also has `geocode.ts` and `states.ts`.

## Media & images

`components/media/mutations.ts` owns storage and DB writes, plus
`MEDIA_CONSTANTS`:

- `MAX_IMAGES: 30`
- `STORAGE_BUCKET: "property-images"`
- `COMPRESSION`: max 1 MB, max 1920px, **JPEG**, web worker

The format is JPEG, not WebP, because the OLX/ZAP/VivaReal feed only accepts
JPG. This costs the public site nothing — Supabase URLs go through Next's
image optimizer, which serves WebP/AVIF regardless. `scripts/backfill-jpeg-images.mjs`
converts the pre-existing WebP objects. The feed's 5-photo minimum is
`FEED_LIMITS.MIN_IMAGES`; `ImageUpload.tsx` warns below it but doesn't block.

`ImageUpload.tsx` compresses with `browser-image-compression` before upload and
reorders with `@hello-pangea/dnd` (`sort_order`). It takes a **`deferDbWrites`**
prop: on the "new property" screen images are uploaded to storage first and the
`property_media` rows are inserted only after the property row exists and its
id is known. Cover selection goes through `updateCoverImage`.

Deleting media must remove **both** the storage object
(`deleteMediaFromStorage`) and the row (`deleteMediaRecord`) — dropping only
one leaves an orphan.
