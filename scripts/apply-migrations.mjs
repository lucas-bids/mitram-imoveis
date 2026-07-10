#!/usr/bin/env node
/**
 * Applies Supabase SQL migrations and seed using a direct Postgres connection.
 *
 * Required env var:
 *   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *
 * Get it from: Supabase Dashboard > Project Settings > Database > Connection string (URI)
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const migrationsDir = join(rootDir, "supabase", "migrations");

function loadEnvLocal() {
  try {
    const envPath = join(rootDir, ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const value = trimmed.slice(eq + 1);
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local is optional if DATABASE_URL is already exported
  }
}

async function main() {
  loadEnvLocal();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "DATABASE_URL is required.\n" +
        "Add it to .env.local from Supabase Dashboard > Project Settings > Database > Connection string (URI).\n" +
        "Then run: npm run db:apply"
    );
    process.exit(1);
  }

  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const seedFile = join(rootDir, "supabase", "seed.sql");

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to database.");

  try {
    for (const file of migrationFiles) {
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      console.log(`Applying migration: ${file}`);
      await client.query(sql);
      console.log(`  OK`);
    }

    console.log("Applying seed.sql");
    const seedSql = readFileSync(seedFile, "utf8");
    await client.query(seedSql);
    console.log("  OK");

    const verification = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'profiles',
          'property_types',
          'cities',
          'neighborhoods',
          'features',
          'properties',
          'property_features',
          'property_media'
        )
      ORDER BY table_name;
    `);

    const buckets = await client.query(`
      SELECT id, name, public
      FROM storage.buckets
      WHERE id IN ('property-images', 'property-floorplans')
      ORDER BY id;
    `);

    console.log("\nVerification:");
    console.log("Tables:", verification.rows.map((r) => r.table_name).join(", ") || "(none)");
    console.log("Buckets:", buckets.rows.map((r) => r.id).join(", ") || "(none)");

    if (verification.rows.length < 8) {
      throw new Error("Not all expected tables were created.");
    }
    if (buckets.rows.length < 2) {
      throw new Error("Storage buckets were not created.");
    }

    console.log("\nDatabase setup completed successfully.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("\nDatabase setup failed:");
  console.error(error.message || error);
  process.exit(1);
});
