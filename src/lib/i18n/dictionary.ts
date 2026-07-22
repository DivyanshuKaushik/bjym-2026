export type Locale = "hi" | "en";

type Dict = {
    nav: {
        home: string;
        register: string;
        login: string;
        verify: string;
        admin: string;
        dashboard: string;
        logout: string;
    };
    hero: {
        badge: string;
        title1: string;
        title2: string;
        subtitle: string;
        desc: string;
        ctaPrimary: string;
        ctaSecondary: string;
        statsMembers: string;
        statsDistricts: string;
        statsCard: string;
        statsCardVal: string;
        statsVerify: string;
    };
    steps: {
        badge: string;
        title: string;
        s1t: string;
        s1d: string;
        s2t: string;
        s2d: string;
        s3t: string;
        s3d: string;
    };
    cta: { title: string; desc: string; button: string };
    register: {
        title: string;
        subtitle: string;
        step1: string;
        step2: string;
        step3: string;
        step4: string;
        disclaimer: string;
        fullName: string;
        fatherName: string;
        dob: string;
        gender: string;
        phone: string;
        email: string;
        address: string;
        pincode: string;
        district: string;
        assembly: string;
        mandal: string;
        booth: string;
        boothOptional: string;
        loksabha: string;
        category: string;
        jaati: string;
        whatsapp: string;
        whatsappSame: string;
        facebook: string;
        instagram: string;
        twitter: string;
        referralCode: string;
        password: string;
        confirmPassword: string;
        declaration: string;
        next: string;
        back: string;
        submit: string;
        male: string;
        female: string;
        other: string;
        selectPlaceholder: string;
        day: string;
        month: string;
        year: string;
        ageHint: string;
        mpin: string;
        confirmMpin: string;
        mpinExplainTitle: string;
        mpinExplainItems: string[];
        photoLabel: string;
        photoHint: string;
        photoReady: string;
        photoChange: string;
        photoCropApply: string;
        photoCropCancel: string;
        photoZoom: string;
        photoRotate: string;
        membershipBadge: string;
    };
    verify: {
        title: string;
        subtitle: string;
        placeholder: string;
        button: string;
        notFound: string;
        verified: string;
        status: string;
        district: string;
        mandal: string;
        joined: string;
        verification: string;
    };
    dashboard: {
        welcome: string;
        yourCard: string;
        downloadPng: string;
        downloadPdf: string;
        referral: string;
        referralCode: string;
        referralLink: string;
        copyLink: string;
        totalReferrals: string;
        profile: string;
        changePassword: string;
        tabCard: string;
        tabReferral: string;
        tabProfile: string;
        pendingNotice: string;
        rejectedNotice: string;
        fieldName: string;
        fieldFather: string;
        fieldMobile: string;
        fieldWhatsapp: string;
        fieldEmail: string;
        fieldCategory: string;
        fieldJaati: string;
        fieldLoksabha: string;
        fieldDistrict: string;
        fieldAssembly: string;
        fieldMandal: string;
        fieldBooth: string;
        currentMpin: string;
        newMpin: string;
        confirmNewMpin: string;
        updateMpin: string;
        logoutEverywhereTitle: string;
        logoutEverywhereDesc: string;
        logoutEverywhereButton: string;
    };
    login: {
        memberTitle: string;
        memberSubtitle: string;
        identifier: string;
        mpin: string;
        rememberMe: string;
        signIn: string;
        forgotMpin: string;
        newRegistration: string;
    };
};

