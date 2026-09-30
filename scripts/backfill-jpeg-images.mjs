#!/usr/bin/env node
/**
 * Reconverte para JPEG as imagens que ficaram em WebP no bucket
 * `property-images`, e reescreve `property_media.storage_path`/`public_url`.
 *
 * Por que: o feed do OLX/ZAP/VivaReal (VrSync) só aceita JPG. O portal importa
 * a URL da foto para os servidores dele e rejeita WebP. Uploads novos já saem
 * em JPEG (src/features/admin/properties/components/media/mutations.ts); este
 * script cuida do acervo antigo.
 *
 * O arquivo WebP original é apagado só depois de o JPEG existir e de a linha
 * do banco já apontar para ele — se o script morrer no meio, o pior caso é um
 * objeto órfão no bucket, nunca uma imagem quebrada no site.
 *
 * Requer:
 *   SUPABASE_URL           (ou NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SECRET_KEY    chave service_role — ignora RLS, roda só localmente
 *
 * Uso:
 *   node scripts/backfill-jpeg-images.mjs --dry-run   # só lista o que faria
 *   node scripts/backfill-jpeg-images.mjs
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const BUCKET = "property-images";
const JPEG_QUALITY = 82;

function loadEnvLocal() {
  try {
    const content = readFileSync(join(rootDir, ".env.local"), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1);
    }
  } catch {
    // .env.local é opcional se as variáveis já estiverem exportadas
  }
}

async function main() {
  loadEnvLocal();

  const dryRun = process.argv.includes("--dry-run");

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    console.error(
      "SUPABASE_URL e SUPABASE_SECRET_KEY são obrigatórios.\n" +
        "Pegue a service_role key em: Supabase Dashboard > Project Settings > API."
    );
    process.exit(1);
  }

  const supabase = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: rows, error } = await supabase
    .from("property_media")
    .select("id, property_id, storage_path, public_url")
    .like("storage_path", "%.webp")
    .order("property_id");

  if (error) throw error;

  if (!rows.length) {
    console.log("Nenhuma imagem WebP encontrada. Nada a fazer.");
    return;
  }

  console.log(`${rows.length} imagem(ns) WebP a converter${dryRun ? " (dry run)" : ""}.\n`);

  let converted = 0;
  const failures = [];

  for (const row of rows) {
    const newPath = row.storage_path.replace(/\.webp$/i, ".jpg");

    if (dryRun) {
      console.log(`  ${row.storage_path}  ->  ${newPath}`);
      continue;
    }

    try {
      const { data: blob, error: downloadError } = await supabase.storage
        .from(BUCKET)
        .download(row.storage_path);
      if (downloadError) throw downloadError;

      const webp = Buffer.from(await blob.arrayBuffer());
      const jpeg = await sharp(webp).jpeg({ quality: JPEG_QUALITY }).toBuffer();

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(newPath, jpeg, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(newPath);

      // O banco passa a apontar para o JPEG antes de o WebP sumir.
      const { error: updateError } = await supabase
        .from("property_media")
        .update({ storage_path: newPath, public_url: publicUrlData.publicUrl })
        .eq("id", row.id);
      if (updateError) throw updateError;

      await supabase.storage.from(BUCKET).remove([row.storage_path]);

      converted += 1;
      console.log(`  OK  ${row.storage_path} -> ${newPath}`);
    } catch (err) {
      failures.push({ id: row.id, path: row.storage_path, message: err?.message || String(err) });
      console.error(`  FALHA  ${row.storage_path}: ${err?.message || err}`);
    }
  }

  if (dryRun) {
    console.log("\nDry run: nada foi alterado.");
    return;
  }

  console.log(`\nConvertidas: ${converted}/${rows.length}`);

  if (failures.length) {
    console.error(`Falhas: ${failures.length}`);
    for (const failure of failures) {
      console.error(`  ${failure.path} (${failure.id}): ${failure.message}`);
    }
    console.error(
      "\nAs linhas que falharam continuam apontando para o WebP original — o site\n" +
        "segue funcionando. Rode o script de novo para tentar só as que sobraram."
    );
    process.exit(1);
  }

  console.log("Concluído. As URLs mudaram, então o portal vai reimportar as fotos na próxima carga.");
}

main().catch((err) => {
  console.error("\nBackfill falhou:");
  console.error(err?.message || err);
  process.exit(1);
});
