"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { approveMember, rejectMember } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import type { MemberRow } from "@/lib/repositories/member.repository";

export function VerificationQueue({ members }: { members: MemberRow[] }) {
  const [rows, setRows] = useState(members);
  const [reasonFor, setReasonFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  const approve = (id: string) => {
    startTransition(async () => {
      const res = await approveMember(id);
      if (!res?.error) setRows((prev) => prev.filter((r) => r.id !== id));
    });
  };

  const reject = (id: string) => {
    if (!reason.trim()) return;
    startTransition(async () => {
      const res = await rejectMember(id, reason);
      if (!res?.error) { setRows((prev) => prev.filter((r) => r.id !== id)); setReasonFor(null); setReason(""); }
    });
  };

  if (rows.length === 0) {
    return <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted">🎉 कोई pending सदस्य नहीं — सब कुछ up to date है।</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((m) => (
        <Card key={m.id}>
          <CardContent className="grid gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={m.full_name} photo={m.photo_base64} size={52} square />
              <div className="min-w-0">
                <div className="truncate font-black text-heading">{m.full_name}</div>
                <div className="text-xs font-bold text-navy">{m.membership_id}</div>
              </div>
            </div>
            <div className="grid gap-1 text-[12.5px] text-muted">
              <div><b className="text-heading">मोबाइल:</b> {m.mobile}</div>
              <div><b className="text-heading">जिला:</b> {m.district_name_hi}</div>
              <div><b className="text-heading">पंजीकरण:</b> {formatDate(m.created_at)}</div>
            </div>

            {reasonFor === m.id ? (
              <div className="grid gap-2">
                <Input placeholder="अस्वीकृति का कारण" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
                <div className="flex gap-2">
                  <Button size="sm" variant="danger" disabled={pending || !reason.trim()} onClick={() => reject(m.id)}>पुष्टि करें</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setReasonFor(null); setReason(""); }}>रद्द करें</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={pending} onClick={() => approve(m.id)}>✓ Approve</Button>
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => setReasonFor(m.id)}>✕ Reject</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
