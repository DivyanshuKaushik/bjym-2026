"use server";

import { signIn } from "@/lib/auth";
import { memberLoginSchema, adminLoginSchema } from "@/lib/validators/auth";
import { adminRepository } from "@/lib/repositories/admin.repository";
import { getDefaultAdminRoute } from "@/lib/rbac/permissions";
import { AuthError } from "next-auth";

export async function loginMember(input: unknown) {
  const parsed = memberLoginSchema.safeParse(input);
  if (!parsed.success) return { error: "कृपया मान्य जानकारी डालें" };

  try {
    await signIn("member", {
      identifier: parsed.data.identifier,
      mpin: parsed.data.mpin,
      remember: String(parsed.data.remember),
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "मोबाइल/ईमेल या MPIN गलत है, या खाता suspend/deleted है" };
    }
    throw err; // NEXT_REDIRECT — let it propagate so the navigation actually happens
  }
  return {};
}

export async function loginAdmin(input: unknown) {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) return { error: "कृपया मान्य जानकारी डालें" };

  const admin = await adminRepository.findByUsername(parsed.data.username);
  let redirectTo = "/admin";
  if (admin) {
    const permissions = await adminRepository.permissionsForRole(admin.role_id);
    redirectTo = getDefaultAdminRoute(permissions);
  }

  try {
    await signIn("admin", {
      username: parsed.data.username,
      password: parsed.data.password,
      remember: String(parsed.data.remember),
      redirectTo,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Username या Password गलत है, या खाता निष्क्रिय है" };
    }
    throw err;
  }
  return {};
}
