import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberDetailClient } from "@/components/admin/MemberDetailClient";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("memberships")
    .select("*, districts(name_en,name_hi), assemblies(name_en,name_hi), mandals(name_en,name_hi)")
    .eq("id", id)
    .single();

  if (!member) notFound();

  const { data: referrals } = await supabase
    .from("referrals")
    .select("referred_membership_id, created_at")
    .eq("referrer_membership_id", member.membership_id)
    .order("created_at", { ascending: false });

  return <MemberDetailClient member={member} referrals={referrals ?? []} />;
}
