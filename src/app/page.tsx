import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "@/components/home/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("memberships")
    .select("*", { count: "exact", head: true })
    .eq("status", "Active");

  return <HomeClient totalMembers={count ?? 0} />;
}
