"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type District } from "@/data/hierarchy";

export function MembersFilterBar({
  districts,
  initial,
}: {
  districts: District[];
  initial: { q?: string; districtId?: string; category?: string; gender?: string; status?: string; verificationStatus?: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? "");
  const [districtId, setDistrictId] = useState(initial.districtId ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [gender, setGender] = useState(initial.gender ?? "");
  const [status, setStatus] = useState(initial.status ?? "");
  const [verificationStatus, setVerificationStatus] = useState(initial.verificationStatus ?? "");

  const apply = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (districtId) params.set("districtId", districtId);
    if (category) params.set("category", category);
    if (gender) params.set("gender", gender);
    if (status) params.set("status", status);
    if (verificationStatus) params.set("verificationStatus", verificationStatus);
    router.push(`/admin/members?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      <Input className="min-w-[200px] flex-[2] rounded-full" placeholder="🔍 Search नाम / ID / mobile / email…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && apply()} />
      <Select className="min-w-[150px] flex-1 rounded-full" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
        <option value="">सभी जिले</option>
        {districts.map((d) => <option key={d.id} value={d.id}>{d.nameHi}</option>)}
      </Select>
      <Select className="min-w-[130px] flex-1 rounded-full" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">सभी वर्ग</option>
        {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.nameHi}</option>)}
      </Select>
      <Select className="min-w-[120px] flex-1 rounded-full" value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">सभी Gender</option>
        <option value="Male">पुरुष</option>
        <option value="Female">महिला</option>
        <option value="Other">अन्य</option>
      </Select>
      <Select className="min-w-[130px] flex-1 rounded-full" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">सभी Status</option>
        <option value="Active">Active</option>
        <option value="Suspended">Suspended</option>
        <option value="Deleted">Deleted</option>
      </Select>
      <Select className="min-w-[150px] flex-1 rounded-full" value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)}>
        <option value="">सभी Verification</option>
        <option value="Pending">Pending</option>
        <option value="Verified">Verified</option>
        <option value="Rejected">Rejected</option>
      </Select>
      <Button onClick={apply}>Filter</Button>
    </div>
  );
}
