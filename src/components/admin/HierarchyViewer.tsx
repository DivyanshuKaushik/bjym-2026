"use client";

import { useMemo, useState } from "react";
import { HIERARCHY } from "@/data/hierarchy";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function HierarchyViewer() {
  const [query, setQuery] = useState("");
  const [openDistrict, setOpenDistrict] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HIERARCHY;
    return HIERARCHY.filter(
      (d) =>
        d.nameHi.toLowerCase().includes(q) ||
        d.nameEn.toLowerCase().includes(q) ||
        d.assemblies.some((a) => a.nameHi.toLowerCase().includes(q) || a.mandals.some((m) => m.nameHi.toLowerCase().includes(q)))
    );
  }, [query]);

  return (
    <div className="grid gap-3">
      <Input placeholder="🔍 जिला, विधानसभा या मंडल खोजें…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-[380px]" />
      <div className="grid gap-2.5">
        {filtered.map((d) => {
          const isOpen = openDistrict === d.id || !!query.trim();
          return (
            <Card key={d.id}>
              <button
                onClick={() => setOpenDistrict(isOpen && !query.trim() ? null : d.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="font-black text-heading">
                  {d.nameHi} <span className="ml-1 text-xs font-normal text-muted">({d.nameEn})</span>
                </span>
                <span className="text-xs font-bold text-muted">
                  {d.assemblies.length} विधानसभा · {d.assemblies.reduce((s, a) => s + a.mandals.length, 0)} मंडल {isOpen ? "▲" : "▼"}
                </span>
              </button>
              {isOpen && (
                <CardContent className="border-t border-border pt-3">
                  {d.assemblies.map((a) => (
                    <div key={a.id} className="mb-3 border-l-2 border-primary-light pl-3.5 last:mb-0">
                      <div className="text-[13px] font-bold text-primary-dark">{a.nameHi}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {a.mandals.map((m) => (
                          <span key={m.id} className="rounded-full bg-bg px-2.5 py-1 text-[10.5px] font-bold text-muted">
                            {m.nameHi}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
        {filtered.length === 0 && <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-muted">कोई परिणाम नहीं मिला।</div>}
      </div>
    </div>
  );
}
