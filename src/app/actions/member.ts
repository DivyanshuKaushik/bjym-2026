"use server";

import { auth, signIn } from "@/lib/auth";
import { memberRepository } from "@/lib/repositories/member.repository";
import { mpinResetSchema } from "@/lib/validators/auth";
import { AuthError } from "next-auth";

export async function changeMpin(input: { currentMpin: string; newMpin: string; confirmMpin: string }) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "member") return { error: "अनधिकृत" };

  const parsed = mpinResetSchema.safeParse({ newMpin: input.newMpin, confirmMpin: input.confirmMpin });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "अमान्य MPIN" };

  const member = await memberRepository.findById(session.user.id);
  if (!member) return { error: "सदस्य नहीं मिला" };

  const valid = await memberRepository.verifyMpin(member, input.currentMpin);
  if (!valid) return { error: "वर्तमान MPIN गलत है" };

  const { error } = await memberRepository.selfChangeMpin(member.id, input.newMpin);
  if (error) return { error };

  // Refresh the session's embedded tokenVersion so this device stays logged in.
  try {
    await signIn("member", { identifier: member.mobile, mpin: input.newMpin, remember: "true", redirectTo: "/dashboard" });
  } catch (err) {
    if (!(err instanceof AuthError)) throw err; // NEXT_REDIRECT
  }
  return { success: true };
}

export async function recordIdCardDownload() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "member") return;
  await memberRepository.markIdCardGenerated(session.user.id);
}
