import React from "react";
import { QRCodeImg } from "./QRCode";
import { Calendar, IdCard, Landmark, MapPin, User } from "lucide-react";

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
function valueFontSizeFor(text: string, base = 14.5) {
    if (text.length <= 18) return base;
    if (text.length <= 24) return base - 1.5;
    if (text.length <= 30) return base - 3;
    return base - 4.5;
}

function InfoRow({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "start",
                gap: 2,
                minWidth: 0,
            }}
        >
          {/* <div className="absolute left-0 flex h-6 w-6 roundeditems-center justify-center text-[13px] text-primary-dark"> */}

            {/* {icon} */}
          {/* </div> */}
            <span
                style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: C.saffronDark,
                    flexShrink: 0,
                    width: 128,
                    whiteSpace: "nowrap",
                    // overflow: "hidden",
                    // textOverflow: "ellipsis",
                    textAlign: "left",
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: C.ink,
                    flexShrink: 0,
                }}
            >
                :
            </span>
            <span
                title={value}
                className="capitalize ml-0.5"
                style={{
                    fontSize: valueFontSizeFor(value),
                    fontWeight: 900,
                    color: C.ink,
                    whiteSpace: "nowrap",
                    // overflow: "hidden",
                    // textOverflow: "ellipsis",
                    minWidth: 0,
                    flex: 1,

                }}
            >
                {value}
            </span>
        </div>
    );
}

/**
 * Official BJYM Chhattisgarh digital membership ID card — built directly
 * on top of the official background artwork (public/brand/id-card-bg.jpg,
 * matches the provided template/sample exactly, including the printed
 * signature block, which is baked into that background image and is NOT
 * re-rendered here). Only the per-member data — logo/heading, photo, the
 * five detail rows, and the QR — are overlaid on top.
 */
export const MembershipCard = React.forwardRef<
    HTMLDivElement,
    { data: IDCardData }
>(({ data }, ref) => {
    const W = 400;
    const H = 630;

    return (
        <div
            ref={ref}
            style={{
                width: W,
                height: H,
                position: "relative",
                overflow: "hidden",
                borderRadius: 22,
                backgroundImage: "url(/brand/id-card-bg.jpg)",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
                boxShadow: "0 24px 60px rgba(31,41,55,.25)",
                fontFamily:
                    "var(--font-anek), 'Noto Sans Devanagari', system-ui, sans-serif",
            }}
        >
            {/* header: logo + stacked gradient heading (background artwork is blank here) */}
            <div style={{ textAlign: "center", padding: "2px 20px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/brand/logo.png"
                    alt="BJP + BJYM"
                    style={{
                        height: 60,
                        margin: "0 auto",
                        display: "block",
                        objectFit: "contain",
                    }}
                />

                <div
                    style={{
                        fontSize: 30,
                        fontWeight: 900,
                        textShadow: "0 1px 2px rgba(31,41,55,.15)",
                        background: `linear-gradient(90deg, ${C.saffron}, ${C.saffronDark})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    भारतीय जनता युवा मोर्चा
                </div>
                <div
                    style={{
                        fontSize: 24,
                        fontWeight: 900,
                        marginTop: -4,
                        textShadow: "0 1px 2px rgba(31,41,55,.15)",
                        background: `linear-gradient(90deg, ${C.saffronDark}, ${C.saffron})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    छत्तीसगढ़
                </div>

                <div
                    style={{
                        display: "flex",
                        paddingLeft: 20,
                        paddingRight: 20,
                        paddingTop: 6,
                        borderRadius: 999,
                        background: "#1F930D",
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: 900,
                        letterSpacing: 0.3,
                        boxShadow: "0 4px 12px rgba(31,107,59,.3)",
                        width: "fit-content",
                        margin: "auto auto 0",
                        textTransform: "uppercase",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    डिजिटल सदस्यता कार्ड 2026
                </div>
            </div>

            {/* photo — bordered, matching the sample. overflow:hidden here
                is what guarantees the photo can never visually exceed the
                border, regardless of the source image's own aspect ratio. */}
            <div style={{ textAlign: "center", marginTop: 14 }}>
                <div
                    style={{
                        display: "inline-block",
                        width: 150,
                        height: 176,
                        borderRadius: 12,
                        border: `4px solid ${C.saffron}`,
                        padding: 3,
                        background: "#fff",
                        boxShadow: "0 4px 14px rgba(31,41,55,.12)",
                        overflow: "hidden",
                    }}
                >
                    {data.photoBase64 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={data.photoBase64}
                            alt={data.fullName}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 8,
                                display: "block",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 8,
                                background: "#F2F1EC",
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}
                        >
                            <svg width="88" height="110" viewBox="0 0 72 90">
                                <circle cx="36" cy="30" r="20" fill="#C9C9CE" />
                                <path
                                    d="M0 90 C0 60 16 50 36 50 C56 50 72 60 72 90 Z"
                                    fill="#C9C9CE"
                                />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* info rows */}
            <div
                style={{
                    padding: "1px 20px 0",
                    display: "grid",
                    gap: 4,
                    placeItems: "start",
                }}
            >
                <InfoRow
                    label="सदस्यता क्रमांक"
                    value={data.membershipId}
                    icon={
                        <IdCard
                            size={14}
                            className="shrink-0 text-primary-dark"
                        />
                    }
                />
                <InfoRow
                    label="नाम / Name"
                    value={data.fullName}
                    icon={
                        <User
                            size={14}
                            className="shrink-0 text-primary-dark"
                        />
                    }
                />
                <InfoRow
                    label="जन्मतिथि"
                    value={data.dob}
                    icon={
                        <Calendar
                            size={14}
                            className="shrink-0 text-primary-dark"
                        />
                    }
                />
                <InfoRow
                    label="जिला"
                    value={data.districtNameHi}
                    icon={
                        <MapPin
                            size={14}
                            className="shrink-0 text-primary-dark"
                        />
                    }
                />
                <InfoRow
                    label="मंडल"
                    value={data.mandalNameHi}
                    icon={
                        <Landmark
                            size={14}
                            className="shrink-0 text-primary-dark"
                        />
                    }
                />
            </div>

            {/* QR — bottom-left per spec, bordered to match the photo. The
            signature block on the right is part of the background image
            itself, so only the QR is overlaid here. */}
            <div style={{ position: "absolute", left: 22, bottom: 40 }}>
                <div
                    style={{
                        padding: 4,
                        background: "#fff",
                        borderRadius: 10,
                        border: `3px solid ${C.saffron}`,
                        boxShadow: "0 3px 10px rgba(31,41,55,.15)",
                        overflow: "hidden",
                    }}
                >
                    <QRCodeImg
                        value={`${data.verifyBaseUrl}?id=${encodeURIComponent(data.membershipId)}`}
                        size={58}
                    />
                </div>
            </div>

            {/* website URL — overlaid on the gradient bar that's already part
            of the background artwork */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#fff",
                    padding: 2,
                }}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" />
                </svg>
                {data.portalWebsite}
            </div>
        </div>
    );
});
MembershipCard.displayName = "MembershipCard";
