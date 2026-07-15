"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginMember(input: { email: string; password: string }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) return { error: "ईमेल या पासवर्ड गलत है" };
  redirect("/dashboard");
}

export async function loginAdmin(input: { email: string; password: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error || !data.user) return { error: "ईमेल या पासवर्ड गलत है" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "यह Admin खाता नहीं है" };
  }
  redirect("/admin");
}

export async function requestPasswordReset(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}
