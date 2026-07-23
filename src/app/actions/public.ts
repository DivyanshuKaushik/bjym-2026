"use server";

import { memberRepository } from "@/lib/repositories/member.repository";
import { formatDate } from "@/lib/utils";

export async function verifyMembership(membershipId: string) {
  const id = membershipId.trim();
  if (!id) return null;
  const member = await memberRepository.verifyPublic(id);
  if (!member) return "notfound" as const;
  return {
    membershipId: member.membership_id as string,
    fullName: member.full_name as string,
    photoBase64: (member.photo_url as string | null) ?? (member.photo_base64 as string | null),
    districtNameHi: member.district_name_hi as string,
    mandalNameHi: member.mandal_name_hi as string,
    status: member.status as string,
    verificationStatus: member.verification_status as string,
    joinedAt: formatDate(member.created_at as string),
  };
}
