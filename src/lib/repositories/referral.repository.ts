import "server-only";
import { db } from "@/lib/db/client";

export const referralRepository = {
  async byReferrer(membershipId: string) {
    const { data } = await db()
      .from("member_referrals")
      .select("referred_membership_id, created_at")
      .eq("referrer_membership_id", membershipId)
      .order("created_at", { ascending: false });
    return (data ?? []) as { referred_membership_id: string; created_at: string }[];
  },

  async leaderboard(limit = 10) {
    const { data } = await db()
      .from("members")
      .select("membership_id, full_name, referral_count")
      .is("deleted_at", null)
      .gt("referral_count", 0)
      .order("referral_count", { ascending: false })
      .limit(limit);
    return (data ?? []) as { membership_id: string; full_name: string; referral_count: number }[];
  },

  async count(membershipId: string) {
    const { count } = await db()
      .from("member_referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_membership_id", membershipId);
    return count ?? 0;
  },
};
