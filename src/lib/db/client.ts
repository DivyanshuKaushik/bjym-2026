import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * The ONLY Supabase client in this app. Supabase is used purely as
 * PostgreSQL now (auth is handled entirely by NextAuth) — this client
 * always uses the service-role key and must never be imported into any
 * "use client" file. All data access goes through the repository layer
 * in `src/lib/repositories`, which is the sole consumer of this client.
 *
 * Deliberately untyped (no `Database` generic): the hand-authored types
 * in `src/types/database.ts` don't satisfy supabase-js's full generic
 * schema constraints (Views/Functions/Enums/CompositeTypes), which made
 * update()/insert() calls collapse to `never` at several call sites. Every
 * repository function already casts its return value to an explicit Row
 * type from `src/types/database.ts`, so callers still get proper types —
 * only the query-builder's own internal inference is relaxed. Once you
 * run `npm run db:generate-types` against a real linked project, you can
 * re-introduce `createClient<Database>(...)` here.
 *
 * Because there's no Supabase Auth session, `auth.uid()` inside RLS
 * policies has no meaning here — authorization is enforced entirely in
 * the application layer (NextAuth session + RBAC checks in repositories
 * and Server Actions), not in Postgres RLS. RLS is left enabled with
 * default-deny policies as defense-in-depth in case a key ever leaks,
 * but the app itself always connects with the service role, which
 * bypasses RLS by design.
 */
let cached: ReturnType<typeof createClient> | null = null;

export function db() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }
  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
