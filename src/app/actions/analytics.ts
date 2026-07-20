"use server";

import { auth } from "@/lib/auth";
import { memberRepository } from "@/lib/repositories/member.repository";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function getCrossFilterData(xField: string, yField: string) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") throw new Error("Not authenticated");
  if (!(session.user.permissions ?? []).includes(PERMISSIONS.ANALYTICS_VIEW)) throw new Error("Not authorized");

  return memberRepository.analyticsCross(xField, yField);
}
