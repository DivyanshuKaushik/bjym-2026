"use server";

import { signOut, auth } from "@/lib/auth";
import { memberRepository } from "@/lib/repositories/member.repository";
import { adminRepository } from "@/lib/repositories/admin.repository";
import { db } from "@/lib/db/client";

export async function logout() {
  await signOut({ redirectTo: "/" });
}

/** "Logout Everywhere" — bumps token_version so every previously-issued
 *  JWT (on any device) fails the middleware's freshness check on its
 *  next protected-route navigation, then signs the current device out too. */
export async function logoutEverywhere() {
  const session = await auth();
  if (!session?.user) return;

  if (session.user.userType === "member") {
    const member = await memberRepository.findById(session.user.id);
    if (member) {
      await db().from("members").update({ token_version: member.token_version + 1 }).eq("id", member.id);
    }
  } else {
    await adminRepository.bumpTokenVersion(session.user.id);
  }

  await signOut({ redirectTo: "/" });
}
