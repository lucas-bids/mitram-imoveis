---
paths:
  - "src/features/feed/**"
  - "src/app/api/feed/**"
---

# Portal feed

Read `agent_docs/feed.md` before changing the feed, and use the `olx-zap-feed`
skill for portal field rules.

- `rules.ts` is the single source of portal rules — the admin form and list
  import it. Change a rule there, never in a copy.
- The feed reads `status = 'published'` only, not `PUBLIC_STATUSES`.
