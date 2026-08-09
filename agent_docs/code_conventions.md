# Code conventions

Read this before writing or editing code.

## From The Pragmatic Programmer

- DRY — every piece of knowledge should have one authoritative source. If
  logic already exists in `features/*/queries.ts` or `lib/*`, reuse or
  extend it — don't re-implement it locally.
- Orthogonality — changes in one module shouldn't force changes in unrelated
  ones. Keep features decoupled; use a feature's exported API, not its internals.
- No broken windows — fix small issues (bad names, dead code, missing types)
  as you touch them, don't add to them.
- Design for reversibility — isolate volatile decisions (e.g. Supabase query
  shapes) behind `queries.ts`/`actions.ts`, not in components.
- Tracer bullets — for new features, get a thin end-to-end slice working
  before fleshing out edge cases.
- Crash early / fail fast — validate inputs at the boundary (zod schemas)
  rather than letting bad data propagate.

## From Clean Code

- Functions do one thing, small enough to read without scrolling.
- Names reveal intent — no `data`, `tmp`, `handleStuff`.
- Single Responsibility per module — `queries.ts` reads, `actions.ts`
  mutates, `schema.ts` validates. Don't blend concerns.
- Minimize function arguments — prefer an options object over 4+ positional params.
- No hidden side effects in innocuously-named functions.
- Comments explain *why*, not *what*.
- Handle errors explicitly (see `features/contact/actions.ts`), don't swallow them.
- Avoid premature abstraction — generalize only once a pattern repeats 2–3 times.