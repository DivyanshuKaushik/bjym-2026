import { Suspense } from "react";
import { memberRepository } from "@/lib/repositories/member.repository";
import { referralRepository } from "@/lib/repositories/referral.repository";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export const dynamic = "force-dynamic";

const LEADERBOARD_PAGE_SIZE = 10;

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ lbPage?: string }> }) {
  const { lbPage } = await searchParams;
  const leaderboardPage = Math.max(1, parseInt(lbPage || "1", 10) || 1);

  const [growth, district, category, gender, jaati, age, leaderboard] = await Promise.all([
    memberRepository.analyticsGrowth(30),
    memberRepository.analyticsBreakdown("district"),
    memberRepository.analyticsBreakdown("category"),
    memberRepository.analyticsBreakdown("gender"),
    memberRepository.analyticsBreakdown("jaati"),
    memberRepository.analyticsAgeDistribution(),
    referralRepository.leaderboard(LEADERBOARD_PAGE_SIZE, (leaderboardPage - 1) * LEADERBOARD_PAGE_SIZE),
  ]);

  return (
    <Suspense>
      <AnalyticsCharts
        growth={growth}
        district={district}
        category={category}
        gender={gender}
        jaati={jaati}
        age={age}
        leaderboard={leaderboard.rows}
        leaderboardTotal={leaderboard.total}
        leaderboardPage={leaderboardPage}
        leaderboardPageSize={LEADERBOARD_PAGE_SIZE}
      />
    </Suspense>
  );
}
