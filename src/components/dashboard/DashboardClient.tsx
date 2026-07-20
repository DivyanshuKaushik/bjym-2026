"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { MembershipCard } from "@/components/id-card/MembershipCard";
import { DownloadCardButtons } from "@/components/id-card/DownloadCardButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { changeMpin, recordIdCardDownload } from "@/app/actions/member";
import { logoutEverywhere } from "@/app/actions/logout";
import { formatDate, formatDateNumeric } from "@/lib/utils";
import type { MemberRow } from "@/lib/repositories/member.repository";

export function DashboardClient({
  member, referralCount, signatoryName, signatoryTitleHi, portalWebsite,
}: {
  member: MemberRow;
  referralCount: number;
  signatoryName: string;
  signatoryTitleHi: string;
  portalWebsite: string;
}) {
  const { d } = useLang();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState("card");
  const [siteUrl, setSiteUrl] = useState("");

  useEffect(() => { setSiteUrl(window.location.origin); }, []);

  const cardData = {
    membershipId: member.membership_id,
    fullName: member.full_name,
    dob: formatDateNumeric(member.dob),
    districtNameHi: member.district_name_hi,
    mandalNameHi: member.mandal_name_hi,
    photoBase64: member.photo_base64,
    signatoryName,
    signatoryTitleHi,
    portalWebsite,
    verifyBaseUrl: `${siteUrl}/verify`,
  };

  const referralLink = `${siteUrl}/register?ref=${member.referral_code}`;

  const verificationTone = member.verification_status === "Verified" ? "success" : member.verification_status === "Rejected" ? "danger" : "warning";

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <div className="text-2xl font-black text-heading">{d.dashboard.welcome}, {member.full_name}</div>
          <div className="flex items-center gap-2 text-[12.5px] text-muted">
            {member.membership_id} <Badge tone={verificationTone}>{member.verification_status}</Badge>
          </div>
        </div>
        <div className="ml-auto">
          <Tabs
            tabs={[
              { key: "card", label: d.dashboard.yourCard },
              { key: "referral", label: d.dashboard.referral },
              { key: "profile", label: d.dashboard.profile },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
      </div>

      {member.verification_status === "Pending" && (
        <div className="mb-6 rounded-2xl border border-warning/30 bg-amber-50 px-5 py-3 text-[13px] font-bold text-amber-800">
          आपका फोटो एवं विवरण सत्यापन के लिए लंबित है। सत्यापन पूर्ण होने तक ID Card अस्थायी मान्य है।
        </div>
      )}
      {member.verification_status === "Rejected" && (
        <div className="mb-6 rounded-2xl border border-danger/30 bg-red-50 px-5 py-3 text-[13px] font-bold text-danger">
          आपका आवेदन अस्वीकृत हुआ है। कारण: {member.rejection_reason || "—"}
        </div>
      )}

      {tab === "card" && (
        <div className="text-center">
          <div className="mx-auto w-fit">
            <MembershipCard data={cardData} ref={cardRef} />
          </div>
          <div className="mt-7">
            <DownloadCardButtons
              cardRef={cardRef}
              fileName={member.membership_id}
              labels={{ png: d.dashboard.downloadPng, pdf: d.dashboard.downloadPdf }}
              onDownloaded={() => recordIdCardDownload()}
            />
          </div>
        </div>
      )}

      {tab === "referral" && (
        <div className="mx-auto grid max-w-[600px] gap-4">
          <Card>
            <CardContent className="text-center">
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-muted">{d.dashboard.referralCode}</div>
              <div className="mt-1 text-3xl font-black text-primary-dark">{member.referral_code}</div>
              <div className="mt-5 text-[11px] font-extrabold uppercase tracking-wide text-muted">{d.dashboard.referralLink}</div>
              <div className="mt-2 flex gap-2">
                <Input readOnly value={referralLink} className="text-xs" />
                <Button variant="ghost" onClick={() => navigator.clipboard.writeText(referralLink)}>{d.dashboard.copyLink}</Button>
              </div>
              <div className="mt-6 flex justify-center gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(referralLink)}`} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5">🟢 WhatsApp</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5">🔵 Facebook</a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(referralLink)}`} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5">⚫ X</a>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm font-bold text-heading">{d.dashboard.totalReferrals}</span>
              <span className="text-2xl font-black text-secondary-dark">{referralCount}</span>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "profile" && <ProfilePanel member={member} />}
    </div>
  );
}

function ProfilePanel({ member }: { member: MemberRow }) {
  const { d } = useLang();
  const [currentMpin, setCurrentMpin] = useState("");
  const [newMpin, setNewMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submitMpin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await changeMpin({ currentMpin, newMpin, confirmMpin });
      if (res?.error) setError(res.error);
      // success redirects to /dashboard automatically
    });
  };

  const doLogoutEverywhere = () => {
    if (!confirm("सभी devices से logout करें?")) return;
    startTransition(async () => { await logoutEverywhere(); });
  };

  return (
    <div className="mx-auto grid max-w-[560px] gap-4">
      <Card>
        <CardContent className="grid gap-2 text-sm">
          <Row label="नाम" value={member.full_name} />
          <Row label="पिता/पति का नाम" value={member.father_name} />
          <Row label="मोबाइल" value={member.mobile} />
          <Row label="WhatsApp" value={member.whatsapp} />
          <Row label="ईमेल" value={member.email} />
          <Row label="वर्ग" value={member.category} />
          <Row label="जाति" value={member.jaati} />
          <Row label="लोकसभा" value={member.loksabha_name_hi || "—"} />
          <Row label="जिला" value={member.district_name_hi} />
          <Row label="विधानसभा" value={member.assembly_name_hi} />
          <Row label="मंडल" value={member.mandal_name_hi} />
          <Row label="बूथ" value={member.booth || "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="mb-3 font-black text-heading">MPIN बदलें</div>
          {error && <div className="mb-3 rounded-xl border border-danger/30 bg-red-50 px-3 py-2 text-xs font-bold text-danger">{error}</div>}
          <form onSubmit={submitMpin} className="grid gap-3">
            <div>
              <Label required>वर्तमान MPIN</Label>
              <Input type="password" inputMode="numeric" maxLength={6} value={currentMpin} onChange={(e) => setCurrentMpin(e.target.value.replace(/\D/g, ""))} required />
            </div>
            <div>
              <Label required>नया MPIN (4 या 6 अंक)</Label>
              <Input type="password" inputMode="numeric" maxLength={6} value={newMpin} onChange={(e) => setNewMpin(e.target.value.replace(/\D/g, ""))} required />
            </div>
            <div>
              <Label required>नया MPIN पुष्टि करें</Label>
              <Input type="password" inputMode="numeric" maxLength={6} value={confirmMpin} onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, ""))} required />
            </div>
            <Button type="submit" disabled={pending}>{pending ? "…" : "MPIN अपडेट करें"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="mb-2 font-black text-heading">Logout Everywhere</div>
          <p className="mb-3 text-xs text-muted">यह सभी devices से आपका session समाप्त कर देगा — दोबारा login करना होगा।</p>
          <Button variant="danger" size="sm" onClick={doLogoutEverywhere} disabled={pending}>सभी Devices से Logout करें</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-bold text-heading">{value}</span>
    </div>
  );
}
