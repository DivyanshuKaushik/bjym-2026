"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  approveMember, rejectMember, suspendMember, activateMember, softDeleteMember, resetMemberMpin,
} from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import type { MemberRow } from "@/lib/repositories/member.repository";

export function MemberDetailClient({ member, referrals }: { member: MemberRow; referrals: { referred_membership_id: string; created_at: string }[] }) {
  const [status, setStatus] = useState(member.status);
  const [verificationStatus, setVerificationStatus] = useState(member.verification_status);
  const [rejectReason, setRejectReason] = useState("");
  const [newMpin, setNewMpin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ error?: string | null }>, onOk?: () => void) => {
    setError(null); setMsg(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
      else onOk?.();
    });
  };

  const statusTone = status === "Active" ? "success" : status === "Suspended" ? "warning" : "danger";
  const verifTone = verificationStatus === "Verified" ? "success" : verificationStatus === "Rejected" ? "danger" : "warning";

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-5 flex items-center gap-4">
        <Avatar name={member.full_name} photo={member.photo_base64} size={64} />
        <div>
          <div className="text-xl font-black text-heading">{member.full_name}</div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-navy">
            {member.membership_id} <Badge tone={statusTone}>{status}</Badge> <Badge tone={verifTone}>{verificationStatus}</Badge>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-danger/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-danger">{error}</div>}
      {msg && <div className="mb-4 rounded-xl border border-secondary/30 bg-secondary-light px-4 py-2.5 text-sm font-bold text-secondary-dark">{msg}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>व्यक्तिगत विवरण</CardTitle></CardHeader>
          <CardContent className="grid gap-1.5 text-[13px]">
            <Row label="पिता/पति का नाम" value={member.father_name} />
            <Row label="जन्मतिथि" value={formatDate(member.dob)} />
            <Row label="लिंग" value={member.gender} />
            <Row label="वर्ग" value={member.category} />
            <Row label="जाति" value={member.jaati} />
            <Row label="मोबाइल" value={member.mobile} />
            <Row label="WhatsApp" value={member.whatsapp} />
            <Row label="ईमेल" value={member.email} />
            <Row label="पता" value={`${member.address} — ${member.pincode}`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>निर्वाचन एवं सदस्यता विवरण</CardTitle></CardHeader>
          <CardContent className="grid gap-1.5 text-[13px]">
            <Row label="लोकसभा" value={member.loksabha_name_hi || "—"} />
            <Row label="जिला" value={member.district_name_hi} />
            <Row label="विधानसभा" value={member.assembly_name_hi} />
            <Row label="मंडल" value={member.mandal_name_hi} />
            <Row label="बूथ" value={member.booth || "—"} />
            <Row label="पंजीकरण तिथि" value={formatDate(member.created_at)} />
            <Row label="Referral Code" value={member.referral_code} />
            <Row label="Referral Count" value={String(member.referral_count)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Verification</CardTitle></CardHeader>
          <CardContent className="grid gap-2.5">
            {verificationStatus === "Pending" ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => approveMember(member.id), () => setVerificationStatus("Verified"))}>Approve</Button>
                </div>
                <Input placeholder="अस्वीकृति का कारण" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                <Button size="sm" variant="danger" disabled={pending || !rejectReason} onClick={() => run(() => rejectMember(member.id, rejectReason), () => setVerificationStatus("Rejected"))}>Reject</Button>
              </>
            ) : (
              <div className="text-sm text-muted">Verification status: <b>{verificationStatus}</b>{member.rejection_reason ? ` — ${member.rejection_reason}` : ""}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Member Actions</CardTitle></CardHeader>
          <CardContent className="grid gap-2.5">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={status === "Active" ? "outline" : "secondary"} disabled={pending} onClick={() => run(() => activateMember(member.id), () => setStatus("Active"))}>Activate</Button>
              <Button size="sm" variant={status === "Suspended" ? "outline" : "ghost"} disabled={pending} onClick={() => run(() => suspendMember(member.id), () => setStatus("Suspended"))}>Suspend</Button>
              <Button size="sm" variant="danger" disabled={pending} onClick={() => run(() => softDeleteMember(member.id), () => setStatus("Deleted"))}>Soft Delete</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader><CardTitle>Reset Member MPIN</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap items-end gap-2.5">
            <div className="flex-1 min-w-[160px]">
              <Input inputMode="numeric" maxLength={6} placeholder="नया MPIN (4 या 6 अंक)" value={newMpin} onChange={(e) => setNewMpin(e.target.value.replace(/\D/g, ""))} />
            </div>
            <Button size="sm" disabled={pending || !newMpin} onClick={() => run(() => resetMemberMpin(member.id, newMpin), () => { setMsg("MPIN reset हो गया ✓"); setNewMpin(""); })}>Reset MPIN</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Referral Tree ({referrals.length})</CardTitle></CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-sm text-muted">अभी तक कोई referral नहीं।</div>
          ) : (
            <div className="grid gap-1.5">
              {referrals.map((r) => (
                <div key={r.referred_membership_id} className="flex justify-between border-b border-border py-1.5 text-[13px] last:border-0">
                  <span className="font-bold text-navy">{r.referred_membership_id}</span>
                  <span className="text-muted">{formatDate(r.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-bold text-heading">{value}</span>
    </div>
  );
}
