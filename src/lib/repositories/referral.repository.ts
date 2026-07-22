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

  async leaderboard(limit = 10, offset = 0) {
    const { data, count } = await db()
      .from("members")
      .select("membership_id, full_name, referral_count", { count: "exact" })
      .is("deleted_at", null)
      .gt("referral_count", 0)
      .order("referral_count", { ascending: false })
      .range(offset, offset + limit - 1);
    return {
      rows: (data ?? []) as { membership_id: string; full_name: string; referral_count: number }[],
      total: count ?? 0,
    };
  },

  async count(membershipId: string) {
    const { count } = await db()
      .from("member_referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_membership_id", membershipId);
    return count ?? 0;
  },
};
