import type { Metadata } from "next";
import { SITE_CONFIG, SITE_URL } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and conditions for using the ${SITE_CONFIG.shortName} digital membership portal.`,
  alternates: { canonical: `${SITE_URL}/terms-and-conditions` },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-7">
    <h2 className="mb-2 text-base font-black text-heading">{title}</h2>
    <div className="grid gap-2 text-[13.5px] leading-relaxed text-muted">{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-14 sm:px-8">
      <div className="mb-10 text-center">
        <div className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary-dark">Terms &amp; Conditions</div>
        <h1 className="mt-3 font-serif text-2xl font-black text-heading sm:text-3xl">नियम एवं शर्तें</h1>
        <p className="mt-2 text-sm text-muted">भारतीय जनता युवा मोर्चा, छत्तीसगढ़ · Digital Membership Portal</p>
      </div>

      <Section title="1. स्वीकृति (Acceptance of Terms)">
        <p>इस पोर्टल पर पंजीकरण करके, आप इन नियमों एवं शर्तों से सहमत होते हैं। यदि आप इनसे सहमत नहीं हैं, तो कृपया पोर्टल का उपयोग न करें।</p>
      </Section>

      <Section title="2. पात्रता (Eligibility)">
        <p>सदस्यता के लिए आवेदक की आयु 16 से 40 वर्ष के बीच होनी चाहिए, तथा आवेदक को भारतीय जनता पार्टी एवं भारतीय जनता युवा मोर्चा की विचारधारा एवं नीतियों का समर्थक होना चाहिए।</p>
      </Section>

      <Section title="3. सदस्यता खाता (Membership Account)">
        <p>
          आपका Login PIN (MPIN) गोपनीय है — इसे किसी के साथ साझा न करें। अपने खाते के अंतर्गत होने वाली सभी गतिविधियों के लिए आप स्वयं उत्तरदायी हैं।
          गलत या भ्रामक जानकारी देने पर सदस्यता अस्वीकृत या निलंबित की जा सकती है।
        </p>
      </Section>

      <Section title="4. सदस्यता क्रमांक एवं डिजिटल कार्ड">
        <p>
          पंजीकरण के बाद जनरेट होने वाला सदस्यता क्रमांक एवं डिजिटल पहचान पत्र केवल पहचान सत्यापन हेतु है। इसका दुरुपयोग, जालसाजी, या अनधिकृत
          पुनर्मुद्रण/वितरण सख्त वर्जित है।
        </p>
      </Section>

      <Section title="5. सदस्यता निलंबन एवं समाप्ति">
        <p>
          संगठन को यह अधिकार है कि वह किसी भी सदस्यता को बिना पूर्व सूचना के निलंबित, अस्वीकृत या समाप्त कर सके, यदि दी गई जानकारी असत्य पाई
          जाए, या सदस्य संगठन की आचार संहिता का उल्लंघन करे।
        </p>
      </Section>

      <Section title="6. बौद्धिक संपदा (Intellectual Property)">
        <p>इस पोर्टल पर प्रदर्शित लोगो, टेम्पलेट, सामग्री एवं डिज़ाइन भारतीय जनता युवा मोर्चा एवं भारतीय जनता पार्टी की संपत्ति हैं। बिना अनुमति इनका व्यावसायिक उपयोग निषिद्ध है।</p>
      </Section>

      <Section title="7. दायित्व की सीमा (Limitation of Liability)">
        <p>पोर्टल "जैसा है" आधार पर उपलब्ध कराया गया है। तकनीकी व्यवधान, डेटा हानि, या सेवा में अस्थायी रुकावट के लिए संगठन उत्तरदायी नहीं होगा, यथासंभव प्रयास किया जाएगा कि सेवा निर्बाध रहे।</p>
      </Section>

      <Section title="8. परिवर्तन (Changes to Terms)">
        <p>इन नियमों में समय-समय पर संशोधन किया जा सकता है। संशोधित नियम इसी पृष्ठ पर प्रकाशित किए जाएंगे और प्रकाशन की तिथि से प्रभावी होंगे।</p>
      </Section>

      <Section title="9. संपर्क (Contact)">
        <p>
          इन नियमों संबंधी किसी भी प्रश्न या तकनीकी समस्या के लिए, कृपया संपर्क करें:<br />
          फ़ोन: <a href="tel:+919109881465" className="font-bold text-primary-dark hover:underline">9109881465</a> ·
          ईमेल: <a href="mailto:bjym4cg@gmail.com" className="font-bold text-primary-dark hover:underline">bjym4cg@gmail.com</a>
        </p>
      </Section>
    </div>
  );
}
