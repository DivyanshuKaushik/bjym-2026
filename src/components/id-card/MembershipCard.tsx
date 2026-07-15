import React from "react";
import { Chakra } from "@/components/common/Chakra";
import { Avatar } from "@/components/common/Avatar";
import { QRCodeImg } from "./QRCode";

export type IDCardData = {
  membershipId: string;
  fullName: string;
  dob: string;
  mandalNameHi: string;
  districtNameHi: string;
  photoBase64?: string | null;
  joinedAt: string;
  status: string;
  signatoryName: string;
  signatoryTitleHi: string;
  verifyBaseUrl: string;
};

/**
 * Membership ID card — always rendered in Hindi regardless of the
 * portal's active display language, per the "idCard.language: Hindi" rule.
 */
export const MembershipCard = React.forwardRef<HTMLDivElement, { data: IDCardData; compact?: boolean }>(
  ({ data, compact = false }, ref) => {
    const scale = compact ? 0.88 : 1;
    const verifyUrl = `${data.verifyBaseUrl}?id=${encodeURIComponent(data.membershipId)}`;

    return (
      <div
        ref={ref}
        style={{
          width: 372 * scale,
          borderRadius: 22,
          overflow: "hidden",
          background: "linear-gradient(155deg, #FFFFFF 50%, #FFF0E4 100%)",
          boxShadow: "0 30px 70px rgba(13,18,32,.35), 0 0 0 1px rgba(243,107,33,.18)",
          position: "relative",
          textAlign: "left",
          fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            height: 8,
            background: "linear-gradient(90deg, #F36B21, #FFD08A, #fff, #9BE8C0, #1F6B3B, #F36B21)",
            backgroundSize: "200% 100%",
          }}
        />
        <div
          style={{
            background: "linear-gradient(135deg, #0D1220 0%, #1E2740 100%)",
            padding: "13px 18px",
            display: "flex",
            alignItems: "center",
            gap: 11,
            color: "#fff",
          }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%", background: "#fff", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#D85A0B", fontWeight: 900, fontSize: 16, border: "2px solid #F36B21",
            }}
          >
            भा
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontWeight: 900, fontSize: 15.5, letterSpacing: 0.3 }}>भारतीय जनता युवा मोर्चा</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#FF8A3D", letterSpacing: 2.4, textTransform: "uppercase", marginTop: 1 }}>
              छत्तीसगढ़ · पहचान पत्र
            </div>
          </div>
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.94)", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Chakra size={27} color="#161A8D" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, padding: "15px 18px 10px", position: "relative" }}>
          <div style={{ position: "absolute", right: -28, bottom: -34, pointerEvents: "none" }}>
            <Chakra size={150} color="#F36B21" opacity={0.07} />
          </div>
          <div style={{ textAlign: "center" }}>
            <Avatar name={data.fullName} photo={data.photoBase64} size={88} ring="#F36B21" square />
            <div
              style={{
                marginTop: 8, fontSize: 9.5, fontWeight: 900, color: "#14532D",
                background: "#EAF7EF", border: "1px solid rgba(31,107,59,.3)",
                padding: "4px 9px", borderRadius: 20, letterSpacing: 0.7,
              }}
            >
              {data.status === "Active" ? "● ACTIVE MEMBER" : data.status.toUpperCase()}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 12 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: "#6B7280", letterSpacing: 1.4, textTransform: "uppercase" }}>
              सदस्यता क्रमांक
            </div>
            <div
              style={{
                fontWeight: 900, fontSize: 14, letterSpacing: 0.5,
                background: "linear-gradient(90deg, #D85A0B, #161A8D)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
            >
              {data.membershipId}
            </div>
            <div style={{ marginTop: 7, display: "grid", gap: 3.5 }}>
              <div><span style={{ color: "#6B7280", fontSize: 10.5, fontWeight: 700 }}>नाम:</span> <b style={{ color: "#1F2937" }}>{data.fullName}</b></div>
              <div><span style={{ color: "#6B7280", fontSize: 10.5, fontWeight: 700 }}>जन्मतिथि:</span> {data.dob}</div>
              <div><span style={{ color: "#6B7280", fontSize: 10.5, fontWeight: 700 }}>मंडल:</span> {data.mandalNameHi}</div>
              <div><span style={{ color: "#6B7280", fontSize: 10.5, fontWeight: 700 }}>जिला:</span> {data.districtNameHi}</div>
            </div>
          </div>
          <div style={{ alignSelf: "flex-start", textAlign: "center" }}>
            <div style={{ padding: 5, background: "#fff", borderRadius: 10, boxShadow: "0 4px 14px rgba(13,18,32,.12)" }}>
              <QRCodeImg value={verifyUrl} size={58} />
            </div>
            <div style={{ fontSize: 7.5, color: "#6B7280", fontWeight: 800, marginTop: 4, letterSpacing: 0.8 }}>SCAN TO VERIFY</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "4px 20px 12px" }}>
          <div style={{ fontSize: 9.5, color: "#6B7280" }}>
            सदस्यता तिथि: <b style={{ color: "#1F2937" }}>{data.joinedAt}</b>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 15, color: "#1F2937", transform: "rotate(-3deg)", lineHeight: 1 }}>
              {data.signatoryName}
            </div>
            <div style={{ width: 100, borderTop: "1.5px solid #1F2937", marginTop: 2 }} />
            <div style={{ fontSize: 9, fontWeight: 800, color: "#1F2937" }}>{data.signatoryTitleHi}</div>
          </div>
        </div>
        <div style={{ height: 7, display: "flex" }}>
          <div style={{ flex: 1, background: "#F36B21" }} />
          <div style={{ flex: 1, background: "#fff" }} />
          <div style={{ flex: 1, background: "#1F6B3B" }} />
        </div>
      </div>
    );
  }
);
MembershipCard.displayName = "MembershipCard";
