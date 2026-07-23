/**
 * One-time (but safely re-runnable) backfill: moves existing members'
 * photo_base64 into Supabase Storage, populating photo_url +
 * photo_storage_path, and clears photo_base64 ONLY after a confirmed
 * successful upload + row update.
 *
 * Resumable by construction: it only ever selects rows matching
 *   photo_base64 IS NOT NULL AND photo_url IS NULL
 * so any row already migrated (or that never had a photo) is
 * automatically skipped on the next run — there's no separate
 * checkpoint file to manage. If the process is killed/crashes mid-run,
 * just run it again; already-migrated rows won't be re-touched.
 *
 * Usage:
 *   node scripts/migrate-photos.mjs                 # migrate everything
 *   node scripts/migrate-photos.mjs --batch-size=50  # smaller batches
 *   node scripts/migrate-photos.mjs --limit=500       # stop after N rows (testing)
 *   node scripts/migrate-photos.mjs --dry-run          # log only, no writes
 *
 * Requires .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, appendFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const BATCH_SIZE = parseInt(args["batch-size"] || "50", 10);
const LIMIT = args.limit ? parseInt(args.limit, 10) : Infinity;
const DRY_RUN = !!args["dry-run"];
const BUCKET = "member-photos";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const logPath = path.join(__dirname, "..", `migrate-photos-${new Date().toISOString().slice(0, 10)}.log`);
function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  try { appendFileSync(logPath, stamped + "\n"); } catch { /* best-effort logging only */ }
}

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;
  const [, contentType, base64] = match;
  return { buffer: Buffer.from(base64, "base64"), contentType };
}

async function migrateOne(row) {
  const parsed = parseDataUrl(row.photo_base64);
  if (!parsed) {
    log(`  ✗ ${row.membership_id}: photo_base64 isn't a valid data URL, skipping (left as-is for manual review)`);
    return { ok: false };
  }

  const ext = parsed.contentType.split("/")[1] || "webp";
  const storagePath = `members/${row.id}.${ext}`;

  if (DRY_RUN) {
    log(`  (dry-run) would upload ${row.membership_id} -> ${storagePath} (${(parsed.buffer.byteLength / 1024).toFixed(1)} KB)`);
    return { ok: true };
  }

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, parsed.buffer, {
    contentType: parsed.contentType,
    upsert: true, // safe: path is keyed by member id, re-running overwrites the same object rather than duplicating
    cacheControl: "31536000",
  });
  if (uploadError) {
    log(`  ✗ ${row.membership_id}: upload failed — ${uploadError.message}`);
    return { ok: false };
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  // Only clear photo_base64 once the URL is durably saved — if this
  // update fails, photo_base64 is untouched and the row will simply be
  // retried (with upsert:true the re-upload is harmless) on the next run.
  const { error: updateError } = await supabase
    .from("members")
    .update({ photo_url: pub.publicUrl, photo_storage_path: storagePath, photo_base64: null })
    .eq("id", row.id);

  if (updateError) {
    log(`  ✗ ${row.membership_id}: uploaded but DB update failed — ${updateError.message} (will retry next run)`);
    return { ok: false };
  }

  log(`  ✓ ${row.membership_id} -> ${storagePath}`);
  return { ok: true };
}

async function main() {
  log(`Starting photo migration (batch size ${BATCH_SIZE}${LIMIT !== Infinity ? `, limit ${LIMIT}` : ""}${DRY_RUN ? ", DRY RUN" : ""})`);

  let totalOk = 0;
  let totalFail = 0;
  let processed = 0;

  while (processed < LIMIT) {
    const pageSize = Math.min(BATCH_SIZE, LIMIT - processed);
    const { data: rows, error } = await supabase
      .from("members")
      .select("id, membership_id, photo_base64")
      .not("photo_base64", "is", null)
      .is("photo_url", null)
      .order("created_at", { ascending: true })
      .limit(pageSize);

    if (error) {
      log(`Fatal: couldn't fetch a batch — ${error.message}`);
      process.exit(1);
    }
    if (!rows || rows.length === 0) {
      log("No more rows to migrate.");
      break;
    }

    log(`Batch of ${rows.length} (processed so far: ${processed})...`);
    for (const row of rows) {
      const result = await migrateOne(row);
      if (result.ok) totalOk++; else totalFail++;
      processed++;
    }
  }

  log(`Done. ${totalOk} migrated, ${totalFail} failed, ${processed} processed total.`);
  log(`Log written to: ${logPath}`);
  if (totalFail > 0) {
    log("Some rows failed — safe to simply re-run this script; already-migrated rows are skipped automatically.");
  }
}

main().catch((err) => {
  log(`Unhandled error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
