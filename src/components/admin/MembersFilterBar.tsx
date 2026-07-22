"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORIES, getAssemblies, getMandals, type District } from "@/data/hierarchy";
import { LOKSABHA_CONSTITUENCIES } from "@/data/loksabha";

type FilterState = {
  q?: string; loksabhaId?: string; districtId?: string; assemblyId?: string; mandalId?: string;
  category?: string; jaati?: string; gender?: string; status?: string; verificationStatus?: string;
  hasReferral?: string; dateFrom?: string; dateTo?: string;
};

const EMPTY: FilterState = {};

export function MembersFilterBar({ districts, initial }: { districts: District[]; initial: FilterState }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState<FilterState>(initial);

  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) => setF((p) => ({ ...p, [k]: v }));

  const assemblies = f.districtId ? getAssemblies(f.districtId) : [];
  const mandals = f.districtId && f.assemblyId ? getMandals(f.districtId, f.assemblyId) : [];

  // Filters are only ever executed when the button is clicked — no
  // auto-search while typing/selecting, per spec.
  const applyFilters = () => {
    const params = new URLSearchParams();
    (Object.entries(f) as [string, string | undefined][]).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    startTransition(() => router.push(`/admin/members?${params.toString()}`));
  };

  const resetFilters = () => {
    setF(EMPTY);
    startTransition(() => router.push("/admin/members"));
  };

  return (
    <div className="grid gap-2.5 rounded-2xl border border-border bg-white p-3.5">
      <div className="flex flex-wrap gap-2.5">
        <Input
          className="min-w-[220px] flex-[2] rounded-full"
          placeholder="🔍 सदस्यता ID / नाम / मोबाइल / ईमेल / रेफरल कोड खोजें…"
          value={f.q ?? ""}
          onChange={(e) => set("q", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
        <Select className="min-w-[150px] flex-1 rounded-full" value={f.loksabhaId ?? ""} onChange={(e) => set("loksabhaId", e.target.value)}>
          <option value="">सभी लोकसभा</option>
          {LOKSABHA_CONSTITUENCIES.map((l) => <option key={l.id} value={l.id}>{l.nameHi}</option>)}
        </Select>
        <Select
          className="min-w-[150px] flex-1 rounded-full"
          value={f.districtId ?? ""}
          onChange={(e) => { set("districtId", e.target.value); set("assemblyId", ""); set("mandalId", ""); }}
        >
          <option value="">सभी जिले</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.nameHi}</option>)}
        </Select>
        <Select
          className="min-w-[150px] flex-1 rounded-full"
          value={f.assemblyId ?? ""}
          disabled={!f.districtId}
          onChange={(e) => { set("assemblyId", e.target.value); set("mandalId", ""); }}
        >
          <option value="">सभी विधानसभा</option>
          {assemblies.map((a) => <option key={a.id} value={a.id}>{a.nameHi}</option>)}
        </Select>
        <Select
          className="min-w-[140px] flex-1 rounded-full"
          value={f.mandalId ?? ""}
          disabled={!f.assemblyId}
          onChange={(e) => set("mandalId", e.target.value)}
        >
          <option value="">सभी मंडल</option>
          {mandals.map((m) => <option key={m.id} value={m.id}>{m.nameHi}</option>)}
        </Select>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Select className="min-w-[130px] flex-1 rounded-full" value={f.category ?? ""} onChange={(e) => set("category", e.target.value)}>
          <option value="">सभी वर्ग</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.nameHi}</option>)}
        </Select>
        <Input
          className="min-w-[130px] flex-1 rounded-full"
          placeholder="जाति"
          value={f.jaati ?? ""}
          onChange={(e) => set("jaati", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
        <Select className="min-w-[120px] flex-1 rounded-full" value={f.gender ?? ""} onChange={(e) => set("gender", e.target.value)}>
          <option value="">सभी लिंग</option>
          <option value="Male">पुरुष</option>
          <option value="Female">महिला</option>
          <option value="Other">अन्य</option>
        </Select>
        <Select className="min-w-[130px] flex-1 rounded-full" value={f.status ?? ""} onChange={(e) => set("status", e.target.value)}>
          <option value="">सभी स्थिति</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Deleted">Deleted</option>
        </Select>
        <Select className="min-w-[150px] flex-1 rounded-full" value={f.verificationStatus ?? ""} onChange={(e) => set("verificationStatus", e.target.value)}>
          <option value="">सभी सत्यापन</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
        </Select>
        <Select className="min-w-[150px] flex-1 rounded-full" value={f.hasReferral ?? ""} onChange={(e) => set("hasReferral", e.target.value)}>
          <option value="">सभी Referral</option>
          <option value="yes">केवल Referral वाले</option>
          <option value="no">बिना Referral</option>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-bold text-muted">पंजीकरण तिथि:</span>
        <Input type="date" className="w-auto rounded-full" value={f.dateFrom ?? ""} onChange={(e) => set("dateFrom", e.target.value)} />
        <span className="text-xs text-muted">से</span>
        <Input type="date" className="w-auto rounded-full" value={f.dateTo ?? ""} onChange={(e) => set("dateTo", e.target.value)} />

        <div className="ml-auto flex gap-2">
          <Button variant="ghost" onClick={resetFilters} disabled={pending}>Reset Filters</Button>
          <Button onClick={applyFilters} disabled={pending}>{pending ? "लोड हो रहा है…" : "🔍 Search / Apply Filters"}</Button>
        </div>
      </div>
    </div>
  );
}
