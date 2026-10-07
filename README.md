# Mitram Imóveis

Website and listings platform for **Mitram Imóveis**, a real estate agency
serving Curitiba and the surrounding region in Brazil. The project replaces the
agency's previous WordPress site with a custom application built on
**Next.js 15 (App Router) + Supabase**, live at
[mitramimoveis.com.br](https://mitramimoveis.com.br).

The system has two sides:

- **Public website** — property search with filters, list or map view, a
  detail page with gallery, video and location, and lead capture through
  contact forms and WhatsApp.
- **Admin panel** (`/admin`) — full property management, photo handling,
  listing status control, and automatic syndication to the OLX, ZAP Imóveis
  and VivaReal portals.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Database & auth | Supabase (PostgreSQL, Row Level Security, Auth, Storage) |
| Styling | Tailwind CSS |
| Forms & validation | React Hook Form + Zod |
| Maps | Google Maps Platform (`@vis.gl/react-google-maps`) |
| Hosting | Netlify (SSR via serverless functions, Netlify Forms) |

---

## Features

### Public website

- **Faceted search** by property type, purpose, city, neighborhood, bedrooms,
  suites, parking spaces, amenities, price range and area. All search state
  lives in the URL — shareable, works with browser history, and never
  duplicated in client state.
- **List or map view**: results can be browsed on an interactive map with a
  marker per property.
- **Property page** with photo gallery, YouTube video, virtual tour, location
  map, amenities and breadcrumbs.
- **Lead capture** through three forms (general contact, callback about a
  specific property, and land valuation) plus a WhatsApp shortcut with a
  pre-filled message.
- Cookie notice and privacy policy page.

### Admin panel

- Authentication with Supabase Auth, including password recovery and reset.
- **Full property CRUD**, including duplicating an existing listing as the
  starting point for a new one.
- **Listing lifecycle**: draft, published, sold, rented, archived and trash —
  with restore or permanent deletion.
- **Photo upload** with in-browser compression before upload and
  drag-and-drop ordering.
- **Map-confirmed addresses**: a property can only be saved after its location
  has been visually confirmed on a map, guaranteeing reliable coordinates for
  the public map and the portals.

### Portal syndication (OLX / ZAP / VivaReal)

The `/api/feed/olx.xml` endpoint generates a **VrSync** (GrupoZap) XML feed of
every published property, which the portals ingest daily.

The portals' requirements (minimum photo count, title and description length,
areas, bedrooms per property type, valid video URLs, and more) are centralized
in a single module (`src/features/feed/rules.ts`) used in three places:

1. **In the property form**, to block publishing an incomplete listing;
2. **In the admin listing table**, to flag properties excluded from the portal;
3. **In the feed itself**, to decide what gets sent.

As a result, the admin panel never accepts a listing that the portal would
later silently reject.

---

## Engineering decisions

**Security enforced in the database, not just the app.** Permissions are
applied through PostgreSQL **Row Level Security** policies. Visitors can only
read properties with a public status; only users with `role = 'admin'` can
write. Dedicated migrations prevent users from escalating their own role, and
the service-role key (which bypasses RLS) is not used anywhere in the
application.

**Technical SEO built on the App Router**, with no third-party SEO library:

- `sitemap.xml` revalidated hourly, with each property's real `<lastmod>`;
- structured data (JSON-LD) for the organization and for each listing;
- canonicals and an indexing policy per listing state: filtered `/imoveis`
  URLs are `noindex, follow` with a canonical to the main listing; sold or
  rented properties stay reachable but `noindex`; drafts and trashed listings
  return 404;
- deploy previews are blocked from indexing (`robots.txt` and `X-Robots-Tag`);
- the production build **fails** if the site's canonical URL is misconfigured.

**Validation at the boundary.** Every input — forms, URL filters, feed data —
goes through Zod schemas before moving further in. Search filters are typed so
that adding a new parameter without handling its indexing behavior breaks the
build.

**Domain-oriented structure.** Routes in `src/app/` are thin and delegate to
modules in `src/features/`, each owning its queries, schemas and components.
Supabase query shapes live in `queries.ts` modules, never inside components.

**Forms without an email backend.** Leads go through Netlify Forms with a
honeypot and spam filtering — no SMTP server or extra credentials to maintain.

**Migration from the previous site.** The project includes infrastructure for
301 redirects from legacy URLs (`src/lib/legacy-redirects.mjs`). Since the
portals only accept JPEG, new uploads are stored in that format, and a script
(`scripts/backfill-jpeg-images.mjs`) converts the existing library without
leaving broken images if it is interrupted.

---

## Project structure

```
src/
├── app/            # Routes (pages, layouts, route handlers) — thin layer
├── features/       # Domain modules
│   ├── properties/     # Reading and displaying properties
│   ├── search/         # Filters and URL search state
│   ├── admin/          # Admin: form, media, address, lifecycle
│   ├── feed/           # VrSync feed and portal rules
│   ├── contact/        # Lead forms
│   └── home/           # Home page content and components
├── components/     # Shared UI primitives and layout
└── lib/            # Supabase clients, SEO, logger, utilities
supabase/           # SQL migrations, seed and setup scripts (database source of truth)
scripts/            # Migration runner and media maintenance
```

The user interface is in Brazilian Portuguese, so routes, form names and UI
copy are in Portuguese.

---

## Running locally

### Prerequisites

- Node.js 18+
- A Supabase project
- A Google Maps API key

### Installation

```bash
cp .env.example .env.local   # fill in your environment's values
npm install
npm run dev
```

### Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # type checking (tsc --noEmit)
npm run db:apply   # apply migrations and seed (requires DATABASE_URL)
```

### Database

The full guide is in [`supabase/README.md`](supabase/README.md). In short:

1. Run `supabase/setup-complete.sql` in the SQL Editor **or** `npm run db:apply`
   with `DATABASE_URL` set — the script applies `supabase/migrations/*.sql` in
   order, then `supabase/seed.sql`.
2. Create the admin user under **Authentication > Users** and run
   `supabase/promote-admin.sql` (replacing the email).
3. Under **Authentication > URL Configuration**, add `http://localhost:3000/**`
   and the production domain to **Redirect URLs**.
4. Apply the security hardening described in section 4 of
   [`supabase/README.md`](supabase/README.md) — public sign-up disabled and
   privilege-escalation protection.

---

## Deployment

The site runs on **Netlify** with the official Next.js runtime: dynamic routes,
middleware and Server Actions run as serverless functions.

1. Connect the repository to Netlify (build command `npm run build`; the
   runtime detects the rest).
2. Under **Site Settings > Environment Variables**, add the variables from
   `.env.example`. Set `NEXT_PUBLIC_SITE_URL` **only in the production
   context** — previews use their own deploy URL.
3. `SUPABASE_SECRET_KEY` must **never** get a `NEXT_PUBLIC_` prefix.
4. Restrict the Google Maps key by HTTP referrer to the site's domains.

### Netlify Forms

1. Under **Forms**, turn on **Enable form detection** and redeploy.
2. Under **Notifications**, set the destination email for each form:
   `contato`, `retorno-imovel` and `avaliacao-terreno`.

The forms are also declared in `public/__forms.html`, because Netlify detects
forms from static HTML at deploy time. **When adding or renaming a field,
update both the component and that file.** Under `npm run dev`, submissions are
simulated and the payload is logged to the browser console.

---

Developed by [Lucas Vidal](https://github.com/lucas-bids).