export const dictionary: Record<Locale, Dict> = {
    hi: {
        nav: {
            home: "होम",
            register: "सदस्य बनें",
            login: "लॉगिन",
            verify: "सत्यापन",
            admin: "Admin",
            dashboard: "डैशबोर्ड",
            logout: "लॉगआउट",
        },
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
            s1t: "Form भरें",
            s1d: "नाम, मोबाइल, फोटो और अपने बूथ की जानकारी के साथ पंजीकरण करें।",
            s2t: "ID Card पाएँ",
            s2d: "Unique सदस्यता क्रमांक और QR के साथ Digital ID Card तुरंत मिलेगा।",
            s3t: "Share करें",
            s3d: "अपना referral link दोस्तों के साथ share करके अभियान बढ़ाएँ।",
        },
        cta: {
            title: "आज ही जुड़ें — युवा शक्ति को राष्ट्र शक्ति बनाएँ",
            desc: "छत्तीसगढ़ के हर बूथ तक डिजिटल संगठन।",
            button: "अभी पंजीकरण करें",
        },
        register: {
            title: "सदस्यता पंजीकरण",
            subtitle:
                "पंजीकरण पूर्ण होते ही आपका डिजिटल सदस्यता कार्ड तुरंत डाउनलोड के लिए उपलब्ध होगा।",
            disclaimer:
                "यह सदस्यता अभियान पूर्णतः निःशुल्क है। सदस्यता, पंजीकरण एवं आईडी कार्ड के लिए किसी भी व्यक्ति को ऑनलाइन या ऑफलाइन किसी भी प्रकार का भुगतान न करें। यदि कोई व्यक्ति सदस्यता के नाम पर पैसे या किसी भी प्रकार के शुल्क की मांग करता है, तो कृपया तुरंत 91098 81465 पर सूचना दें",
            step1: "व्यक्तिगत विवरण",
            step2: "निर्वाचन विवरण",
            step3: "सुरक्षा",
            step4: "सुरक्षा",
            fullName: "पूरा नाम",
            fatherName: "पिता / पति का नाम",
            dob: "जन्मतिथि",
            gender: "लिंग",
            phone: "मोबाइल नंबर",
            email: "ईमेल आईडी",
            address: "पूरा पता",
            pincode: "पिनकोड",
            district: "संगठनात्मक जिला",
            assembly: "विधानसभा क्षेत्र",
            mandal: "मंडल",
            booth: "बूथ क्रमांक / नाम",
            boothOptional: "वैकल्पिक",
            loksabha: "लोकसभा क्षेत्र",
            category: "वर्ग",
            jaati: "जाति",
            whatsapp: "WhatsApp नंबर",
            whatsappSame: "WhatsApp नंबर मोबाइल नंबर जैसा ही है",
            facebook: "Facebook Link",
            instagram: "Instagram Link",
            twitter: "X (Twitter) Link",
            referralCode: "Referral Code (यदि किसी ने भेजा हो)",
            password: "पासवर्ड",
            confirmPassword: "पासवर्ड की पुष्टि करें",
            declaration:
                "मैं भारतीय जनता पार्टी एवं भारतीय जनता युवा मोर्चा की विचारधारा एवं नीतियों का समर्थन करता/करती हूँ।",
            next: "आगे बढ़ें",
            back: "वापस",
            submit: "पंजीकरण पूर्ण करें",
            male: "पुरुष",
            female: "महिला",
            other: "अन्य",
            selectPlaceholder: "चुनें",
            day: "दिन",
            month: "महीना",
            year: "वर्ष",
            ageHint: "सदस्यता के लिए आयु 16-40 वर्ष के बीच होनी चाहिए",
            mpin: "Login PIN (MPIN) — 4 या 6 अंक",
            confirmMpin: "MPIN की पुष्टि करें",
            mpinExplainTitle: "आपका Login PIN (MPIN) आवश्यक है:",
            mpinExplainItems: [
                "आईडी कार्ड डाउनलोड करने के लिए",
                "रेफरल विवरण देखने के लिए",
                "पुनः लॉगिन करने के लिए ",
            ],
            photoLabel: "पासपोर्ट साइज फोटो अपलोड करें।",
            photoHint: "फोटो चुनें, फिर क्रॉप, ज़ूम एवं रोटेट करें",
            photoReady: "Photo ready ✓",
            photoChange: "बदलने के लिए click करें",
            photoCropApply: "Crop लागू करें ✓",
            photoCropCancel: "रद्द करें",
            photoZoom: "Zoom",
            photoRotate: "Rotate",
            membershipBadge: "Membership Registration",
        },
        verify: {
            title: "सदस्यता सत्यापन",
            subtitle: "सदस्यता क्रमांक डालें",
            placeholder: "BJYM-CG-2026-000001",
            button: "सत्यापित करें",
            notFound: "इस ID से कोई सदस्य नहीं मिला।",
            verified: "VERIFIED MEMBER",
            status: "स्थिति",
            district: "जिला",
            mandal: "मंडल",
            joined: "पंजीकरण",
            verification: "सत्यापन",
        },
        dashboard: {
            welcome: "स्वागत है",
            yourCard: "आपका सदस्यता कार्ड",
            downloadPng: "PNG डाउनलोड करें",
            downloadPdf: "PDF डाउनलोड करें",
            referral: "रेफरल",
            referralCode: "आपका Referral Code",
            referralLink: "Referral Link",
            copyLink: "Link कॉपी करें",
            totalReferrals: "कुल Referrals",
            profile: "प्रोफाइल",
            changePassword: "पासवर्ड बदलें",
            tabCard: "सदस्यता कार्ड",
            tabReferral: "रेफरल",
            tabProfile: "प्रोफाइल",
            pendingNotice:
                "आपका फोटो एवं विवरण सत्यापन के लिए लंबित है। सत्यापन पूर्ण होने तक ID Card अस्थायी मान्य है।",
            rejectedNotice: "आपका आवेदन अस्वीकृत हुआ है। कारण:",
            fieldName: "नाम",
            fieldFather: "पिता/पति का नाम",
            fieldMobile: "मोबाइल",
            fieldWhatsapp: "WhatsApp",
            fieldEmail: "ईमेल",
            fieldCategory: "वर्ग",
            fieldJaati: "जाति",
            fieldLoksabha: "लोकसभा",
            fieldDistrict: "जिला",
            fieldAssembly: "विधानसभा",
            fieldMandal: "मंडल",
            fieldBooth: "बूथ",
            currentMpin: "वर्तमान MPIN",
            newMpin: "नया MPIN (4 या 6 अंक)",
            confirmNewMpin: "नया MPIN पुष्टि करें",
            updateMpin: "MPIN अपडेट करें",
            logoutEverywhereTitle: "Logout Everywhere",
            logoutEverywhereDesc:
                "यह सभी devices से आपका session समाप्त कर देगा — दोबारा login करना होगा।",
            logoutEverywhereButton: "सभी Devices से Logout करें",
        },
        login: {
            memberTitle: "सदस्य लॉगिन",
            memberSubtitle: "मोबाइल नंबर / ईमेल और MPIN से लॉगिन करें",
            identifier: "मोबाइल नंबर या ईमेल",
            mpin: "MPIN",
            rememberMe: "मुझे याद रखें (Remember Me)",
            signIn: "लॉगिन करें →",
            forgotMpin: "MPIN भूल गए? Admin से संपर्क करें",
            newRegistration: "नया पंजीकरण",
        },
    },
    en: {
        nav: {
            home: "Home",
            register: "Join Now",
            login: "Login",
            verify: "Verify",
            admin: "Admin",
            dashboard: "Dashboard",
            logout: "Logout",
        },
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
            s1t: "Fill the Form",
            s1d: "Register with your name, mobile, photo and booth details.",
            s2t: "Get your ID Card",
            s2d: "A Digital ID Card with a unique membership number and QR is generated instantly.",
            s3t: "Share it",
            s3d: "Share your referral link with friends to grow the campaign.",
        },
        cta: {
            title: "Join today — turn Youth Power into Nation's Power",
            desc: "Digital organization to every booth in Chhattisgarh.",
            button: "Register Now",
        },
        register: {
            title: "Membership Registration",
            subtitle: "Your Digital ID Card is generated instantly on submit",
            disclaimer:"Important Notice: This membership campaign is completely free of charge. If anyone demands any kind of fee in the name of membership, please report immediately to this number: 9109881465",
            step1: "Personal Details",
            step2: "Electoral Details",
            step3: "Security",
            step4: "Security",
            fullName: "Full Name",
            fatherName: "Father / Husband Name",
            dob: "Date of Birth",
            gender: "Gender",
            phone: "Mobile Number",
            email: "Email Address",
            address: "Permanent Address",
            pincode: "Pincode",
            district: "District",
            assembly: "Assembly",
            mandal: "Mandal",
            booth: "Booth Number / Name",
            boothOptional: "Optional",
            loksabha: "Lok Sabha Constituency",
            category: "Category",
            jaati: "Caste / Community",
            whatsapp: "WhatsApp Number",
            whatsappSame: "WhatsApp number is same as mobile number",
            facebook: "Facebook Link",
            instagram: "Instagram Link",
            twitter: "X (Twitter) Link",
            referralCode: "Referral Code (if referred)",
            password: "Password",
            confirmPassword: "Confirm Password",
            declaration:
                "I support the ideology and policies of Bharatiya Janata Party and BJYM.",
            next: "Continue",
            back: "Back",
            submit: "Complete Registration",
            male: "Male",
            female: "Female",
            other: "Other",
            selectPlaceholder: "Select",
            day: "Day",
            month: "Month",
            year: "Year",
            ageHint: "Age must be between 18-40 years for membership",
            mpin: "Login PIN (MPIN) — 4 or 6 digits",
            confirmMpin: "Confirm MPIN",
            mpinExplainTitle: "Your Login PIN (MPIN) is required to:",
            mpinExplainItems: [
                "Download your ID Card",
                "View referral details",
                "Log in again",
                "Update your profile",
            ],
            photoLabel: "Upload passport size photo",
            photoHint: "Click to browse — then crop, zoom and rotate",
            photoReady: "Photo ready ✓ (passport ratio, WebP)",
            photoChange: "Click to change",
            photoCropApply: "Apply Crop ✓",
            photoCropCancel: "Cancel",
            photoZoom: "Zoom",
            photoRotate: "Rotate",
            membershipBadge: "Membership Registration",
        },
        verify: {
            title: "Membership Verification",
            subtitle: "Enter Membership ID",
            placeholder: "BJYM-CG-2026-000001",
            button: "Verify",
            notFound: "No member found for this ID.",
            verified: "VERIFIED MEMBER",
            status: "Status",
            district: "District",
            mandal: "Mandal",
            joined: "Registered",
            verification: "Verification",
        },
        dashboard: {
            welcome: "Welcome",
            yourCard: "Your Membership Card",
            downloadPng: "Download PNG",
            downloadPdf: "Download PDF",
            referral: "Referral",
            referralCode: "Your Referral Code",
            referralLink: "Referral Link",
            copyLink: "Copy Link",
            totalReferrals: "Total Referrals",
            profile: "Profile",
            changePassword: "Change Password",
            tabCard: "Membership Card",
            tabReferral: "Referral",
            tabProfile: "Profile",
            pendingNotice:
                "Your photo and details are pending verification. Your ID Card is temporarily valid until verification is complete.",
            rejectedNotice: "Your application was rejected. Reason:",
            fieldName: "Name",
            fieldFather: "Father/Husband Name",
            fieldMobile: "Mobile",
            fieldWhatsapp: "WhatsApp",
            fieldEmail: "Email",
            fieldCategory: "Category",
            fieldJaati: "Caste/Community",
            fieldLoksabha: "Lok Sabha",
            fieldDistrict: "District",
            fieldAssembly: "Assembly",
            fieldMandal: "Mandal",
            fieldBooth: "Booth",
            currentMpin: "Current MPIN",
            newMpin: "New MPIN (4 or 6 digits)",
            confirmNewMpin: "Confirm New MPIN",
            updateMpin: "Update MPIN",
            logoutEverywhereTitle: "Logout Everywhere",
            logoutEverywhereDesc:
                "This will end your session on all devices — you'll need to log in again.",
            logoutEverywhereButton: "Logout from All Devices",
        },
        login: {
            memberTitle: "Member Login",
            memberSubtitle: "Log in with your mobile number / email and MPIN",
            identifier: "Mobile Number or Email",
            mpin: "MPIN",
            rememberMe: "Remember Me",
            signIn: "Sign In →",
            forgotMpin: "Forgot MPIN? Contact Admin",
            newRegistration: "New Registration",
        },
    },
};

export function t(locale: Locale) {
    return dictionary[locale];
}
