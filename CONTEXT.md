# CONTEXT.md

Catalog, not knowledge. This file names the exact input for a task — it does
not carry domain detail, and reading it is not a reason to open everything it
lists.

## Layout

- `src/app/` — routes only (pages, layouts, route handlers). Thin; delegates
  to `src/features/`.
- `src/features/` — domain modules (`properties`, `search`, `admin/properties`,
  `contact`, `home`). Each exposes only the modules it needs — `queries.ts`,
  `actions.ts`, `schema.ts`, `types.ts` where appropriate, **not uniformly**.
  `search` is just `filters.ts`; `home` is just `content.ts` + components.
- `src/components/` — cross-feature UI primitives and layout chrome.
- `src/lib/supabase/` — the three Supabase client constructors.
- `supabase/` — SQL migrations, seed and setup scripts. DB source of truth.

## Task routing

| Task | Load |
| --- | --- |
| Public listings, property detail, search & filters | `agent_docs/properties.md` |
| Admin CRUD, status changes, trash, image management | `agent_docs/admin.md`, then `agent_docs/properties.md` and `agent_docs/supabase.md` as needed |
| Auth, RLS, migrations, storage buckets | `agent_docs/supabase.md` (+ `security-reviewer` agent) |
| Contact / lead forms | `agent_docs/contact.md` (+ `security-reviewer` agent) |
| UI, Tailwind, responsive layout, accessibility | `agent_docs/styling.md` (+ `ui-reviewer` agent) |
| OLX / ZAP / VivaReal feed | `olx-zap-feed` skill |
| Local setup, deployment | `README.md`, `supabase/README.md` |

Pick the row, load that file, stop. Path-scoped rules in `.claude/rules/`
pull the matching doc in automatically once you open a file in that area, so
this table is mainly for tasks that start from a description rather than a
file.

## Review & verification agents

Read-only, used for isolated passes — not for implementation, which stays in
the primary session.

- `security-reviewer` — auth, RLS, service-role usage, migrations, lead input.
- `ui-reviewer` — accessibility, responsive behavior, pt-BR copy, brand tokens.
- `verification-runner` — runs lint / typecheck / build and reports failures.

## ICM staging boundary

There are no numbered stage folders in this repo, deliberately. A numbered ICM
stage is only worth creating for a repeatable, sequential workflow that
produces real artifacts and has human review gates between steps. Nothing here
qualifies yet: normal feature work is a single-session task, not a pipeline.

The one credible future candidate is the portal feed — map property fields →
generate XML → validate the feed → review and publish. Scaffold it only once a
feed generator actually exists in `src/`. Until then the `olx-zap-feed` skill
covers the *knowledge* (field rules, validation script), which is Layer 3
context, not a workflow.
