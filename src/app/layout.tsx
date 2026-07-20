import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SiteHeader } from "@/components/common/SiteHeader";
import { Footer } from "@/components/common/Footer";
import { TricolorStrip } from "@/components/common/TricolorStrip";
import { SITE_CONFIG, SITE_URL } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_CONFIG.title, template: `%s | ${SITE_CONFIG.shortName}` },
  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],
  authors: [{ name: SITE_CONFIG.shortName }],
  creator: SITE_CONFIG.shortName,
  publisher: SITE_CONFIG.shortName,
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_URL,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630, alt: SITE_CONFIG.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_CONFIG.shortName,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: SITE_CONFIG.themeColor,
  viewportFit: "cover",
};

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_CONFIG.name,
        alternateName: "भारतीय जनता युवा मोर्चा, छत्तीसगढ़",
        url: SITE_URL,
        logo: SITE_CONFIG.logo,
        image: SITE_CONFIG.ogImage,
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          areaServed: "IN",
          availableLanguage: ["Hindi", "English"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_CONFIG.name,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "hi-IN",
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: SITE_CONFIG.title,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "hi-IN",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }],
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body className="min-h-screen bg-bg text-heading antialiased">
        <JsonLd />
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
