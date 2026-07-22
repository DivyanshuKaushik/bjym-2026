import { memberRepository } from "@/lib/repositories/member.repository";
import { MembersFilterBar } from "@/components/admin/MembersFilterBar";
import { MembersTable } from "@/components/admin/MembersTable";
import { MembersPagination } from "@/components/admin/MembersPagination";
import { HIERARCHY } from "@/data/hierarchy";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type MembersSearchParams = {
  q?: string; loksabhaId?: string; districtId?: string; assemblyId?: string; mandalId?: string;
  category?: string; jaati?: string; gender?: string; status?: string; verificationStatus?: string;
  hasReferral?: string; dateFrom?: string; dateTo?: string; page?: string;
};

export default async function AdminMembersPage({ searchParams }: { searchParams: Promise<MembersSearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const { rows, total } = await memberRepository.list({
    q: params.q,
    loksabhaId: params.loksabhaId,
    districtId: params.districtId,
    assemblyId: params.assemblyId,
    mandalId: params.mandalId,
    category: params.category,
    jaati: params.jaati,
    gender: params.gender,
    status: params.status,
    verificationStatus: params.verificationStatus,
    hasReferral: params.hasReferral === "yes" ? true : params.hasReferral === "no" ? false : undefined,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  return (
    <div className="grid gap-4">
      <MembersFilterBar districts={HIERARCHY} initial={params} />
      <MembersTable members={rows} total={total} page={page} pageSize={PAGE_SIZE} />
      <MembersPagination total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
