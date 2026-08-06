-- City names are reusable per state (for example, multiple states may have a city with the same slug).
ALTER TABLE public.cities DROP CONSTRAINT IF EXISTS cities_slug_key;
ALTER TABLE public.cities ADD CONSTRAINT cities_state_slug_key UNIQUE (state, slug);

