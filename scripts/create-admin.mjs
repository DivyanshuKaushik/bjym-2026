/**
 * One-time script to create the Master Admin auth user + profile.
 *
 * Usage:
 *   1. Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   2. Run: npm run create-admin
 *
 * This uses the Supabase service role key (server-only, never expose to client)
 * to create the auth user directly (bypassing email confirmation) and marks
 * the profiles.role as 'admin'.
 */
import { createClient } from "@supabase/supabase-js";
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bjymcg.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bjym2026";
const ADMIN_NAME = process.env.ADMIN_NAME || "divyanshukaushik";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoConfirm: true, persistSession: false },
});

async function main() {
  console.log(`Creating Master Admin: ${ADMIN_EMAIL} ...`);

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: ADMIN_NAME, role: "admin" },
  });

  let userId = created?.user?.id;

  if (createError) {
    if (createError.message?.toLowerCase().includes("already")) {
      console.log("Admin user already exists — fetching existing user...");
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === ADMIN_EMAIL);
      userId = existing?.id;
    } else {
      console.error("Error creating admin user:", createError.message);
      process.exit(1);
    }
  }

  if (!userId) {
    console.error("Could not resolve admin user id.");
    process.exit(1);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "admin", full_name: ADMIN_NAME })
    .eq("id", userId);

  if (profileError) {
    console.error("Error updating profile role:", profileError.message);
    process.exit(1);
  }

  console.log("✅ Master Admin ready.");
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log("   Login at: /admin-login");
}

main();
