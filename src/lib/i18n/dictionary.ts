export type Locale = "hi" | "en";

type Dict = {
  nav: { home: string; register: string; login: string; verify: string; admin: string; dashboard: string; logout: string };
  hero: {
    badge: string; title1: string; title2: string; subtitle: string; desc: string;
    ctaPrimary: string; ctaSecondary: string; statsMembers: string; statsDistricts: string; statsCard: string; statsCardVal: string; statsVerify: string;
  };
  steps: { badge: string; title: string; s1t: string; s1d: string; s2t: string; s2d: string; s3t: string; s3d: string };
  cta: { title: string; desc: string; button: string };
  register: {
    title: string; subtitle: string; step1: string; step2: string; step3: string; step4: string;
    fullName: string; fatherName: string; dob: string; gender: string; phone: string; email: string; address: string; pincode: string;
    district: string; assembly: string; mandal: string; booth: string;
    whatsapp: string; facebook: string; instagram: string; twitter: string; referralCode: string;
    password: string; confirmPassword: string; declaration: string; next: string; back: string; submit: string;
    male: string; female: string; other: string;
  };
  verify: { title: string; subtitle: string; placeholder: string; button: string; notFound: string; verified: string };
  dashboard: {
    welcome: string; yourCard: string; downloadPng: string; downloadPdf: string;
    referral: string; referralCode: string; referralLink: string; copyLink: string;
    totalReferrals: string; profile: string; changePassword: string;
  };
};

