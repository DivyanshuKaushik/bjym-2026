"use server";

import { auth } from "@/lib/auth";
import { memberRepository } from "@/lib/repositories/member.repository";
import { adminRepository } from "@/lib/repositories/admin.repository";
import { settingsRepository } from "@/lib/repositories/settings.repository";
import { activityRepository } from "@/lib/repositories/activity.repository";
import { createAdminSchema } from "@/lib/validators/admin";
import { settingsSchema } from "@/lib/validators/settings";
import { PERMISSIONS, type Permission } from "@/lib/rbac/permissions";
import { revalidatePath } from "next/cache";

async function requirePermission(permission: Permission) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") throw new Error("Not authenticated");
  const permissions = session.user.permissions ?? [];
  if (!permissions.includes(permission)) throw new Error("Not authorized");
  return { adminId: session.user.id, fullName: session.user.fullName ?? session.user.username ?? "Admin" };
}

export async function approveMember(memberId: string) {
  const { adminId } = await requirePermission(PERMISSIONS.MEMBERS_APPROVE);
  const { error } = await memberRepository.approve(memberId, adminId);
  if (!error) { revalidatePath("/admin/verification"); revalidatePath("/admin/members"); }
  return { error };
}

export async function rejectMember(memberId: string, reason: string) {
  const { adminId } = await requirePermission(PERMISSIONS.MEMBERS_REJECT);
  const { error } = await memberRepository.reject(memberId, adminId, reason);
  if (!error) { revalidatePath("/admin/verification"); revalidatePath("/admin/members"); }
  return { error };
}

export async function suspendMember(memberId: string, reason?: string) {
  const { adminId } = await requirePermission(PERMISSIONS.MEMBERS_SUSPEND);
  const { error } = await memberRepository.suspend(memberId, adminId, reason);
  if (!error) revalidatePath("/admin/members");
  return { error };
}

export async function activateMember(memberId: string) {
  const { adminId } = await requirePermission(PERMISSIONS.MEMBERS_ACTIVATE);
  const { error } = await memberRepository.activate(memberId, adminId);
  if (!error) revalidatePath("/admin/members");
  return { error };
}

export async function softDeleteMember(memberId: string, reason?: string) {
  const { adminId } = await requirePermission(PERMISSIONS.MEMBERS_DELETE);
  const { error } = await memberRepository.softDelete(memberId, adminId, reason);
  if (!error) revalidatePath("/admin/members");
  return { error };
}

export async function resetMemberMpin(memberId: string, newMpin: string) {
  const { adminId } = await requirePermission(PERMISSIONS.MEMBERS_RESET_MPIN);
  if (!/^\d{4}$|^\d{6}$/.test(newMpin)) return { error: "MPIN 4 या 6 अंकों का होना चाहिए" };
  const { error } = await memberRepository.resetMpin(memberId, newMpin, adminId);
  return { error };
}

export async function createAdminUser(input: unknown) {
  const { adminId } = await requirePermission(PERMISSIONS.ADMINS_MANAGE);
  const parsed = createAdminSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "अमान्य जानकारी" };

  const roleId = await adminRepository.getRoleIdByName(parsed.data.roleName);
  if (!roleId) return { error: "Role नहीं मिला" };

  const { admin, error } = await adminRepository.create({
    username: parsed.data.username,
    password: parsed.data.password,
    fullName: parsed.data.fullName,
    roleId,
    createdBy: adminId,
  });
  if (error) return { error: error.includes("duplicate") ? "यह Username पहले से मौजूद है" : error };

  await activityRepository.log({ actorType: "admin", actorId: adminId, action: "admin_created", targetTable: "admin_users", targetId: admin?.id ?? null, meta: { username: parsed.data.username } });
  revalidatePath("/admin/admins");
  return { success: true };
}

export async function setAdminActive(adminUserId: string, isActive: boolean) {
  const { adminId } = await requirePermission(PERMISSIONS.ADMINS_MANAGE);
  const { error } = await adminRepository.setActive(adminUserId, isActive);
  if (!error) {
    await activityRepository.log({ actorType: "admin", actorId: adminId, action: isActive ? "admin_activated" : "admin_deactivated", targetTable: "admin_users", targetId: adminUserId });
    revalidatePath("/admin/admins");
  }
  return { error };
}

export async function updateSettings(input: unknown) {
  const { adminId } = await requirePermission(PERMISSIONS.SETTINGS_EDIT);
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { error: "कृपया सभी फ़ील्ड भरें" };

  await Promise.all([
    settingsRepository.set("signatory_name", parsed.data.signatoryName, adminId),
    settingsRepository.set("signatory_title_hi", parsed.data.signatoryTitleHi, adminId),
    settingsRepository.set("portal_name_hi", parsed.data.portalNameHi, adminId),
    settingsRepository.set("portal_website", parsed.data.portalWebsite, adminId),
  ]);
  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
