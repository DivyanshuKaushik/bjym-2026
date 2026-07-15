import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — SERVER ONLY. Never import this from a "use client" file.
 * Used exclusively inside Server Actions for privileged operations
 * (resetting a member's password, etc.) after the caller's admin role
 * has already been verified against their own session.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
