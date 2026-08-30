---
paths:
  - "src/features/contact/**"
  - "src/app/contato/**"
---

# Contact & lead forms

Read `agent_docs/contact.md` before changing lead handling.

Preserve the `address_field` honeypot and its deliberate fake-success return.
The in-memory rate limit is **not** reliable across serverless instances —
don't describe it as real protection, and don't wire up
`LEAD_RATE_LIMIT_SECRET` as a side effect of unrelated work.

This input is unauthenticated and ends up in an HTML email; consider a
`security-reviewer` pass.
