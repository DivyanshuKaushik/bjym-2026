export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://joinbjymcg2026.com";

export const SITE_CONFIG = {
  name: "BJYM Chhattisgarh Membership Portal",
  shortName: "BJYM Chhattisgarh",
  title: "BJYM Chhattisgarh Membership Portal | Join Bharatiya Janata Yuva Morcha",
  description:
    "Join the Bharatiya Janata Yuva Morcha, Chhattisgarh and become a part of India's youth movement. Register online, generate your digital membership card, and contribute towards nation building.",
  descriptionHi: "भारतीय जनता युवा मोर्चा, छत्तीसगढ़ की आधिकारिक डिजिटल सदस्यता पोर्टल",
  url: SITE_URL,
  ogImage: `${SITE_URL}/icons/og-image.png`,
  logo: `${SITE_URL}/brand/logo.png`,
  keywords: [
    "BJYM",
    "BJYM Chhattisgarh",
    "Bharatiya Janata Yuva Morcha",
    "BJP Membership",
    "BJYM Membership",
    "Join BJYM",
    "Chhattisgarh BJP",
    "Youth Membership",
    "Political Membership",
    "Digital Membership Card",
    "BJYM Registration",
    "BJYM Portal",
    "Join BJP Youth Wing",
  ],
  locale: "hi_IN",
  themeColor: "#F36B21",
  backgroundColor: "#FAF8F4",
} as const;
