# Portal feed (OLX / ZAP / VivaReal)

Code map for the VrSync XML feed. Portal field rules, XML structure and error
reports live in the `olx-zap-feed` skill — load it for anything about what the
portal accepts.

## Flow

`src/app/api/feed/olx.xml/route.ts` (`force-dynamic`, cached by `s-maxage`)
→ `queries.ts::getFeedProperties` → `vrsync.ts::buildVrSyncFeed` → XML.

| File | Role |
| --- | --- |
| `queries.ts` | Reads every `published` property (not `PUBLIC_STATUSES` — sold/rented stay off the portal). Uses `createStaticClient()` so the route stays cacheable; selects `FEED_RULE_FIELDS` from `features/properties/queries.ts`. |
| `rules.ts` | `feedIssues` / `feedExclusionReason` — the **single source** of portal rules, shared by the feed, the admin form schema and the admin list badge. |
| `limits.ts` | `FEED_LIMITS` and the per-type sets the rules read. |
| `vrsync.ts` | Pure XML builder; returns `{ xml, included, excluded }`. |
| `types.ts` | `FeedProperty`, `FeedBuildResult`, … |

A published property that fails the rules is **omitted and logged**
(`logWarn`), never emitted invalid. On error the route returns a plain-text 500
rather than an empty XML, which the portal could read as "zero listings".
Admin-side enforcement of the same rules is in `admin.md`.
