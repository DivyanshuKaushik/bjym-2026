import Link from "next/link";
import { memberRepository } from "@/lib/repositories/member.repository";
import { referralRepository } from "@/lib/repositories/referral.repository";
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
  const [kpis, leaderboard] = await Promise.all([memberRepository.kpis(), referralRepository.leaderboard(5)]);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <KPI label="Total Members" value={kpis.total} icon="👥" />
        <KPI label="Today" value={kpis.today} icon="⚡" />
        <KPI label="This Week" value={kpis.week} icon="📈" />
        <KPI label="This Month" value={kpis.month} icon="🗓️" />
        <KPI label="Active" value={kpis.active} icon="✅" />
        <KPI label="Suspended" value={kpis.suspended} icon="⏸️" />
        <KPI label="Deleted" value={kpis.deleted} icon="🗑️" />
        <KPI label="Verified" value={kpis.verified} icon="🛡️" />
        <KPI label="Pending Verification" value={kpis.pending} icon="🕓" />
        <KPI label="Rejected" value={kpis.rejected} icon="🚫" />
        <KPI label="Male" value={kpis.male} icon="👨" />
        <KPI label="Female" value={kpis.female} icon="👩" />
        <KPI label="Other" value={kpis.other} icon="🧑" />
        <KPI label="Referral Count" value={kpis.referralCount} icon="🔗" />
        <KPI label="Referral Conversion" value={`${kpis.conversionPct}%`} icon="🎯" />
      </div>

      <Card>
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <div className="font-black text-heading">Top Referrers</div>
            <Link href="/admin/analytics" className="text-xs font-bold text-primary-dark hover:underline">पूरी लिस्ट देखें →</Link>
          </div>
          {leaderboard.rows.length === 0 ? (
            <div className="text-sm text-muted">अभी तक कोई referral नहीं हुआ।</div>
          ) : (
            <div className="grid gap-1.5">
              {leaderboard.rows.map((l, i) => (
                <div key={l.membership_id} className="flex items-center justify-between border-b border-border py-2 text-[13px] last:border-0">
                  <span className="font-bold text-heading">#{i + 1} — {l.full_name} <span className="text-muted">({l.membership_id})</span></span>
                  <span className="rounded-full bg-secondary-light px-3 py-0.5 font-black text-secondary-dark">{l.referral_count} referrals</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
