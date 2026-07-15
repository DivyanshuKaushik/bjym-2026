"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { District } from "@/lib/types";

export function MembersFilterBar({
  districts,
  initial,
}: {
  districts: District[];
  initial: { q?: string; district?: string; status?: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? "");
  const [district, setDistrict] = useState(initial.district ?? "");
  const [status, setStatus] = useState(initial.status ?? "");

  const apply = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (district) params.set("district", district);
    if (status) params.set("status", status);
    router.push(`/admin/members?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      <Input
        className="min-w-[220px] flex-[2] rounded-full"
        placeholder="🔍 Search नाम / ID / mobile / email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
      />
      <Select className="min-w-[160px] flex-1 rounded-full" value={district} onChange={(e) => setDistrict(e.target.value)}>
        <option value="">सभी जिले</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>{d.name_hi}</option>
        ))}
      </Select>
      <Select className="min-w-[150px] flex-1 rounded-full" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">सभी Status</option>
        <option value="Active">Active</option>
        <option value="Suspended">Suspended</option>
        <option value="Deleted">Deleted</option>
      </Select>
      <Button onClick={apply}>Filter</Button>
    </div>
  );
}
