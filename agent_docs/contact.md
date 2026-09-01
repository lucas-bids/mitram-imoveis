# Contact & lead handling

`src/features/contact/` — the public contact form and the property-scoped
callback/scheduling form. Both are leads; neither writes to the database.
Delivery is **Netlify Forms** — there is no server action and no SMTP.

## Flow

Everything is client-side. `hooks.ts::useContactFormSubmit(formName)` takes the
form's `FormData` and hands it to `netlify.ts::submitToNetlifyForms`, which
POSTs it url-encoded to `/__forms.html` with a `form-name` field. The hook owns
the `loading` / `success` / `error` state and the pt-BR error string.

There is **no server-side validation**: the browser's `required` attributes and
Netlify's spam filtering are the only gates. Nothing user-supplied is
interpolated into HTML by us any more.

## The `public/__forms.html` contract

Netlify parses **static HTML at deploy time** and cannot see React-rendered
forms, so with the Next.js runtime v5 adapter the forms must also be declared
in `public/__forms.html`. That file is not a page — it exists only to be
parsed. See <https://opennext.js.org/netlify/forms>.

**Adding or renaming a field means editing two files**: the React component and
`public/__forms.html`. A field the static form doesn't declare is dropped
silently by Netlify — no error anywhere.

Three forms, named in `netlify.ts::NETLIFY_FORMS` so the dashboard separates
them:

| `NETLIFY_FORMS` key | Netlify name | Used by |
| --- | --- | --- |
| `contact` | `contato` | `ContactForm.tsx` (`/contato`) |
| `callback` | `retorno-imovel` | `PropertyCtaCard.tsx` |
| `sellLand` | `avaliacao-terreno` | `ValuationCta.tsx` |

`ContactPreferenceForm` submits `contactPreference` as the **pt-BR label**
("WhatsApp" / "Ligação") from `types.ts::CONTACT_PREFERENCE_LABELS`, not the
raw key, so the dashboard column is readable.

## Local development

Netlify only accepts submissions on the published site — `/__forms.html` is
served by their forms layer, which `next dev` doesn't have.
`submitToNetlifyForms` therefore short-circuits when
`process.env.NODE_ENV === "development"`: it logs the payload via `logWarn`
and returns success, so the success states are testable locally. Real
submissions only ever land from a deployed Netlify site.

## Spam protection

The `address_field` honeypot input stays in both components and is wired via
`data-netlify-honeypot="address_field"` in `public/__forms.html`. Netlify
accepts a honeypot-filled submission and files it as spam, so a bot still never
learns it was caught. Akismet filtering runs on top of that.

The old in-memory rate limit disappeared with the server action; it was never
reliable across serverless instances anyway. `LEAD_RATE_LIMIT_SECRET` remains
in `.env.example` and is still read by no code.

## Netlify setup (manual, one-off)

Form detection must be enabled in the Netlify UI (**Forms → Enable form
detection**) and the site redeployed *afterwards* — forms are only registered
by a deploy that runs with detection on. Lead notifications are configured per
form under **Configuration → Notifications → Form submission notifications**.
