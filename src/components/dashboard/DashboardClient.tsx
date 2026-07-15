"use client";

import { useRef, useState, useTransition } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { MembershipCard } from "@/components/id-card/MembershipCard";
import { DownloadCardButtons } from "@/components/id-card/DownloadCardButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { updatePassword } from "@/app/actions/auth";
import { formatDate } from "@/lib/utils";
import type { Membership } from "@/lib/types";

export function DashboardClient({
  membership,
  referralCount,
  signatoryName,
  signatoryTitleHi,
}: {
  membership: Membership;
  referralCount: number;
  signatoryName: string;
  signatoryTitleHi: string;
}) {
  const { d } = useLang();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState("card");
  const [siteUrl, setSiteUrl] = useState("");

  useState(() => {
    if (typeof window !== "undefined") setSiteUrl(window.location.origin);
  });

  const cardData = {
    membershipId: membership.membership_id,
    fullName: membership.full_name,
    dob: formatDate(membership.dob),
    mandalNameHi: membership.mandals?.name_hi || "—",
    districtNameHi: membership.districts?.name_hi || "—",
    photoBase64: membership.photo_base64,
    joinedAt: formatDate(membership.joined_at),
    status: membership.status,
    signatoryName,
    signatoryTitleHi,
    verifyBaseUrl: `${siteUrl}/verify`,
  };

  const referralLink = `${siteUrl}/register?ref=${membership.referral_code}`;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <div className="text-2xl font-black text-heading">{d.dashboard.welcome}, {membership.full_name}</div>
          <div className="text-[12.5px] text-muted">{membership.membership_id}</div>
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

      {tab === "card" && (
        <div className="text-center">
          <MembershipCard data={cardData} ref={cardRef} />
          <div className="mt-7">
            <DownloadCardButtons cardRef={cardRef} fileName={membership.membership_id} labels={{ png: d.dashboard.downloadPng, pdf: d.dashboard.downloadPdf }} />
          </div>
        </div>
      )}

      {tab === "referral" && (
        <div className="mx-auto grid max-w-[600px] gap-4">
          <Card>
            <CardContent className="text-center">
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-muted">{d.dashboard.referralCode}</div>
              <div className="mt-1 text-3xl font-black text-primary-dark">{membership.referral_code}</div>
              <div className="mt-5 text-[11px] font-extrabold uppercase tracking-wide text-muted">{d.dashboard.referralLink}</div>
              <div className="mt-2 flex gap-2">
                <Input readOnly value={referralLink} className="text-xs" />
                <Button
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(referralLink)}
                >
                  {d.dashboard.copyLink}
                </Button>
              </div>
              <div className="mt-6 flex justify-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold hover:-translate-y-0.5 transition-transform"
                >
                  🟢 WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold hover:-translate-y-0.5 transition-transform"
                >
                  🔵 Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold hover:-translate-y-0.5 transition-transform"
                >
                  ⚫ X
                </a>
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

      {tab === "profile" && <ProfilePanel membership={membership} />}
    </div>
  );
}

function ProfilePanel({ membership }: { membership: Membership }) {
  const { d } = useLang();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    if (password !== confirm) return setError("पासवर्ड मेल नहीं खाते");
    if (password.length < 8) return setError("पासवर्ड कम से कम 8 अक्षर का हो");
    startTransition(async () => {
      const res = await updatePassword(password);
      if (res?.error) setError(res.error);
      else {
        setMsg("पासवर्ड सफलतापूर्वक बदल दिया गया ✓");
        setPassword("");
        setConfirm("");
      }
    });
  };

  return (
    <div className="mx-auto grid max-w-[560px] gap-4">
      <Card>
        <CardContent className="grid gap-2 text-sm">
          <Row label="नाम" value={membership.full_name} />
          <Row label="पिता/पति का नाम" value={membership.father_name} />
          <Row label="मोबाइल" value={membership.phone} />
          <Row label="ईमेल" value={membership.email} />
          <Row label="जिला" value={membership.districts?.name_hi || "—"} />
          <Row label="विधानसभा" value={membership.assemblies?.name_hi || "—"} />
          <Row label="मंडल" value={membership.mandals?.name_hi || "—"} />
          <Row label="बूथ" value={membership.booth} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="mb-3 font-black text-heading">{d.dashboard.changePassword}</div>
          {error && <div className="mb-3 rounded-xl border border-danger/30 bg-red-50 px-3 py-2 text-xs font-bold text-danger">{error}</div>}
          {msg && <div className="mb-3 rounded-xl border border-secondary/30 bg-secondary-light px-3 py-2 text-xs font-bold text-secondary-dark">{msg}</div>}
          <form onSubmit={changePassword} className="grid gap-3">
            <div>
              <Label required>नया पासवर्ड</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <Label required>पुष्टि करें</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" disabled={pending}>{pending ? "…" : "अपडेट करें"}</Button>
          </form>
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
