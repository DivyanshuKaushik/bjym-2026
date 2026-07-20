import { memberRepository } from "@/lib/repositories/member.repository";
import { referralRepository } from "@/lib/repositories/referral.repository";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [growth, district, category, gender, jaati, age, leaderboard] = await Promise.all([
    memberRepository.analyticsGrowth(30),
    memberRepository.analyticsBreakdown("district"),
    memberRepository.analyticsBreakdown("category"),
    memberRepository.analyticsBreakdown("gender"),
    memberRepository.analyticsBreakdown("jaati"),
    memberRepository.analyticsAgeDistribution(),
    referralRepository.leaderboard(10),
  ]);

  return (
    <AnalyticsCharts
      growth={growth}
      district={district}
      category={category}
      gender={gender}
      jaati={jaati}
      age={age}
      leaderboard={leaderboard}
    />
  );
}
