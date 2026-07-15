import { createClient } from "@/lib/supabase/server";
import { MembersFilterBar } from "@/components/admin/MembersFilterBar";
import { MembersTable } from "@/components/admin/MembersTable";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; district?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: districts } = await supabase.from("districts").select("*").order("name_hi");

  let query = supabase
    .from("memberships")
    .select("*, districts(name_en,name_hi), assemblies(name_en,name_hi), mandals(name_en,name_hi)")
    .order("joined_at", { ascending: false })
    .limit(60);

  if (params.district) query = query.eq("district_id", params.district);
  if (params.status) query = query.eq("status", params.status);
  if (params.q) {
    const q = params.q.trim().replace(/[,()]/g, "");
    query = query.or(`full_name.ilike.%${q}%,membership_id.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: members } = await query;

  return (
    <div className="grid gap-4">
      <MembersFilterBar districts={districts ?? []} initial={params} />
      <MembersTable members={members ?? []} />
    </div>
  );
}
