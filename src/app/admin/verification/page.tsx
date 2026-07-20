import { memberRepository } from "@/lib/repositories/member.repository";
import { VerificationQueue } from "@/components/admin/VerificationQueue";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const pending = await memberRepository.pendingVerification(50);
  return (
    <div className="grid gap-4">
      <div className="text-sm text-muted">{pending.length} सदस्य सत्यापन के लिए लंबित हैं</div>
      <VerificationQueue members={pending} />
    </div>
  );
}
