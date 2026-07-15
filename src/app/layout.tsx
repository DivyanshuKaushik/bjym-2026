import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SiteHeader } from "@/components/common/SiteHeader";
import { Footer } from "@/components/common/Footer";
import { TricolorStrip } from "@/components/common/TricolorStrip";

export const metadata: Metadata = {
  title: "BJYM Chhattisgarh — Digital Membership Portal",
  description: "भारतीय जनता युवा मोर्चा, छत्तीसगढ़ की आधिकारिक डिजिटल सदस्यता पोर्टल",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body className="min-h-screen bg-bg text-heading antialiased">
        <QueryProvider>
          <LanguageProvider>
            <TricolorStrip />
            <SiteHeader />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
