"use client";

import { useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Row = { joined_at: string; gender: string; district_id: string | null; districts: { name_hi: string } | { name_hi: string }[] | null };

const GENDER_COLORS: Record<string, string> = { Male: "#F36B21", Female: "#1F6B3B", Other: "#161A8D" };
const districtName = (d: Row["districts"]) => (Array.isArray(d) ? d[0]?.name_hi : d?.name_hi) || "अज्ञात";

export function AnalyticsCharts({ rows, leaderboard }: { rows: Row[]; leaderboard: { membershipId: string; count: number }[] }) {
  const growthData = useMemo(() => {
    const byDate: Record<string, number> = {};
    rows.forEach((r) => {
      const date = r.joined_at.slice(0, 10);
      byDate[date] = (byDate[date] || 0) + 1;
    });
    const dates = Object.keys(byDate).sort();
    let cum = 0;
    return dates.slice(-30).map((date) => {
      cum += byDate[date];
      return { date: date.slice(5), daily: byDate[date], total: cum };
    });
  }, [rows]);

  const districtData = useMemo(() => {
    const by: Record<string, number> = {};
    rows.forEach((r) => {
      const name = districtName(r.districts);
      by[name] = (by[name] || 0) + 1;
    });
    return Object.entries(by).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [rows]);

  const genderData = useMemo(() => {
    const by: Record<string, number> = {};
    rows.forEach((r) => {
      by[r.gender] = (by[r.gender] || 0) + 1;
    });
    return Object.entries(by).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const chartCard = "rounded-2xl";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className={chartCard}>
        <CardHeader><CardTitle>Cumulative Growth</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F36B21" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#F36B21" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#D85A0B" fill="url(#g1)" strokeWidth={2.5} name="Total members" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className={chartCard}>
        <CardHeader><CardTitle>Daily Registrations</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="daily" fill="#1F6B3B" radius={[6, 6, 0, 0]} name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className={chartCard}>
        <CardHeader><CardTitle>District-wise Members</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={districtData} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#F36B21" radius={[0, 8, 8, 0]} name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className={chartCard}>
        <CardHeader><CardTitle>Gender Statistics</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {genderData.map((g, i) => (
                  <Cell key={i} fill={GENDER_COLORS[g.name] || "#6B7280"} />
                ))}
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className={`${chartCard} sm:col-span-2`}>
        <CardHeader><CardTitle>Referral Leaderboard (Top 10)</CardTitle></CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-sm text-muted">अभी तक कोई referral नहीं हुआ।</div>
          ) : (
            <div className="grid gap-1.5">
              {leaderboard.map((l, i) => (
                <div key={l.membershipId} className="flex items-center justify-between border-b border-border py-2 text-[13px] last:border-0">
                  <span className="font-bold text-heading">#{i + 1} — {l.membershipId}</span>
                  <span className="rounded-full bg-secondary-light px-3 py-0.5 font-black text-secondary-dark">{l.count} referrals</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
