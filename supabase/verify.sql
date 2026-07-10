-- Verification script (single result set for Supabase SQL Editor)
-- Run after setup-complete.sql

WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'profiles',
    'property_types',
    'cities',
    'neighborhoods',
    'features',
    'properties',
    'property_features',
    'property_media'
  ]) AS object_name
),
expected_enums AS (
  SELECT unnest(ARRAY[
    'property_purpose',
    'property_status',
    'media_type'
  ]) AS object_name
),
expected_buckets AS (
  SELECT unnest(ARRAY[
    'property-images',
    'property-floorplans'
  ]) AS object_name
),
table_checks AS (
  SELECT
    'table'::text AS category,
    e.object_name AS object,
    CASE
      WHEN t.table_name IS NOT NULL THEN 'OK'
      ELSE 'MISSING'
    END AS status,
    NULL::text AS detail
  FROM expected_tables e
  LEFT JOIN information_schema.tables t
    ON t.table_schema = 'public'
   AND t.table_name = e.object_name
),
enum_checks AS (
  SELECT
    'enum'::text AS category,
    e.object_name AS object,
    CASE
      WHEN p.typname IS NOT NULL THEN 'OK'
      ELSE 'MISSING'
    END AS status,
    NULL::text AS detail
  FROM expected_enums e
  LEFT JOIN pg_type p ON p.typname = e.object_name
),
bucket_checks AS (
  SELECT
    'bucket'::text AS category,
    e.object_name AS object,
    CASE
      WHEN b.id IS NOT NULL THEN 'OK'
      ELSE 'MISSING'
    END AS status,
    CASE
      WHEN b.id IS NOT NULL THEN
        CASE WHEN b.public THEN 'public' ELSE 'private' END
      ELSE NULL
    END AS detail
  FROM expected_buckets e
  LEFT JOIN storage.buckets b ON b.id = e.object_name
),
seed_checks AS (
  SELECT 'seed'::text, 'property_types'::text, CASE WHEN count(*) > 0 THEN 'OK' ELSE 'EMPTY' END, count(*)::text
  FROM property_types
  UNION ALL
  SELECT 'seed', 'cities', CASE WHEN count(*) > 0 THEN 'OK' ELSE 'EMPTY' END, count(*)::text FROM cities
  UNION ALL
  SELECT 'seed', 'neighborhoods', CASE WHEN count(*) > 0 THEN 'OK' ELSE 'EMPTY' END, count(*)::text FROM neighborhoods
  UNION ALL
  SELECT 'seed', 'features', CASE WHEN count(*) > 0 THEN 'OK' ELSE 'EMPTY' END, count(*)::text FROM features
  UNION ALL
  SELECT 'seed', 'properties', CASE WHEN count(*) > 0 THEN 'OK' ELSE 'EMPTY' END, count(*)::text FROM properties
  UNION ALL
  SELECT 'seed', 'property_features', CASE WHEN count(*) >= 0 THEN 'OK' ELSE 'EMPTY' END, count(*)::text FROM property_features
),
function_checks AS (
  SELECT
    'function'::text AS category,
    fn.object_name AS object,
    CASE
      WHEN p.proname IS NOT NULL THEN 'OK'
      ELSE 'MISSING'
    END AS status,
    NULL::text AS detail
  FROM (
    SELECT unnest(ARRAY['is_admin', 'handle_new_user', 'generate_internal_code']) AS object_name
  ) fn
  LEFT JOIN pg_proc p ON p.proname = fn.object_name
  LEFT JOIN pg_namespace n ON n.oid = p.pronamespace AND n.nspname = 'public'
),
trigger_checks AS (
  SELECT
    'trigger'::text AS category,
    'on_auth_user_created'::text AS object,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
      ) THEN 'OK'
      ELSE 'MISSING'
    END AS status,
    NULL::text AS detail
)
)
SELECT category, object, status, detail
FROM (
  SELECT category, object, status, detail
  FROM table_checks
  UNION ALL SELECT * FROM enum_checks
  UNION ALL SELECT * FROM bucket_checks
  UNION ALL SELECT * FROM seed_checks
  UNION ALL SELECT * FROM function_checks
  UNION ALL SELECT * FROM trigger_checks
) AS all_checks
ORDER BY
  CASE category
    WHEN 'table' THEN 1
    WHEN 'enum' THEN 2
    WHEN 'bucket' THEN 3
    WHEN 'function' THEN 4
    WHEN 'trigger' THEN 5
    WHEN 'seed' THEN 6
    ELSE 7
  END,
  object;
