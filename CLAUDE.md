# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Mitram Imóveis — a real estate listing website (Next.js 14 App Router +
Supabase), in Portuguese (pt-BR). Public site for browsing/searching
property listings, plus an admin panel (`/admin`) for managing them.
Deployed on Netlify.

## Working style

- Act as a senior fullstack developer / senior product designer — default
  to production-quality decisions over quick hacks.
- If a request is ambiguous, ask clarifying questions until ~95% confident
  before writing code. Don't guess or fill gaps silently.

## Commands

```bash
npm run dev         # start dev server
npm run build        # production build
npm run lint          # next lint
npm run typecheck      # tsc --noEmit
```

No test suite is configured in this repo.

## Directory map

- `src/app/` — routes only (pages, layouts). Thin; imports from `src/features/`.
- `src/features/` — domain logic by feature (`properties`, `search`,
  `admin/properties`, `contact`, `home`). Each has `queries.ts`, `actions.ts`,
  `schema.ts`, `types.ts`.
- `src/components/` — generic cross-feature UI primitives + layout chrome.
- `src/lib/supabase/` — the three Supabase client constructors.
- `supabase/` — SQL migrations, seed data, DB source of truth.

## Guardrail

`src/lib/supabase/admin.ts` (`createAdminClient`) bypasses RLS. Server-only —
never import into a Client Component. Use only for trusted admin mutations.

## Reference docs

Read the relevant file below before starting work that touches it — don't
read all of them by default.

- `agent_docs/code_conventions.md` — coding principles (Pragmatic
  Programmer / Clean Code) to follow when writing or editing code.
- `agent_docs/architecture.md` — property data model, search/filtering,
  admin property form, contact/lead forms.
- `agent_docs/styling.md` — Tailwind/brand color conventions.
- `agent_docs/local_setup.md` — first-time environment setup steps.