export const dictionary: Record<Locale, Dict> = {
  hi: {
    nav: { home: "होम", register: "सदस्य बनें", login: "लॉगिन", verify: "सत्यापन", admin: "Admin", dashboard: "डैशबोर्ड", logout: "लॉगआउट" },
    hero: {
      badge: "डिजिटल सदस्यता अभियान 2026",
      title1: "युवा शक्ति,",
      title2: "राष्ट्र की शक्ति",
      subtitle: "BJYM छत्तीसगढ़ से जुड़ें",
      desc: "भारतीय जनता युवा मोर्चा परिवार का हिस्सा बनें और भारत एवं छत्तीसगढ़ के नव-निर्माण में अपना योगदान दें।",
      ctaPrimary: "सदस्य बनें",
      ctaSecondary: "सदस्यता सत्यापित करें",
      statsMembers: "पंजीकृत सदस्य",
      statsDistricts: "जिले",
      statsCard: "ID Card",
      statsCardVal: "तुरंत",
      statsVerify: "सत्यापन",
    },
    steps: {
      badge: "सिर्फ 3 आसान चरण",
      title: "2 मिनट में सदस्य बनें",
      s1t: "Form भरें", s1d: "नाम, मोबाइल, फोटो और अपने बूथ की जानकारी के साथ पंजीकरण करें।",
      s2t: "ID Card पाएँ", s2d: "Unique सदस्यता क्रमांक और QR के साथ Digital ID Card तुरंत मिलेगा।",
      s3t: "Share करें", s3d: "अपना referral link दोस्तों के साथ share करके अभियान बढ़ाएँ।",
    },
    cta: { title: "आज ही जुड़ें — युवा शक्ति को राष्ट्र शक्ति बनाएँ", desc: "छत्तीसगढ़ के हर बूथ तक डिजिटल संगठन।", button: "अभी पंजीकरण करें" },
    register: {
      title: "सदस्यता पंजीकरण", subtitle: "Form submit करते ही आपका Digital ID Card तुरंत generate होगा",
      step1: "व्यक्तिगत विवरण", step2: "निर्वाचन विवरण", step3: "सोशल विवरण", step4: "पासवर्ड",
      fullName: "पूरा नाम", fatherName: "पिता / पति का नाम", dob: "जन्मतिथि", gender: "लिंग",
      phone: "मोबाइल नंबर", email: "ईमेल आईडी", address: "स्थायी पता", pincode: "पिनकोड",
      district: "जिला", assembly: "विधानसभा", mandal: "मंडल", booth: "बूथ",
      whatsapp: "WhatsApp नंबर", facebook: "Facebook Link", instagram: "Instagram Link", twitter: "X (Twitter) Link",
      referralCode: "Referral Code (यदि किसी ने भेजा हो)",
      password: "पासवर्ड", confirmPassword: "पासवर्ड की पुष्टि करें",
      declaration: "मैं भारतीय जनता पार्टी एवं भारतीय जनता युवा मोर्चा की विचारधारा एवं नीतियों का समर्थन करता/करती हूँ।",
      next: "आगे बढ़ें", back: "वापस", submit: "पंजीकरण पूर्ण करें",
      male: "पुरुष", female: "महिला", other: "अन्य",
    },
    verify: { title: "सदस्यता सत्यापन", subtitle: "सदस्यता क्रमांक डालें", placeholder: "BJYM-CG-2026-000001", button: "सत्यापित करें", notFound: "इस ID से कोई सदस्य नहीं मिला।", verified: "VERIFIED MEMBER" },
    dashboard: {
      welcome: "स्वागत है", yourCard: "आपका सदस्यता कार्ड", downloadPng: "PNG डाउनलोड करें", downloadPdf: "PDF डाउनलोड करें",
      referral: "Referral", referralCode: "आपका Referral Code", referralLink: "Referral Link", copyLink: "Link कॉपी करें",
      totalReferrals: "कुल Referrals", profile: "प्रोफाइल", changePassword: "पासवर्ड बदलें",
    },
  },
  en: {
    nav: { home: "Home", register: "Join Now", login: "Login", verify: "Verify", admin: "Admin", dashboard: "Dashboard", logout: "Logout" },
    hero: {
      badge: "Digital Membership Campaign 2026",
      title1: "Youth Power,",
      title2: "Nation's Power",
      subtitle: "Join BJYM Chhattisgarh",
      desc: "Become part of the Bharatiya Janata Yuva Morcha family and contribute to the rebuilding of India and Chhattisgarh.",
      ctaPrimary: "Become a Member",
      ctaSecondary: "Verify Membership",
      statsMembers: "Registered Members",
      statsDistricts: "Districts",
      statsCard: "ID Card",
      statsCardVal: "Instant",
      statsVerify: "Verification",
    },
    steps: {
      badge: "Just 3 Easy Steps",
      title: "Become a Member in 2 Minutes",
      s1t: "Fill the Form", s1d: "Register with your name, mobile, photo and booth details.",
      s2t: "Get your ID Card", s2d: "A Digital ID Card with a unique membership number and QR is generated instantly.",
      s3t: "Share it", s3d: "Share your referral link with friends to grow the campaign.",
    },
    cta: { title: "Join today — turn Youth Power into Nation's Power", desc: "Digital organization to every booth in Chhattisgarh.", button: "Register Now" },
    register: {
      title: "Membership Registration", subtitle: "Your Digital ID Card is generated instantly on submit",
      step1: "Personal Details", step2: "Electoral Details", step3: "Social Details", step4: "Password",
      fullName: "Full Name", fatherName: "Father / Husband Name", dob: "Date of Birth", gender: "Gender",
      phone: "Mobile Number", email: "Email Address", address: "Permanent Address", pincode: "Pincode",
      district: "District", assembly: "Assembly", mandal: "Mandal", booth: "Booth",
      whatsapp: "WhatsApp Number", facebook: "Facebook Link", instagram: "Instagram Link", twitter: "X (Twitter) Link",
      referralCode: "Referral Code (if referred)",
      password: "Password", confirmPassword: "Confirm Password",
      declaration: "I support the ideology and policies of Bharatiya Janata Party and BJYM.",
      next: "Continue", back: "Back", submit: "Complete Registration",
      male: "Male", female: "Female", other: "Other",
    },
    verify: { title: "Membership Verification", subtitle: "Enter Membership ID", placeholder: "BJYM-CG-2026-000001", button: "Verify", notFound: "No member found for this ID.", verified: "VERIFIED MEMBER" },
    dashboard: {
      welcome: "Welcome", yourCard: "Your Membership Card", downloadPng: "Download PNG", downloadPdf: "Download PDF",
      referral: "Referral", referralCode: "Your Referral Code", referralLink: "Referral Link", copyLink: "Copy Link",
      totalReferrals: "Total Referrals", profile: "Profile", changePassword: "Change Password",
    },
  },
};

export function t(locale: Locale) {
  return dictionary[locale];
}
