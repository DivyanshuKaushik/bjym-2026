import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyClient } from "@/components/verify/VerifyClient";
import { SITE_URL } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: "सदस्यता सत्यापन | Verify Membership",
  description: "अपना BJYM Chhattisgarh सदस्यता क्रमांक डालकर सदस्यता सत्यापित करें।",
  alternates: { canonical: `${SITE_URL}/verify` },
};

export const dynamic = "force-dynamic";

export default function VerifyPage() {
  return (
    <div className="px-4 py-14 sm:px-8">
      <Suspense>
        <VerifyClient />
      </Suspense>
    </div>
  );
}
