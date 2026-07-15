"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { addDistrict, addAssembly, addMandal, deleteHierarchyRow } from "@/app/actions/admin";
import type { District, Assembly, Mandal } from "@/lib/types";

export function HierarchyManager({
  districts, assemblies, mandals,
}: { districts: District[]; assemblies: Assembly[]; mandals: Mandal[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [dEn, setDEn] = useState(""); const [dHi, setDHi] = useState("");
  const [aDistrict, setADistrict] = useState(""); const [aEn, setAEn] = useState(""); const [aHi, setAHi] = useState("");
  const [mAssembly, setMAssembly] = useState(""); const [mEn, setMEn] = useState(""); const [mHi, setMHi] = useState("");

  const run = (fn: () => Promise<{ error?: string; success?: boolean }>, reset: () => void) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
      else {
        reset();
        router.refresh();
      }
    });
  };

  const del = (table: "districts" | "assemblies" | "mandals", id: string) => {
    if (!confirm("क्या आप वाकई delete करना चाहते हैं? इससे जुड़े सभी sub-records भी हट जाएँगे।")) return;
    startTransition(async () => {
      const res = await deleteHierarchyRow(table, id);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="grid gap-4">
      {error && <div className="rounded-xl border border-danger/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-danger">{error}</div>}

      <Card>
        <CardHeader><CardTitle>जिले (Districts)</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="English name" value={dEn} onChange={(e) => setDEn(e.target.value)} className="flex-1 min-w-[160px]" />
            <Input placeholder="हिंदी नाम" value={dHi} onChange={(e) => setDHi(e.target.value)} className="flex-1 min-w-[160px]" />
            <Button size="sm" disabled={pending || !dEn || !dHi} onClick={() => run(() => addDistrict(dEn, dHi), () => { setDEn(""); setDHi(""); })}>+ Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {districts.map((d) => (
              <span key={d.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-bold">
                {d.name_hi} <button onClick={() => del("districts", d.id)} className="text-danger">✕</button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>विधानसभा (Assemblies)</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Select value={aDistrict} onChange={(e) => setADistrict(e.target.value)} className="flex-1 min-w-[160px]">
              <option value="">जिला चुनें</option>
              {districts.map((d) => <option key={d.id} value={d.id}>{d.name_hi}</option>)}
            </Select>
            <Input placeholder="English name" value={aEn} onChange={(e) => setAEn(e.target.value)} className="flex-1 min-w-[140px]" />
            <Input placeholder="हिंदी नाम" value={aHi} onChange={(e) => setAHi(e.target.value)} className="flex-1 min-w-[140px]" />
            <Button size="sm" disabled={pending || !aDistrict || !aEn || !aHi} onClick={() => run(() => addAssembly(aDistrict, aEn, aHi), () => { setAEn(""); setAHi(""); })}>+ Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {assemblies.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-bold">
                {a.name_hi} <button onClick={() => del("assemblies", a.id)} className="text-danger">✕</button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>मंडल (Mandals)</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Select value={mAssembly} onChange={(e) => setMAssembly(e.target.value)} className="flex-1 min-w-[160px]">
              <option value="">विधानसभा चुनें</option>
              {assemblies.map((a) => <option key={a.id} value={a.id}>{a.name_hi}</option>)}
            </Select>
            <Input placeholder="English name" value={mEn} onChange={(e) => setMEn(e.target.value)} className="flex-1 min-w-[140px]" />
            <Input placeholder="हिंदी नाम" value={mHi} onChange={(e) => setMHi(e.target.value)} className="flex-1 min-w-[140px]" />
            <Button size="sm" disabled={pending || !mAssembly || !mEn || !mHi} onClick={() => run(() => addMandal(mAssembly, mEn, mHi), () => { setMEn(""); setMHi(""); })}>+ Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {mandals.map((m) => (
              <span key={m.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-bold">
                {m.name_hi} <button onClick={() => del("mandals", m.id)} className="text-danger">✕</button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
