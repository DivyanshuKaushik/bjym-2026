import { memberRepository } from "@/lib/repositories/member.repository";
import { MembersFilterBar } from "@/components/admin/MembersFilterBar";
import { MembersTable } from "@/components/admin/MembersTable";
import { HIERARCHY } from "@/data/hierarchy";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; districtId?: string; category?: string; gender?: string; status?: string; verificationStatus?: string }>;
}) {
  const params = await searchParams;

  const { rows, total } = await memberRepository.list({
    q: params.q,
    districtId: params.districtId,
    category: params.category,
    gender: params.gender,
    status: params.status,
    verificationStatus: params.verificationStatus,
    limit: 60,
  });

  const allDistricts = HIERARCHY;

  return (
    <div className="grid gap-4">
      <MembersFilterBar districts={allDistricts} initial={params} />
      <MembersTable members={rows} total={total} />
    </div>
  );
}
