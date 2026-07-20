export const metadata = { title: "Privacy Policy — BJYM Chhattisgarh" };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-7">
    <h2 className="mb-2 text-base font-black text-heading">{title}</h2>
    <div className="grid gap-2 text-[13.5px] leading-relaxed text-muted">{children}</div>
  </section>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-14 sm:px-8">
      <div className="mb-10 text-center">
        <div className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary-dark">Privacy Policy</div>
        <h1 className="mt-3 font-serif text-2xl font-black text-heading sm:text-3xl">गोपनीयता नीति</h1>
        <p className="mt-2 text-sm text-muted">भारतीय जनता युवा मोर्चा, छत्तीसगढ़ · Digital Membership Portal</p>
      </div>

      <Section title="1. एकत्रित जानकारी (Information Collected)">
        <p>
          पंजीकरण के दौरान हम आपका पूरा नाम, पिता/पति का नाम, जन्मतिथि, लिंग, वर्ग, जाति, मोबाइल नंबर, WhatsApp नंबर,
          ईमेल पता, पासपोर्ट साइज़ फोटो, स्थायी पता, पिनकोड, तथा आपकी संगठनात्मक जानकारी (लोकसभा, जिला, विधानसभा, मंडल, बूथ) एकत्र करते हैं।
        </p>
      </Section>

      <Section title="2. उद्देश्य (Purpose)">
        <p>
          यह जानकारी सदस्यता सत्यापन, डिजिटल पहचान पत्र निर्माण, संगठनात्मक संचार, कार्यक्रम सूचना, तथा भारतीय जनता युवा मोर्चा एवं
          भारतीय जनता पार्टी की गतिविधियों के समन्वय हेतु उपयोग की जाती है।
        </p>
      </Section>

      <Section title="3. सहमति (Consent)">
        <p>
          पंजीकरण फॉर्म सबमिट करके, आप स्वेच्छा से यह जानकारी प्रदान करने और ऊपर वर्णित उद्देश्यों हेतु इसके उपयोग के लिए सहमति देते हैं।
          पंजीकरण के समय दी गई घोषणा ("मैं भारतीय जनता पार्टी एवं भारतीय जनता युवा मोर्चा की विचारधारा एवं नीतियों का समर्थन करता/करती हूँ")
          इस सहमति का हिस्सा है।
        </p>
      </Section>

      <Section title="4. फोटो का उपयोग (Photo Usage)">
        <p>
          आपकी अपलोड की गई फोटो केवल आपके डिजिटल सदस्यता पहचान पत्र पर प्रदर्शित करने तथा सत्यापन प्रक्रिया हेतु उपयोग की जाती है।
          इसे किसी तीसरे पक्ष के साथ वाणिज्यिक उद्देश्यों के लिए साझा नहीं किया जाता।
        </p>
      </Section>

      <Section title="5. सदस्यता डेटा (Membership Data)">
        <p>
          आपकी सदस्यता जानकारी को एक सुरक्षित डेटाबेस में संग्रहीत किया जाता है। एक अद्वितीय सदस्यता क्रमांक और QR कोड आधारित
          सत्यापन प्रणाली के माध्यम से आपकी सदस्यता की प्रामाणिकता सुनिश्चित की जाती है। सार्वजनिक सत्यापन पृष्ठ पर केवल सीमित
          जानकारी (नाम, फोटो, जिला, मंडल, स्थिति) प्रदर्शित होती है — संपर्क विवरण सार्वजनिक रूप से कभी प्रदर्शित नहीं होते।
        </p>
      </Section>

      <Section title="6. डेटा सुरक्षा (Data Security)">
        <p>
          आपका Login PIN (MPIN) एन्क्रिप्टेड (hashed) रूप में संग्रहीत किया जाता है — इसे कभी भी plain text में संग्रहीत नहीं किया जाता।
          सभी प्रशासनिक पहुंच भूमिका-आधारित अनुमतियों (Role-Based Access Control) द्वारा नियंत्रित होती है, और प्रत्येक संवेदनशील
          कार्रवाई का गतिविधि लॉग (Activity Log) रखा जाता है।
        </p>
      </Section>

      <Section title="7. उपयोगकर्ता अधिकार (User Rights)">
        <p>
          आप अपने डैशबोर्ड से अपनी प्रोफाइल जानकारी देख सकते हैं और अपना MPIN बदल सकते हैं। अपनी जानकारी में सुधार, सदस्यता निलंबन,
          या खाता हटाने के अनुरोध हेतु आप संबंधित जिला/मंडल प्रशासक या हमारी संपर्क जानकारी के माध्यम से संपर्क कर सकते हैं।
        </p>
      </Section>

      <Section title="8. संपर्क जानकारी (Contact Information)">
        <p>
          इस गोपनीयता नीति संबंधी किसी भी प्रश्न या तकनीकी समस्या के लिए, कृपया संपर्क करें:
        </p>
        <p>
          फ़ोन: <a href="tel:+919109881465" className="font-bold text-primary-dark hover:underline">9109881465</a><br />
          ईमेल: <a href="mailto:bjym4cg@gmail.com" className="font-bold text-primary-dark hover:underline">bjym4cg@gmail.com</a>
        </p>
      </Section>

      <Section title="9. अस्वीकरण (Disclaimer)">
        <p>
          यह पोर्टल भारतीय जनता युवा मोर्चा, छत्तीसगढ़ की एक आंतरिक डिजिटल सदस्यता प्रणाली है। समय-समय पर इस नीति में बदलाव किया जा
          सकता है; कोई भी महत्वपूर्ण परिवर्तन इसी पृष्ठ पर अद्यतन किया जाएगा।
        </p>
      </Section>
    </div>
  );
}
