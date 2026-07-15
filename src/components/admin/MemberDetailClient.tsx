"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setMemberStatus, resetMemberPassword, regenerateMembershipId } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import type { Membership } from "@/lib/types";

export function MemberDetailClient({
  member,
  referrals,
}: {
  member: Membership;
  referrals: { referred_membership_id: string; created_at: string }[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(member.status);
  const [membershipId, setMembershipId] = useState(member.membership_id);
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const runStatus = (s: "Active" | "Suspended" | "Deleted") => {
    setError(null);
    startTransition(async () => {
      const res = await setMemberStatus(membershipId, s);
      if (res?.error) setError(res.error);
      else setStatus(s);
    });
  };

  const runResetPassword = () => {
    setError(null);
    setMsg(null);
    if (newPassword.length < 8) return setError("पासवर्ड कम से कम 8 अक्षर का हो");
    startTransition(async () => {
      const res = await resetMemberPassword(member.profile_id, newPassword);
      if (res?.error) setError(res.error);
      else {
        setMsg("पासवर्ड reset हो गया ✓");
        setNewPassword("");
      }
    });
  };

  const runRegenerateId = () => {
    if (!confirm("Membership ID दोबारा generate करें? यह action undo नहीं हो सकता।")) return;
    startTransition(async () => {
      const res = await regenerateMembershipId(membershipId);
      if (res?.error) setError(res.error);
      else if (res?.newId) {
        setMembershipId(res.newId);
        setMsg(`नया Membership ID: ${res.newId}`);
        router.refresh();
      }
    });
  };

  const statusTone = status === "Active" ? "success" : status === "Suspended" ? "warning" : "danger";

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-8">
      <div className="mb-5 flex items-center gap-4">
        <Avatar name={member.full_name} photo={member.photo_base64} size={64} />
        <div>
          <div className="text-xl font-black text-heading">{member.full_name}</div>
          <div className="flex items-center gap-2 text-sm text-navy font-bold">
            {membershipId} <Badge tone={statusTone}>{status}</Badge>
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
            <Row label="मोबाइल" value={member.phone} />
            <Row label="ईमेल" value={member.email} />
            <Row label="पता" value={`${member.address} — ${member.pincode}`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>निर्वाचन विवरण</CardTitle></CardHeader>
          <CardContent className="grid gap-1.5 text-[13px]">
            <Row label="जिला" value={member.districts?.name_hi || "—"} />
            <Row label="विधानसभा" value={member.assemblies?.name_hi || "—"} />
            <Row label="मंडल" value={member.mandals?.name_hi || "—"} />
            <Row label="बूथ" value={member.booth} />
            <Row label="पंजीकरण तिथि" value={formatDate(member.joined_at)} />
            <Row label="Referral Code" value={member.referral_code} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Member Actions</CardTitle></CardHeader>
          <CardContent className="grid gap-2.5">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={status === "Active" ? "outline" : "secondary"} disabled={pending} onClick={() => runStatus("Active")}>Activate</Button>
              <Button size="sm" variant={status === "Suspended" ? "outline" : "ghost"} disabled={pending} onClick={() => runStatus("Suspended")}>Suspend</Button>
              <Button size="sm" variant="danger" disabled={pending} onClick={() => runStatus("Deleted")}>Soft Delete</Button>
              <Button size="sm" variant="navy" disabled={pending} onClick={runRegenerateId}>Regenerate ID</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Reset Member Password</CardTitle></CardHeader>
          <CardContent className="grid gap-2.5">
            <Input type="password" placeholder="नया पासवर्ड (कम से कम 8 अक्षर)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Button size="sm" onClick={runResetPassword} disabled={pending}>Reset Password</Button>
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
