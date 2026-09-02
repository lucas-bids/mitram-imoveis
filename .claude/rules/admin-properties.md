---
paths:
  - "src/features/admin/**"
  - "src/app/admin/**"
---

# Admin property management

Read `agent_docs/admin.md` before changing the property form, its validation,
or media handling. For the shared data model see `agent_docs/properties.md`.

The property create/update write runs **client-side** through
`@/lib/supabase/client`, so authorization comes from RLS policies rather than
a server-action boundary — see `agent_docs/supabase.md`. Never introduce
`createAdminClient` here to work around a policy.
