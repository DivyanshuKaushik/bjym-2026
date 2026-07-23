"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/ui/badge";
import { suspendMember, activateMember, softDeleteMember } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import type { MemberRow } from "@/lib/repositories/member.repository";

export function MembersTable({ members, total }: { members: MemberRow[]; total: number; page?: number; pageSize?: number }) {
  const [rows, setRows] = useState(members);
  const [pending, startTransition] = useTransition();

  // BUG FIX: useState(members) only seeds the initial value on first
  // mount — when a new filtered/paginated `members` prop arrives after a
  // client-side navigation (Next.js reuses this component instance
  // rather than remounting it), the old `rows` stayed stuck forever,
  // while `total` (rendered directly from the prop, no local state)
  // updated correctly. That mismatch is exactly what showed up as
  // "9 of 3 members shown" with all 9 unfiltered rows still visible.
  // Resyncing here whenever the prop actually changes fixes it.
  useEffect(() => {
    setRows(members);
  }, [members]);

  const toggle = (m: MemberRow) => {
    startTransition(async () => {
      const res = m.status === "Active" ? await suspendMember(m.id) : await activateMember(m.id);
      if (!res?.error) {
        setRows((prev) => prev.map((r) => (r.id === m.id ? { ...r, status: m.status === "Active" ? "Suspended" : "Active" } : r)));
      }
    });
  };

  const remove = (m: MemberRow) => {
    if (!confirm(`${m.full_name} को soft-delete करें?`)) return;
    startTransition(async () => {
      const res = await softDeleteMember(m.id);
      if (!res?.error) setRows((prev) => prev.map((r) => (r.id === m.id ? { ...r, status: "Deleted" } : r)));
    });
  };

  const exportCsv = () => {
    const header = "Membership ID,Name,Mobile,Email,District,Category,Jaati,Gender,Status,Verification,Joined";
    const csvRows = rows.map((m) => [m.membership_id, m.full_name, m.mobile, m.email, m.district_name_en, m.category, m.jaati, m.gender, m.status, m.verification_status, m.created_at].join(","));
    const blob = new Blob(["\uFEFF" + header + "\n" + csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bjym-members.csv";
    a.click();
  };

  const statusTone = (s: string) => (s === "Active" ? "success" : s === "Suspended" ? "warning" : "danger");
  const verifTone = (s: string) => (s === "Verified" ? "success" : s === "Rejected" ? "danger" : "warning");

  return (
    <div className="relative rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="text-xs text-muted">{rows.length} of {total} members shown</span>
        <button onClick={exportCsv} className="rounded-full border border-border px-3 py-1.5 text-xs font-bold hover:bg-bg">⬇ Quick CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-bg text-left">
              {["Member", "Membership ID", "Phone", "District", "Category", "Status", "Verification", "Joined", ""].map((h) => (
                <th key={h} className="border-b border-border p-3 text-[10.5px] font-extrabold uppercase tracking-wide text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b border-border">
                <td className="p-2.5">
                  <Link href={`/admin/members/${m.id}`} className="flex items-center gap-2 font-bold text-heading hover:underline">
                    <Avatar name={m.full_name} photo={m.photo_url} size={28} />
                    {m.full_name}
                  </Link>
                </td>
                <td className="whitespace-nowrap p-2.5 font-bold text-navy">{m.membership_id}</td>
                <td className="p-2.5">{m.mobile}</td>
                <td className="p-2.5">{m.district_name_hi}</td>
                <td className="p-2.5">{m.category}</td>
                <td className="p-2.5"><Badge tone={statusTone(m.status)}>{m.status}</Badge></td>
                <td className="p-2.5"><Badge tone={verifTone(m.verification_status)}>{m.verification_status}</Badge></td>
                <td className="whitespace-nowrap p-2.5">{formatDate(m.created_at)}</td>
                <td className="whitespace-nowrap p-2.5">
                  <button onClick={() => toggle(m)} disabled={pending} title="Suspend / Activate" className="mr-1 text-sm">🔁</button>
                  <button onClick={() => remove(m)} disabled={pending} title="Soft Delete" className="text-sm">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
