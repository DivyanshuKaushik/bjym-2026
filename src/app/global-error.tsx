"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="hi">
      <body>
        <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 16px", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="BJYM Chhattisgarh" style={{ height: 56, width: "auto", objectFit: "contain", opacity: 0.9 }} />
          <div style={{ marginTop: 24, fontSize: 22, fontWeight: 900, color: "#1F2937" }}>कुछ गलत हो गया</div>
          <p style={{ marginTop: 8, maxWidth: 380, fontSize: 13.5, color: "#6B7280" }}>
            एक अप्रत्याशित त्रुटि हुई है। कृपया दोबारा कोशिश करें।
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 24, padding: "12px 26px", borderRadius: 999, fontWeight: 800, fontSize: 14,
              background: "linear-gradient(135deg, #FF8A3D, #D85A0B)", color: "#fff", border: "none", cursor: "pointer",
            }}
          >
            दोबारा कोशिश करें
          </button>
        </div>
      </body>
    </html>
  );
}
