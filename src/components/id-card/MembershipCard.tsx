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
function valueFontSizeFor(text: string, base = 15) {
  if (text.length <= 18) return base;
  if (text.length <= 24) return base - 1.5;
  if (text.length <= 30) return base - 3;
  return base - 4.5;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 14, fontWeight: 900, color: C.saffronDark, flexShrink: 0, minWidth: 96 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, flexShrink: 0 }}>:</span>
      <span
        title={value}
        style={{
          fontSize: valueFontSizeFor(value), fontWeight: 800, color: C.ink,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, flex: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Official BJYM Chhattisgarh digital membership ID card — matches the
 * provided official template exactly: stacked gradient heading, rounded
 * green "डिजिटल सदस्यता कार्ड 2026" banner, centered photo with a
 * saffron→green gradient ring, label:value detail rows, a footer split
 * into QR (bottom-left, per spec) and signature block (bottom-right),
 * and a saffron→green gradient bottom bar with the portal URL. Always
 * Hindi. Fixed pixel dimensions with ellipsis-safe long values so
 * nothing ever overflows or wraps regardless of name/ID length.
 */
export const MembershipCard = React.forwardRef<HTMLDivElement, { data: IDCardData; scale?: number }>(
  ({ data, scale = 1 }, ref) => {
    const W = 400;
    const H = 620;

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
          borderRadius: 22,
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF9 60%, #FFF9F2 100%)",
          boxShadow: "0 24px 60px rgba(31,41,55,.25), 0 0 0 1px rgba(243,107,33,.12)",
          fontFamily: "var(--font-anek), 'Noto Sans Devanagari', system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header: logo + stacked gradient heading */}
        <div style={{ textAlign: "center", padding: "20px 20px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="BJP + BJYM" style={{ height: 48, margin: "0 auto", display: "block", objectFit: "contain" }} />

          <div
            style={{
              marginTop: 10, fontSize: 21, fontWeight: 900, lineHeight: 1.18,
              background: `linear-gradient(90deg, ${C.saffron}, ${C.saffronDark})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}
          >
            भारतीय जनता युवा मोर्चा
          </div>
          <div
            style={{
              fontSize: 21, fontWeight: 900, lineHeight: 1.18,
              background: `linear-gradient(90deg, ${C.saffronDark}, ${C.saffron})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}
          >
            छत्तीसगढ़
          </div>

          <div
            style={{
              display: "inline-block", marginTop: 10, padding: "6px 26px", borderRadius: 999,
              background: `linear-gradient(90deg, ${C.green}, ${C.greenDark})`,
              color: "#fff", fontSize: 12.5, fontWeight: 900, letterSpacing: 0.3,
              boxShadow: "0 4px 12px rgba(31,107,59,.3)",
            }}
          >
            डिजिटल सदस्यता कार्ड 2026
          </div>
        </div>

        {/* photo */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div
            style={{
              display: "inline-block", width: 132, height: 156, borderRadius: 14, padding: 4,
              background: `linear-gradient(150deg, ${C.saffron}, ${C.green})`,
            }}
          >
            {data.photoBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photoBase64} alt={data.fullName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10, display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", borderRadius: 10, background: "#F2F1EC", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
                <svg width="78" height="98" viewBox="0 0 72 90"><circle cx="36" cy="30" r="20" fill="#C9C9CE" /><path d="M0 90 C0 60 16 50 36 50 C56 50 72 60 72 90 Z" fill="#C9C9CE" /></svg>
              </div>
            )}
          </div>
        </div>

        {/* info rows */}
        <div style={{ padding: "18px 26px 0", display: "grid", gap: 11 }}>
          <InfoRow label="सदस्यता क्रमांक" value={data.membershipId} />
          <InfoRow label="नाम / Name" value={data.fullName} />
          <InfoRow label="जन्मतिथि" value={data.dob} />
          <InfoRow label="जिला" value={data.districtNameHi} />
          <InfoRow label="मंडल" value={data.mandalNameHi} />
        </div>

        <div style={{ flex: 1 }} />

        {/* divider */}
        <div style={{ margin: "10px 20px 0", borderTop: `1.5px solid ${C.saffron}33` }} />

        {/* footer: QR bottom-left (per spec), signature bottom-right */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "14px 20px 16px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: 5, background: "#fff", borderRadius: 10, border: `2px solid ${C.saffron}`, boxShadow: "0 3px 10px rgba(31,41,55,.12)" }}>
              <QRCodeImg value={`${data.verifyBaseUrl}?id=${encodeURIComponent(data.membershipId)}`} size={62} />
            </div>
          </div>

          <div style={{ textAlign: "center", maxWidth: 190 }}>
            <div
              style={{
                fontFamily: "'Brush Script MT', cursive", fontSize: 20, lineHeight: 1,
                background: `linear-gradient(90deg, ${C.saffronDark}, ${C.saffron})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                transform: "rotate(-2deg)",
              }}
            >
              {data.signatoryName}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: C.saffronDark, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {data.signatoryTitleHi}
            </div>
          </div>
        </div>

        {/* bottom gradient bar */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            fontSize: 13, fontWeight: 800, color: "#fff", padding: "9px 0",
            background: `linear-gradient(90deg, ${C.saffron}, ${C.green})`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" />
          </svg>
          {data.portalWebsite}
        </div>
      </div>
    );
  }
);
MembershipCard.displayName = "MembershipCard";
