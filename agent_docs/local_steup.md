# Local setup (first time only)

1. `cp .env.example .env.local` and fill in real values (Supabase keys,
   Google Maps key, SMTP, etc.)
2. `npm install`
3. Apply the Supabase schema — run `supabase/setup-complete.sql` in the
   Supabase SQL Editor, or set `DATABASE_URL` and run `npm run db:apply`
   (applies `supabase/migrations/*.sql` in order, then `supabase/seed.sql`).
4. Create the first admin: create the user in Supabase Auth, then run
   `supabase/promote-admin.sql` (substituting the email) to set
   `profiles.role = 'admin'`.
5. In Supabase Auth URL Configuration, add `http://localhost:3000/**` (and
   later the Netlify/prod domain) to Redirect URLs.

See `supabase/README.md` for the full walkthrough.