import { Suspense } from "react";
import { VerifyClient } from "@/components/verify/VerifyClient";

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
