---
paths:
  - "src/components/**"
  - "src/features/home/**"
  - "src/app/globals.css"
  - "tailwind.config.ts"
---

# Styling & UI

Read `agent_docs/styling.md` before adding colors or card/button styling.

- Cards are delimited by a **border, never a shadow** — use `cardClasses`,
  `interactiveCardClasses` or `selectableCardClasses` from
  `src/components/ui/cardStyles.ts`.
- Brand colors are `rgb(var(--x) / <alpha-value>)` under `mitram.*`, so
  opacity modifiers work. Never hardcode hex.
- User-facing copy is pt-BR.
