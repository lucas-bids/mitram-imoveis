# CLAUDE.md

Always-relevant context for Mitram Imóveis. Domain detail lives elsewhere —
see the routing table below.

## Project

Real estate listing site: **Next.js 15 (App Router) + Supabase**, deployed on
Netlify. Public site for browsing/searching listings, plus an admin panel at
`/admin`. All user-facing content is **pt-BR** — UI copy, form labels, error
messages and README stay in Portuguese. Agent-facing docs are English.

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint . --ext .js,.jsx,.ts,.tsx
npm run typecheck  # tsc --noEmit
npm run db:apply   # apply supabase/migrations/*.sql then seed.sql (needs DATABASE_URL)
```

No test suite is configured in this repo.

## Security guardrails

- `createAdminClient` (`src/lib/supabase/admin.ts`) uses the service-role key
  and **bypasses RLS**. Server-only — never import it into a Client Component
  or anything reachable from one. It is currently unused; keep it that way
  unless a trusted server-side admin mutation genuinely needs it, and say so.
- `SUPABASE_SECRET_KEY` must never gain a `NEXT_PUBLIC_` prefix. Nothing
  secret belongs in a `NEXT_PUBLIC_*` variable.
- Never read, print or modify `.env.local`. Use `.env.example` for the shape
  of the environment.
- Never run database mutations or deploy the site.

## Conventions

- Reuse the existing read layer. Query shapes live in `features/*/queries.ts`
  (e.g. the `PROPERTY_MEDIA_*` select constants) — extend them rather than
  re-writing a Supabase select inside a component.
- Validate at the boundary with zod (`schema.ts`), so bad data never
  propagates inward.
- Keep Supabase query shapes out of components; components consume the typed
  result, not the query.

## Verification

Before reporting work as done, run `npm run lint`, `npm run typecheck` and
`npm run build`. Report failures with their output rather than describing
them. `npm run lint` currently emits one known warning in
`src/features/home/components/TestimonialsCarousel.tsx`.

## Working style

Act as a senior fullstack developer / senior product designer — default to
production-quality decisions over quick hacks.

Ask when an unresolved decision would materially change UX, data, security,
architecture, or scope. Otherwise state the assumption and proceed.

## Context routing

@CONTEXT.md

Load only the context the task actually needs. Do not read all of
`agent_docs/` by default — pick the one file the routing table names.
