"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setMemberStatus } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import type { Membership } from "@/lib/types";

export function MembersTable({ members }: { members: Membership[] }) {
  const [rows, setRows] = useState(members);
  const [pending, startTransition] = useTransition();

  const toggle = (m: Membership) => {
    const next = m.status === "Active" ? "Suspended" : "Active";
    startTransition(async () => {
      const res = await setMemberStatus(m.membership_id, next);
      if (!res?.error) {
        setRows((prev) => prev.map((r) => (r.membership_id === m.membership_id ? { ...r, status: next } : r)));
      }
    });
  };

  const softDelete = (m: Membership) => {
    if (!confirm(`${m.full_name} को soft-delete करें? यह member अब login नहीं कर पाएगा।`)) return;
    startTransition(async () => {
      const res = await setMemberStatus(m.membership_id, "Deleted");
      if (!res?.error) {
        setRows((prev) => prev.map((r) => (r.membership_id === m.membership_id ? { ...r, status: "Deleted" } : r)));
      }
    });
  };

  const exportCsv = () => {
    const header = "Membership ID,Name,Phone,Email,District,Assembly,Mandal,Booth,Gender,Status,Joined";
    const csvRows = rows.map((m) =>
      [
        m.membership_id, m.full_name, m.phone, m.email,
        m.districts?.name_en, m.assemblies?.name_en, m.mandals?.name_en, m.booth,
        m.gender, m.status, m.joined_at,
      ].join(",")
    );
    const blob = new Blob(["\uFEFF" + header + "\n" + csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bjym-members.csv";
    a.click();
  };

  const statusTone = (s: string) => (s === "Active" ? "success" : s === "Suspended" ? "warning" : "danger");

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="text-xs text-muted">{rows.length} members shown (latest 60)</span>
        <Button size="sm" variant="secondary" onClick={exportCsv}>⬇ Export CSV</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-bg text-left">
              {["Member", "Membership ID", "Phone", "District", "Mandal", "Status", "Joined", ""].map((h) => (
                <th key={h} className="border-b border-border p-3 text-[10.5px] font-extrabold uppercase tracking-wide text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b border-border">
                <td className="p-2.5">
                  <Link href={`/admin/members/${m.id}`} className="flex items-center gap-2 font-bold text-heading hover:underline">
                    <Avatar name={m.full_name} photo={m.photo_base64} size={28} />
                    {m.full_name}
                  </Link>
                </td>
                <td className="p-2.5 whitespace-nowrap font-bold text-navy">{m.membership_id}</td>
                <td className="p-2.5">{m.phone}</td>
                <td className="p-2.5">{m.districts?.name_hi}</td>
                <td className="p-2.5">{m.mandals?.name_hi}</td>
                <td className="p-2.5"><Badge tone={statusTone(m.status)}>{m.status}</Badge></td>
                <td className="p-2.5 whitespace-nowrap">{formatDate(m.joined_at)}</td>
                <td className="whitespace-nowrap p-2.5">
                  <button onClick={() => toggle(m)} disabled={pending} title="Suspend / Activate" className="mr-1 text-sm">🔁</button>
                  <button onClick={() => softDelete(m)} disabled={pending} title="Soft Delete" className="text-sm">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
