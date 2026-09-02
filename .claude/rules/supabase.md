---
paths:
  - "src/lib/supabase/**"
  - "src/middleware.ts"
  - "supabase/**/*.sql"
  - "scripts/apply-migrations.mjs"
---

# Supabase, auth & migrations

Read `agent_docs/supabase.md` before changing a client constructor, the admin
gate, or any SQL.

- `admin.ts` bypasses RLS and is server-only.
- A new migration must also be reflected in `supabase/setup-complete.sql`.
- Never let a non-admin write `profiles.role` — that regression was already
  fixed once.

Changes here are security-relevant; consider a `security-reviewer` pass.
