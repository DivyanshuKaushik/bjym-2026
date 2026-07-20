import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { memberRepository } from "@/lib/repositories/member.repository";
import { referralRepository } from "@/lib/repositories/referral.repository";
import { settingsRepository } from "@/lib/repositories/settings.repository";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "member") redirect("/login");

  const member = await memberRepository.findById(session.user.id);
  if (!member) redirect("/login");

  const referralCount = await referralRepository.count(member.membership_id);
  const settings = await settingsRepository.getAll();

  return (
    <DashboardClient
      member={member}
      referralCount={referralCount}
      signatoryName={(settings.signatory_name as string) || "राहुल योगराज टिकरिहा"}
      signatoryTitleHi={(settings.signatory_title_hi as string) || "प्रदेश अध्यक्ष - भाजयुमो छत्तीसगढ़"}
      portalWebsite={(settings.portal_website as string) || "joinbjymcg2026.com"}
    />
  );
}
