# Properties & public search

Covers the property data model and the public listing / detail / search
surface. Admin-side editing is in `admin.md`.

## Data model

`properties` is the central table.

- `status`: `draft | published | archived | sold | rented | trashed`
- `purpose`: `sale | rent`

**Public queries always filter `.in("status", ["published", "sold", "rented"])`.**
`draft`, `archived` and `trashed` must never reach a public page. Trashing is a
soft delete — `status = 'trashed'` plus `deleted_at`; see `admin.md`.

Types live in `src/features/properties/types.ts`: `PropertyListItem` (list
queries, media subset), `PropertyDetail` (detail query), `AdminPropertyListItem`.
`PropertyMedia.media_type` is optional because list queries don't select it.

## Query layer

`src/features/properties/queries.ts` centralizes every read. It exports the
media embed constants — **reuse these, don't rewrite the embed syntax**:

- `PROPERTY_MEDIA_EMBED` — the disambiguated FK hint `property_media!property_media_property_id_fkey`
- `PROPERTY_MEDIA_FIELDS` — list queries (`public_url, is_cover, sort_order`)
- `PROPERTY_MEDIA_ALL` — detail queries (`*`)

Readers: `getFeaturedProperties`, `getPublicProperties`, `getPropertyBySlug`,
`getSimilarProperties`, `getSitemapProperties`, `getFilterLookups`,
`getAdminProperties`, `getTrashedProperties`.

`getPropertyBySlug` is wrapped in React `cache()` and is the **only** detail
read: `generateMetadata` and the page both call it, so it costs one round trip
and the status filter cannot drift between them. (The old `getPropertyMetaBySlug`
was deleted precisely because it forgot that filter.) The public status filter is
the shared `PUBLIC_STATUSES` constant — don't re-inline the literal array.

`getSitemapProperties` is the exception: it filters `status = 'published'` only
(sold/rented are `noindex`), selects four columns, and uses `createStaticClient()`
so `sitemap.ts` stays cacheable.

Display helpers are in `src/features/properties/format.ts` — `formatPrice`,
`purposeLabel`, `statusLabel`, `coverImageUrl`, `locationLabel`. Use them
instead of formatting inline, so pt-BR labels stay in one place.

## Search & filtering

**Filter state is URL-driven, not client state.** `src/features/search/filters.ts`
owns it:

- `PropertyFilters` — the shape: `type`, `purpose`, `city`, `neighborhood`,
  `bedrooms`, `suites`, `parking_spaces`, `features`, `min_price`, `max_price`,
  `min_area`, `max_area`, `order`.
- `parseFilters` — accepts either `URLSearchParams` or a Next `searchParams`
  object; `order` defaults to `recentes`.
- `serializeFilters` — drops empty values, so a cleared filter leaves the URL.
- `pruneNeighborhoodIds` — drops selected neighborhoods whose city is no longer
  selected. With no city selected nothing is dropped, because the neighborhood
  list then shows every option.
- `deriveActivePills` — the active-filter pills.

Multi-value fields (`city`, `neighborhood`, `features`, …) are serialized as
**comma-separated ids** in a single query param.

`getPublicProperties()` consumes the same `searchParams` shape and builds the
query incrementally. Feature filtering needs a **two-step lookup**: query
`property_features` for property ids matching the selected feature ids, then
constrain `properties.id` to that set. There is no single-query form for this.
