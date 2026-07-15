import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function KPI({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <Card className="transition-transform hover:-translate-y-1">
      <CardContent className="flex items-center gap-3.5 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-lg">{icon}</div>
        <div className="min-w-0">
          <div className="text-xl font-black leading-tight text-heading">{value}</div>
          <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wide text-muted">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthAgo = new Date(Date.now() - 30 * 86400000);

  const [
    total, todayCount, week, month, active, suspended, deleted,
    districts, assemblies, mandals, referralsCount, male, female, other,
  ] = await Promise.all([
    supabase.from("memberships").select("*", { count: "exact", head: true }),
    supabase.from("memberships").select("*", { count: "exact", head: true }).gte("joined_at", todayStart.toISOString()),
    supabase.from("memberships").select("*", { count: "exact", head: true }).gte("joined_at", weekAgo.toISOString()),
    supabase.from("memberships").select("*", { count: "exact", head: true }).gte("joined_at", monthAgo.toISOString()),
    supabase.from("memberships").select("*", { count: "exact", head: true }).eq("status", "Active"),
    supabase.from("memberships").select("*", { count: "exact", head: true }).eq("status", "Suspended"),
    supabase.from("memberships").select("*", { count: "exact", head: true }).eq("status", "Deleted"),
    supabase.from("districts").select("*", { count: "exact", head: true }),
    supabase.from("assemblies").select("*", { count: "exact", head: true }),
    supabase.from("mandals").select("*", { count: "exact", head: true }),
    supabase.from("referrals").select("*", { count: "exact", head: true }),
    supabase.from("memberships").select("*", { count: "exact", head: true }).eq("gender", "Male"),
    supabase.from("memberships").select("*", { count: "exact", head: true }).eq("gender", "Female"),
    supabase.from("memberships").select("*", { count: "exact", head: true }).eq("gender", "Other"),
  ]);

  const totalCount = total.count ?? 0;
  const conversionPct = totalCount > 0 ? (((referralsCount.count ?? 0) / totalCount) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <KPI label="Total Members" value={totalCount} icon="👥" />
        <KPI label="Today" value={todayCount.count ?? 0} icon="⚡" />
        <KPI label="This Week" value={week.count ?? 0} icon="📈" />
        <KPI label="This Month" value={month.count ?? 0} icon="🗓️" />
        <KPI label="Active" value={active.count ?? 0} icon="✅" />
        <KPI label="Suspended" value={suspended.count ?? 0} icon="⏸️" />
        <KPI label="Deleted" value={deleted.count ?? 0} icon="🗑️" />
        <KPI label="Districts" value={districts.count ?? 0} icon="🏛️" />
        <KPI label="Assemblies" value={assemblies.count ?? 0} icon="🗳️" />
        <KPI label="Mandals" value={mandals.count ?? 0} icon="📍" />
        <KPI label="Total Referrals" value={referralsCount.count ?? 0} icon="🔗" />
        <KPI label="Referral Conversion" value={`${conversionPct}%`} icon="🎯" />
        <KPI label="Male Members" value={male.count ?? 0} icon="👨" />
        <KPI label="Female Members" value={female.count ?? 0} icon="👩" />
        <KPI label="Other" value={other.count ?? 0} icon="🧑" />
      </div>
    </div>
  );
}
