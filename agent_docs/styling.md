# Styling conventions

Tailwind, with brand colors as CSS custom properties exposed as `mitram.*`
in `tailwind.config.ts` (e.g. `bg-mitram-gold`, `text-mitram-dark`). Colors
are declared as `rgb(var(--x) / <alpha-value>)` so Tailwind opacity
modifiers (`bg-mitram-gold/20`) work — keep new brand colors in that same
form, not plain hex/CSS vars. Semantic state colors (success/error/warning/
info) intentionally reuse Tailwind's default palette rather than hardcoded hex.