// Shared between queries.ts (unstable_cache tags) and the lookup actions.ts
// files (revalidateTag calls) so the two can't drift apart.
export const LOOKUP_CACHE_TAGS = {
  propertyTypes: "property-types",
  cities: "cities",
  neighborhoods: "neighborhoods",
  features: "features",
} as const;
