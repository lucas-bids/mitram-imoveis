---
paths:
  - "src/features/properties/**"
  - "src/features/search/**"
  - "src/app/imoveis/**"
  - "src/app/imovel/**"
---

# Public properties & search

Read `agent_docs/properties.md` before changing the data model, the query
layer, or filter behavior.

Two rules that are easy to break silently:

- Public reads must filter `.in("status", ["published", "sold", "rented"])`.
- Filter state lives in the URL (`src/features/search/filters.ts`), not in
  component state.
