import type { Metadata } from "next";
import { RegisterWizard } from "@/components/forms/RegisterWizard";
import { SITE_URL } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: "सदस्यता पंजीकरण | Register",
  description: "BJYM Chhattisgarh में ऑनलाइन सदस्यता पंजीकरण करें और अपना डिजिटल सदस्यता कार्ड तुरंत प्राप्त करें।",
  alternates: { canonical: `${SITE_URL}/register` },
};

export default function RegisterPage() {
  return (
    <div className="px-4 py-14 sm:px-8">
      <RegisterWizard />
    </div>
  );
}
