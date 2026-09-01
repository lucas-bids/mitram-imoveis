---
paths:
  - "src/features/contact/**"
  - "src/app/contato/**"
  - "public/__forms.html"
---

# Contact & lead forms

Read `agent_docs/contact.md` before changing lead handling.

Leads go to **Netlify Forms**, not SMTP. Any field added, renamed or removed in
a React form must be mirrored in `public/__forms.html` — Netlify silently drops
fields the static form doesn't declare, with no error anywhere.

Preserve the `address_field` honeypot in both components and its
`data-netlify-honeypot="address_field"` wiring in `public/__forms.html`.

There is no server-side rate limiting any more, and don't wire up
`LEAD_RATE_LIMIT_SECRET` as a side effect of unrelated work.

This input is unauthenticated; consider a `security-reviewer` pass.
