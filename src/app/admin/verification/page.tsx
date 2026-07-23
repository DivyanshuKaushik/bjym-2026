import { Suspense } from "react";
import { memberRepository } from "@/lib/repositories/member.repository";
import { VerificationQueue } from "@/components/admin/VerificationQueue";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function VerificationPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);

  const { rows, total } = await memberRepository.pendingVerification(PAGE_SIZE, (page - 1) * PAGE_SIZE);

  return (
    <div className="grid gap-4">
      <div className="text-sm text-muted">
        कुल <b className="text-heading">{total.toLocaleString("en-IN")}</b> सदस्य सत्यापन के लिए लंबित हैं
        {total > 0 && ` — ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} दिखाए जा रहे हैं`}
      </div>
      <Suspense>
        <VerificationQueue members={rows} total={total} page={page} pageSize={PAGE_SIZE} />
      </Suspense>
    </div>
  );
}
