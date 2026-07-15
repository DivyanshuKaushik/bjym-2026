import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("*, districts(name_en,name_hi), assemblies(name_en,name_hi), mandals(name_en,name_hi)")
    .eq("profile_id", user.id)
    .single();

  if (!membership) redirect("/register");

  const { count: referralCount } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_membership_id", membership.membership_id);

  const { data: settings } = await supabase.from("settings").select("key,value").in("key", ["signatory_name", "signatory_title_hi"]);
  const signatoryName = (settings?.find((s) => s.key === "signatory_name")?.value as string) || "Rahul Yograj Tikariha";
  const signatoryTitleHi = (settings?.find((s) => s.key === "signatory_title_hi")?.value as string) || "प्रदेश अध्यक्ष";

  return (
    <DashboardClient
      membership={membership}
      referralCount={referralCount ?? 0}
      signatoryName={signatoryName}
      signatoryTitleHi={signatoryTitleHi}
    />
  );
}
