/**
 * One-time script to create the Master Admin account directly in the
 * `admin_users` table (bcrypt-hashed password — no Supabase Auth involved).
 *
 * Usage:
 *   1. Make sure .env.local has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   2. Run: npm run create-admin
 *
 * Equivalent to running supabase/seed.sql, provided as a convenience for
 * people who'd rather not use the Supabase CLI directly. Safe to re-run
 * (upserts by username).
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "fs";
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
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "divyanshukaushik";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bjym2026";
const ADMIN_NAME = process.env.ADMIN_NAME || "Divyanshu Kaushik";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function main() {
  console.log(`Creating Master Admin: ${ADMIN_USERNAME} ...`);

  const { data: role, error: roleError } = await supabase.from("roles").select("id").eq("name", "MASTER_ADMIN").single();
  if (roleError || !role) {
    console.error("MASTER_ADMIN role not found — run the migrations (000001, 000012) first.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const { error } = await supabase
    .from("admin_users")
    .upsert(
      { username: ADMIN_USERNAME, password_hash: passwordHash, full_name: ADMIN_NAME, role_id: role.id, is_active: true },
      { onConflict: "username" }
    );

  if (error) {
    console.error("Error creating admin user:", error.message);
    process.exit(1);
  }

  console.log("✅ Master Admin ready.");
  console.log(`   Username: ${ADMIN_USERNAME}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log("   Login at: /admin-login");
}

main();
