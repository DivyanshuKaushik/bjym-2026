import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { SITE_URL } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: "सदस्य लॉगिन | Member Login",
  description: "मोबाइल नंबर या ईमेल और MPIN से BJYM Chhattisgarh सदस्य लॉगिन करें।",
  alternates: { canonical: `${SITE_URL}/login` },
};

export default function LoginPage() {
  return <LoginForm />;
}
