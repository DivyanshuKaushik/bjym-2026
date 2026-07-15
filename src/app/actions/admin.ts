"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Not authorized");

  return { supabase, adminId: user.id };
}

async function logActivity(adminId: string, action: string, targetTable: string, targetId: string, meta?: Record<string, unknown>) {
  const supabase = await createClient();
  await supabase.from("activity_logs").insert({ actor_id: adminId, action, target_table: targetTable, target_id: targetId, meta: meta || {} });
}

export async function setMemberStatus(membershipId: string, status: "Active" | "Suspended" | "Deleted") {
  const { supabase, adminId } = await requireAdmin();
  const { error } = await supabase.from("memberships").update({ status }).eq("membership_id", membershipId);
  if (error) return { error: error.message };
  await logActivity(adminId, `status_changed_to_${status}`, "memberships", membershipId);
  revalidatePath("/admin/members");
  return { success: true };
}

export async function resetMemberPassword(profileId: string, newPassword: string) {
  const { adminId } = await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(profileId, { password: newPassword });
  if (error) return { error: error.message };
  await logActivity(adminId, "password_reset", "profiles", profileId);
  return { success: true };
}

export async function regenerateMembershipId(membershipId: string) {
  const { supabase, adminId } = await requireAdmin();
  const { data: newId, error: genError } = await supabase.rpc("generate_membership_id");
  if (genError) return { error: genError.message };
  const { error } = await supabase.from("memberships").update({ membership_id: newId }).eq("membership_id", membershipId);
  if (error) return { error: error.message };
  await logActivity(adminId, "membership_id_regenerated", "memberships", newId as string, { old: membershipId });
  revalidatePath("/admin/members");
  return { success: true, newId };
}

// ---- Hierarchy management ----

export async function addDistrict(nameEn: string, nameHi: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("districts").insert({ name_en: nameEn, name_hi: nameHi });
  if (error) return { error: error.message };
  revalidatePath("/admin/hierarchy");
  return { success: true };
}

export async function addAssembly(districtId: string, nameEn: string, nameHi: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("assemblies").insert({ district_id: districtId, name_en: nameEn, name_hi: nameHi });
  if (error) return { error: error.message };
  revalidatePath("/admin/hierarchy");
  return { success: true };
}

export async function addMandal(assemblyId: string, nameEn: string, nameHi: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("mandals").insert({ assembly_id: assemblyId, name_en: nameEn, name_hi: nameHi });
  if (error) return { error: error.message };
  revalidatePath("/admin/hierarchy");
  return { success: true };
}

export async function deleteHierarchyRow(table: "districts" | "assemblies" | "mandals", id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/hierarchy");
  return { success: true };
}

// ---- Settings ----

export async function updateSetting(key: string, value: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("settings").upsert({ key, value });
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
