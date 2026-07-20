import { notFound } from "next/navigation";
import { memberRepository } from "@/lib/repositories/member.repository";
import { referralRepository } from "@/lib/repositories/referral.repository";
import { MemberDetailClient } from "@/components/admin/MemberDetailClient";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await memberRepository.findByIdIncludingDeleted(id);
  if (!member) notFound();

  const referrals = await referralRepository.byReferrer(member.membership_id);

  return <MemberDetailClient member={member} referrals={referrals} />;
}
