# Contact & lead handling

`src/features/contact/` — the public contact form and the property-scoped
callback/scheduling form. Both are leads; neither writes to the database.

## Flow

`actions.ts::submitContactForm` (`"use server"`) is the single entry point for
both forms, discriminated by the `type` field in the `FormData`. In order it:

1. **Rate limits** — see the limitation below.
2. **Honeypot** — reads the `address_field` input. If it has any value the
   action returns `{ success: true }` **without sending anything**. The fake
   success is deliberate: a bot must not learn it was detected. Keep the field
   visually hidden but present, and keep the fake-success behavior.
3. **Extracts and validates** — requires `name`, at least one of `phone` /
   `email`, and `consent`. Errors returned to the user are pt-BR strings.
4. **Builds the email body** — for `type === "callback"` it includes the
   property title and URL, so the lead is traceable to a listing.
5. **Sends via SMTP.**

`types.ts` holds `ContactPreference` (`whatsapp | call`) and
`CONTACT_PREFERENCE_LABELS`. The labels live there, not in the form component,
because the server action needs the same pt-BR names for the email body.

Components: `ContactForm.tsx`, `ContactPreferenceForm.tsx`; shared client state
in `hooks.ts`.

## Email

`nodemailer` over SMTP, configured entirely by env: `SMTP_HOST`, `SMTP_PORT`
(default 465), `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
(falls back to `SMTP_USER`), and `CONTACT_RECIPIENT` as the destination.

## Known limitation: rate limiting

The rate limit is an **in-memory `Map` keyed by `x-forwarded-for`** — 3
requests per 60 seconds. On Netlify this is per serverless instance, so it
resets on cold start and is not shared across concurrent instances. **It is
not a reliable defense**; treat it as basic friction only.

`LEAD_RATE_LIMIT_SECRET` exists in `.env.example` but is **not read by any
code today**. It is reserved for a future durable rate-limit store. Do not
claim it is active, and do not wire it up as a side effect of unrelated work.

Any change to lead handling is a good candidate for a `security-reviewer` pass:
the input is unauthenticated, user-supplied, and interpolated into HTML email.
