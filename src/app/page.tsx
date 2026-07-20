import { memberRepository } from "@/lib/repositories/member.repository";
import { HIERARCHY } from "@/data/hierarchy";
import { HomeClient } from "@/components/home/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const kpis = await memberRepository.kpis();
  return <HomeClient totalMembers={kpis.active} districtsCount={HIERARCHY.length} />;
}
