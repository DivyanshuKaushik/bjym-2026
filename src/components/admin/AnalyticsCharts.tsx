"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getCrossFilterData } from "@/app/actions/analytics";

const GENDER_COLORS: Record<string, string> = { Male: "#F36B21", Female: "#1F6B3B", Other: "#161A8D" };
const CROSS_FIELDS = [
  ["district_name_hi", "District"], ["assembly_name_hi", "Assembly"], ["mandal_name_hi", "Mandal"],
  ["category", "Category"], ["gender", "Gender"], ["jaati", "Jaati"],
] as const;
const palette = ["#F36B21", "#1F6B3B", "#161A8D", "#D85A0B", "#F59E0B", "#6B7280"];

type GrowthRow = { day: string; daily_count: number; cumulative_count: number };
type BreakdownRow = { name: string; count: number };
type AgeRow = { bucket: string; count: number };
type LeaderRow = { membership_id: string; full_name: string; referral_count: number };

export function AnalyticsCharts({
  growth, district, category, gender, jaati, age, leaderboard,
}: {
  growth: GrowthRow[]; district: BreakdownRow[]; category: BreakdownRow[]; gender: BreakdownRow[];
  jaati: BreakdownRow[]; age: AgeRow[]; leaderboard: LeaderRow[];
}) {
  const [crossX, setCrossX] = useState("district_name_hi");
  const [crossY, setCrossY] = useState("category");
  const [crossRaw, setCrossRaw] = useState<{ x_value: string; y_value: string; count: number }[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => setCrossRaw(await getCrossFilterData(crossX, crossY)));
  }, [crossX, crossY]);

  const growthData = useMemo(() => growth.map((g) => ({ date: g.day.slice(5), daily: g.daily_count, total: g.cumulative_count })), [growth]);
  const ageOrder = ["18-22", "23-27", "28-32", "33-37", "38-40"];
  const ageData = useMemo(() => ageOrder.map((b) => ({ name: b, count: age.find((a) => a.bucket === b)?.count ?? 0 })), [age]);

  const crossData = useMemo(() => {
    const byX: Record<string, Record<string, number>> = {};
    crossRaw.forEach((r) => {
      byX[r.x_value] = byX[r.x_value] || {};
      byX[r.x_value][r.y_value] = r.count;
    });
    const yKeys = [...new Set(crossRaw.map((r) => r.y_value))].slice(0, 6);
    const data = Object.entries(byX)
      .map(([x, counts]) => ({ name: x, total: Object.values(counts).reduce((a, b) => a + b, 0), ...counts }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
    return { data, yKeys };
  }, [crossRaw]);

  const chartCard = "rounded-2xl";

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className={chartCard}>
          <CardHeader><CardTitle>Cumulative Growth (all-time, last 30 days shown)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData}>
                <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F36B21" stopOpacity={0.5} /><stop offset="100%" stopColor="#F36B21" stopOpacity={0.03} /></linearGradient></defs>
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
            <ResponsiveContainer width="100%" height={220}>
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
              <BarChart data={district} layout="vertical" margin={{ left: 30 }}>
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
          <CardHeader><CardTitle>Gender Ratio</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={gender} dataKey="count" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {gender.map((g, i) => <Cell key={i} fill={GENDER_COLORS[g.name] || "#6B7280"} />)}
                </Pie>
                <Legend /><Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={chartCard}>
          <CardHeader><CardTitle>Category (वर्ग) Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={category}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#161A8D" radius={[6, 6, 0, 0]} name="Members" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={chartCard}>
          <CardHeader><CardTitle>Age Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#D85A0B" radius={[6, 6, 0, 0]} name="Members" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={`${chartCard} sm:col-span-2`}>
          <CardHeader><CardTitle>Top Jaati (Top 12)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={jaati} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" radius={[0, 8, 8, 0]} name="Members" />
              </BarChart>
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

      <Card className={chartCard}>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Cross Filter <span className="font-normal text-muted">(SQL GROUP BY — scales to any table size)</span></CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={crossX} onChange={(e) => setCrossX(e.target.value)} className="w-auto">
              {CROSS_FIELDS.map(([k, l]) => <option key={k} value={k}>{l} (X)</option>)}
            </Select>
            <Select value={crossY} onChange={(e) => setCrossY(e.target.value)} className="w-auto">
              {CROSS_FIELDS.map(([k, l]) => <option key={k} value={k}>{l} (breakdown)</option>)}
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {pending ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted">लोड हो रहा है…</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={crossData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                {crossData.yKeys.map((k, i) => (
                  <Bar key={k} dataKey={k} stackId="a" fill={palette[i % palette.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="mt-2 text-[11px] text-muted">उदाहरण: District vs Category, Assembly vs Gender, Mandal vs Jaati — ऊपर के dropdown से कोई भी combination चुनें।</p>
        </CardContent>
      </Card>
    </div>
  );
}
