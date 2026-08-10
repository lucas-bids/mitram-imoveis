# Styling conventions

Tailwind, with brand colors as CSS custom properties exposed as `mitram.*`
in `tailwind.config.ts` (e.g. `bg-mitram-gold`, `text-mitram-dark`). Colors
are declared as `rgb(var(--x) / <alpha-value>)` so Tailwind opacity
modifiers (`bg-mitram-gold/20`) work — keep new brand colors in that same
form, not plain hex/CSS vars. Semantic state colors (success/error/warning/
info) intentionally reuse Tailwind's default palette rather than hardcoded hex.

## Cards: border, not shadow

Cards are delimited by a border, never by a shadow: `border-gray-200` at rest,
`border-mitram-gold/60` when the card is active (hover, focus-within or
selected). The pattern comes from the home testimonials carousel
(`TestimonialsCarousel.tsx`, which interpolates the same two colors through
`--t` for its animation) and is centralized in
`src/components/ui/cardStyles.ts` — use `cardClasses` (static),
`interactiveCardClasses` (clickable) or `selectableCardClasses` (state driven
by data) instead of writing the border classes by hand.

Shadow is reserved for what genuinely floats above the page: dropdowns and
popovers, the mobile menu, the sticky admin header, the cookie banner, map
popups, floating carousel arrows and buttons. Don't add shadow to a surface
that sits in the normal page flow.