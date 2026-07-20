import React from "react";
import { QRCodeImg } from "./QRCode";

export type IDCardData = {
  membershipId: string;
  fullName: string;
  dob: string;
  districtNameHi: string;
  mandalNameHi: string;
  photoBase64?: string | null;
  signatoryName: string;
  signatoryTitleHi: string;
  portalWebsite: string;
  verifyBaseUrl: string;
};

const C = {
  saffron: "#F36B21",
  saffronDark: "#D85A0B",
  green: "#1F6B3B",
  greenDark: "#14532D",
  ink: "#1F2937",
  muted: "#6B7280",
};

/** Membership IDs grow unbounded past 999999 (BJYM-CG-2026-1000000, etc).
 *  Rather than truncate an identifier people need to read/verify, shrink
 *  the font a little as it gets longer so it always fits on one line. */
function membershipIdFontSize(id: string) {
  if (id.length <= 20) return 13;
  if (id.length <= 23) return 11.5;
  if (id.length <= 26) return 10;
  return 9;
}

function InfoIcon({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`,
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
      }}
    >
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, valueFontSize }: { icon: React.ReactNode; label: string; value: string; valueFontSize?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <InfoIcon>{icon}</InfoIcon>
      <div style={{ minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: C.muted }}>{label} : </span>
        <span
          title={value}
          style={{
            fontSize: valueFontSize ?? 13, fontWeight: 800, color: C.ink,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/**
 * Official BJYM Chhattisgarh digital membership ID card. Always Hindi
 * (per spec), QR bottom-left, fixed pixel dimensions so nothing wraps or
 * overflows regardless of the data — long names/districts truncate with
 * an ellipsis (full value is still in the `title` attribute).
 */
export const MembershipCard = React.forwardRef<HTMLDivElement, { data: IDCardData; scale?: number }>(
  ({ data, scale = 1 }, ref) => {
    const W = 380;
    const H = 580;

    return (
      <div
        ref={ref}
        style={{
          width: W * scale,
          height: H * scale,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: "top left",
          position: "relative",
          overflow: "hidden",
          borderRadius: 20,
          background: "linear-gradient(160deg, #FFF8F0 0%, #FFFFFF 55%, #F3FBF6 100%)",
          boxShadow: "0 24px 60px rgba(31,41,55,.28), 0 0 0 1px rgba(243,107,33,.15)",
          fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif",
        }}
      >
        {/* diagonal tricolor corner accent */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, width: 150, height: 150,
            background: `linear-gradient(135deg, ${C.saffron} 0%, ${C.saffron} 45%, ${C.green} 100%)`,
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute", inset: 0, border: `3px solid ${C.saffron}`,
            borderRadius: 20, pointerEvents: "none",
          }}
        />

        {/* content */}
        <div style={{ position: "relative", padding: "18px 18px 0", textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="BJP + BJYM" style={{ height: 46, margin: "0 auto", display: "block", objectFit: "contain" }} />

          <div
            style={{
              marginTop: 10, fontSize: 17, fontWeight: 900, color: C.saffronDark,
              lineHeight: 1.2, padding: "0 8px",
            }}
          >
            भारतीय जनता युवा मोर्चा, छत्तीसगढ़
          </div>

          <div
            style={{
              display: "inline-block", marginTop: 9, padding: "5px 22px",
              background: `linear-gradient(90deg, ${C.green}, ${C.greenDark})`,
              color: "#fff", fontSize: 11.5, fontWeight: 900, letterSpacing: 0.4,
              clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0 100%)",
            }}
          >
            डिजिटल सदस्यता कार्ड 2026
          </div>

          {/* photo */}
          <div
            style={{
              margin: "16px auto 0", width: 118, height: 140, borderRadius: 12,
              background: "#fff", padding: 3,
              backgroundImage: "linear-gradient(#fff,#fff), linear-gradient(135deg, " + C.saffron + ", " + C.green + ")",
              backgroundOrigin: "border-box", backgroundClip: "content-box, border-box",
              border: "3px solid transparent",
            }}
          >
            {data.photoBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photoBase64} alt={data.fullName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
            ) : (
              <div style={{ width: "100%", height: "100%", borderRadius: 8, background: "#E9E9EC", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
                <svg width="72" height="90" viewBox="0 0 72 90"><circle cx="36" cy="30" r="20" fill="#C9C9CE" /><path d="M0 90 C0 60 16 50 36 50 C56 50 72 60 72 90 Z" fill="#C9C9CE" /></svg>
              </div>
            )}
          </div>
        </div>

        {/* info rows */}
        <div style={{ position: "relative", padding: "16px 22px 0", display: "flex", flexDirection: "column", gap: 9, alignItems: "start", justifyContent: "start" }}>
          <InfoRow
            label="सदस्यता क्रमांक"
            value={data.membershipId}
            valueFontSize={membershipIdFontSize(data.membershipId)}
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>}
          />
          <InfoRow
            label="नाम / Name"
            value={data.fullName}
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>}
          />
          <InfoRow
            label="जन्मतिथि"
            value={data.dob}
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></svg>}
          />
          <InfoRow
            label="जिला"
            value={data.districtNameHi}
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>}
          />
          <InfoRow
            label="मंडल"
            value={data.mandalNameHi}
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="8" r="3" /><circle cx="17" cy="8" r="3" /><path d="M2 21c0-3.3 3-6 7-6s7 2.7 7 6M13 21c0-2.2 1.8-4 4-4s4 1.8 4 4" /></svg>}
          />
        </div>

        {/* footer: QR bottom-left, signature bottom-right */}
        <div style={{ position: "absolute", left: 16, bottom: 20, textAlign: "center" }}>
          <div style={{ padding: 4, background: "#fff", borderRadius: 8, boxShadow: "0 3px 10px rgba(31,41,55,.15)" }}>
            <QRCodeImg value={data.verifyBaseUrl + "?id=" + encodeURIComponent(data.membershipId)} size={52} />
          </div>
        </div>

        <div style={{ position: "absolute", right: 16, bottom: 20, textAlign: "center", width: 160 }}>
          <div style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 15, color: C.ink, transform: "rotate(-3deg)" }}>
            {data.signatoryName}
          </div>
          <div style={{ borderTop: "1.5px solid " + C.ink, marginTop: 2 }} />
          <div style={{ fontSize: 8.5, fontWeight: 800, color: C.ink, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {data.signatoryTitleHi}
          </div>
        </div>

        <div
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center",
            fontSize: 9, fontWeight: 700, color: "#fff", padding: "3px 0",
            background: "linear-gradient(90deg, " + C.saffron + ", " + C.green + ")",
          }}
        >
          {data.portalWebsite}
        </div>
      </div>
    );
  }
);
MembershipCard.displayName = "MembershipCard";
