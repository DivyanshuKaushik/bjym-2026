import { createClient } from "@/lib/supabase/server";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  // NOTE: for very large datasets, replace this with SQL aggregation
  // (materialized views / RPC) instead of fetching raw rows.
  const { data: rows } = await supabase
    .from("memberships")
    .select("joined_at, gender, district_id, districts(name_hi)")
    .order("joined_at", { ascending: true })
    .limit(5000);

  const { data: leaderboardRaw } = await supabase
    .from("referrals")
    .select("referrer_membership_id");

  const leaderboardCounts: Record<string, number> = {};
  (leaderboardRaw ?? []).forEach((r) => {
    leaderboardCounts[r.referrer_membership_id] = (leaderboardCounts[r.referrer_membership_id] || 0) + 1;
  });
  const leaderboard = Object.entries(leaderboardCounts)
    .map(([membershipId, count]) => ({ membershipId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return <AnalyticsCharts rows={(rows ?? []) as any} leaderboard={leaderboard} />;
}
