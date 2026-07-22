import "server-only";
import { db } from "@/lib/db/client";
import { hashSecret, verifySecret } from "@/lib/auth/password";
import type { Database } from "@/types/database";

export type MemberRow = Database["public"]["Tables"]["members"]["Row"];
export type MemberInsert = Database["public"]["Tables"]["members"]["Insert"];

const MEMBER_COLUMNS = "*";

export const memberRepository = {
  async create(data: MemberInsert): Promise<{ member: MemberRow | null; error: string | null }> {
    const { data: row, error } = await db().from("members").insert(data).select(MEMBER_COLUMNS).single();
    if (error) return { member: null, error: error.message };
    return { member: row as MemberRow, error: null };
  },

  async findById(id: string) {
    const { data } = await db().from("members").select(MEMBER_COLUMNS).eq("id", id).is("deleted_at", null).maybeSingle();
    return data as MemberRow | null;
  },

  async findByIdIncludingDeleted(id: string) {
    const { data } = await db().from("members").select(MEMBER_COLUMNS).eq("id", id).maybeSingle();
    return data as MemberRow | null;
  },

  async findByMembershipId(membershipId: string) {
    const { data } = await db().from("members").select(MEMBER_COLUMNS).eq("membership_id", membershipId).maybeSingle();
    return data as MemberRow | null;
  },

  /** Login lookup: mobile OR email, live members only (not soft-deleted). */
  async findByIdentifier(identifier: string) {
    const { data } = await db()
      .from("members")
      .select(MEMBER_COLUMNS)
      .or(`mobile.eq.${identifier},email.eq.${identifier}`)
      .is("deleted_at", null)
      .maybeSingle();
    return data as MemberRow | null;
  },

  async mobileOrEmailExists(mobile: string, email: string) {
    const { data } = await db()
      .from("members")
      .select("id, mobile, email")
      .is("deleted_at", null)
      .or(`mobile.eq.${mobile},email.eq.${email}`);
    const rows = (data ?? []) as { id: string; mobile: string; email: string }[];
    return {
      mobileTaken: rows.some((r) => r.mobile === mobile),
      emailTaken: rows.some((r) => r.email === email),
    };
  },

  async referralCodeExists(code: string) {
    const { data } = await db().from("members").select("referral_code, membership_id, full_name").eq("referral_code", code).is("deleted_at", null).maybeSingle();
    return data as { referral_code: string; membership_id: string; full_name: string } | null;
  },

  async verifyMpin(member: MemberRow, mpin: string) {
    return verifySecret(mpin, member.mpin_hash);
  },

  async hashMpin(mpin: string) {
    return hashSecret(mpin);
  },

  async selfChangeMpin(memberId: string, newMpin: string) {
    const hash = await hashSecret(newMpin);
    const { data } = await db().from("members").select("token_version").eq("id", memberId).single();
    const nextVersion = ((data as { token_version: number } | null)?.token_version ?? 1) + 1;
    const { error } = await db().from("members").update({ mpin_hash: hash, token_version: nextVersion }).eq("id", memberId);
    return { error: error?.message ?? null };
  },

  async updateLastLogin(memberId: string) {
    await db().from("members").update({ last_login: new Date().toISOString() }).eq("id", memberId);
  },

  async markIdCardGenerated(memberId: string) {
    await db().from("members").update({ id_card_generated: true }).eq("id", memberId);
  },

  async update(memberId: string, patch: Partial<MemberRow>, updatedBy: string | null) {
    const { error } = await db()
      .from("members")
      .update({ ...patch, updated_by: updatedBy })
      .eq("id", memberId);
    return { error: error?.message ?? null };
  },

  // ---- Admin status-transition actions (call the SQL functions, which also log) ----

  async approve(memberId: string, adminId: string) {
    const { error } = await db()
      .from("members")
      .update({ verification_status: "Verified", verified_by: adminId, verified_at: new Date().toISOString(), rejection_reason: null })
      .eq("id", memberId);
    if (!error) {
      await activityLog("admin", adminId, "member_approved", "members", memberId);
    }
    return { error: error?.message ?? null };
  },

  async reject(memberId: string, adminId: string, reason: string) {
    const { error } = await db()
      .from("members")
      .update({ verification_status: "Rejected", rejected_by: adminId, rejected_at: new Date().toISOString(), rejection_reason: reason })
      .eq("id", memberId);
    if (!error) {
      await activityLog("admin", adminId, "member_rejected", "members", memberId, { reason });
    }
    return { error: error?.message ?? null };
  },

  async suspend(memberId: string, adminId: string, reason?: string) {
    const { error } = await db().rpc("suspend_member", { p_member_id: memberId, p_admin_id: adminId, p_reason: reason ?? null });
    return { error: error?.message ?? null };
  },

  async activate(memberId: string, adminId: string) {
    const { error } = await db().rpc("restore_member", { p_member_id: memberId, p_admin_id: adminId });
    return { error: error?.message ?? null };
  },

  async softDelete(memberId: string, adminId: string, reason?: string) {
    const { error } = await db().rpc("soft_delete_member", { p_member_id: memberId, p_admin_id: adminId, p_reason: reason ?? null });
    return { error: error?.message ?? null };
  },

  async resetMpin(memberId: string, newMpin: string, adminId: string) {
    const hash = await hashSecret(newMpin);
    const { error } = await db().rpc("reset_member_mpin", { p_member_id: memberId, p_new_mpin_hash: hash, p_admin_id: adminId });
    return { error: error?.message ?? null };
  },

  // ---- Listing / search (admin members table) ----

  async list(params: {
    q?: string;
    loksabhaId?: string;
    districtId?: string;
    assemblyId?: string;
    mandalId?: string;
    category?: string;
    jaati?: string;
    gender?: string;
    status?: string;
    verificationStatus?: string;
    hasReferral?: boolean;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = db().from("members").select("*", { count: "exact" }).order("created_at", { ascending: false });

    query = applySearch(query, params.q);
    if (params.loksabhaId) query = query.eq("loksabha_id", params.loksabhaId);
    if (params.districtId) query = query.eq("district_id", params.districtId);
    if (params.assemblyId) query = query.eq("assembly_id", params.assemblyId);
    if (params.mandalId) query = query.eq("mandal_id", params.mandalId);
    if (params.category) query = query.eq("category", params.category);
    if (params.jaati) query = query.ilike("jaati", `%${sanitizeLike(params.jaati)}%`);
    if (params.gender) query = query.eq("gender", params.gender);
    if (params.status) query = query.eq("status", params.status);
    if (params.verificationStatus) query = query.eq("verification_status", params.verificationStatus);
    if (params.hasReferral === true) query = query.gt("referral_count", 0);
    if (params.hasReferral === false) query = query.eq("referral_count", 0);
    if (params.dateFrom) query = query.gte("created_at", params.dateFrom);
    if (params.dateTo) query = query.lte("created_at", params.dateTo);

    query = query.range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 50) - 1);

    const { data, count } = await query;
    return { rows: (data ?? []) as MemberRow[], total: count ?? 0 };
  },

  async pendingVerification(limit = 50) {
    const { data } = await db()
      .from("members")
      .select("*")
      .eq("verification_status", "Pending")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(limit);
    return (data ?? []) as MemberRow[];
  },

  // ---- Public verification (limited fields only) ----

  async verifyPublic(membershipId: string) {
    const { data } = await db()
      .from("members")
      .select("membership_id, full_name, photo_base64, district_name_hi, mandal_name_hi, status, verification_status, created_at")
      .eq("membership_id", membershipId)
      .maybeSingle();
    return data;
  },

  // ---- KPIs / analytics ----

  async kpis() {
    const client = db();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const base = () => client.from("members").select("*", { count: "exact", head: true }).is("deleted_at", null);

    const [
      total, today, week, month, active, suspended, deleted,
      male, female, other, verified, pending,
    ] = await Promise.all([
      base(),
      base().gte("created_at", todayStart.toISOString()),
      base().gte("created_at", weekAgo),
      base().gte("created_at", monthAgo),
      client.from("members").select("*", { count: "exact", head: true }).eq("status", "Active"),
      client.from("members").select("*", { count: "exact", head: true }).eq("status", "Suspended"),
      client.from("members").select("*", { count: "exact", head: true }).eq("status", "Deleted"),
      base().eq("gender", "Male"),
      base().eq("gender", "Female"),
      base().eq("gender", "Other"),
      base().eq("verification_status", "Verified"),
      base().eq("verification_status", "Pending"),
    ]);

    const { count: referralCount } = await client.from("member_referrals").select("*", { count: "exact", head: true });

    const totalCount = total.count ?? 0;
    const conversionPct = totalCount > 0 ? (((referralCount ?? 0) / totalCount) * 100).toFixed(1) : "0.0";

    return {
      total: totalCount,
      today: today.count ?? 0,
      week: week.count ?? 0,
      month: month.count ?? 0,
      active: active.count ?? 0,
      suspended: suspended.count ?? 0,
      deleted: deleted.count ?? 0,
      male: male.count ?? 0,
      female: female.count ?? 0,
      other: other.count ?? 0,
      verified: verified.count ?? 0,
      pending: pending.count ?? 0,
      referralCount: referralCount ?? 0,
      conversionPct,
    };
  },

  async analyticsRows(limit = 5000) {
    const { data } = await db()
      .from("members")
      .select("created_at, gender, category, jaati, district_name_hi, assembly_name_hi, mandal_name_hi, dob")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(limit);
    return (data ?? []) as {
      created_at: string; gender: string; category: string; jaati: string;
      district_name_hi: string; assembly_name_hi: string; mandal_name_hi: string; dob: string;
    }[];
  },

  // ---- Phase 2: scalable SQL-aggregated analytics (Postgres GROUP BY,
  //      not client-side row aggregation — works the same whether the
  //      table has 5,000 or 5,00,000 rows) ----

  async analyticsGrowth(days = 30) {
    const { data } = await db().rpc("analytics_growth", { p_days: days });
    return (data ?? []) as { day: string; daily_count: number; cumulative_count: number }[];
  },

  async analyticsBreakdown(dimension: "district" | "category" | "gender" | "jaati") {
    const fnMap = {
      district: "analytics_breakdown_district",
      category: "analytics_breakdown_category",
      gender: "analytics_breakdown_gender",
      jaati: "analytics_breakdown_jaati",
    } as const;
    const { data } = await db().rpc(fnMap[dimension]);
    return (data ?? []) as { name: string; count: number }[];
  },

  async analyticsAgeDistribution() {
    const { data } = await db().rpc("analytics_age_distribution");
    return (data ?? []) as { bucket: string; count: number }[];
  },

  async analyticsCross(xField: string, yField: string) {
    const { data, error } = await db().rpc("analytics_cross", { p_x_field: xField, p_y_field: yField });
    if (error) return [];
    return (data ?? []) as { x_value: string; y_value: string; count: number }[];
  },

  // ---- Export ----

  async forExport(filters: ExportFilters, limit = 20000) {
    let query = db().from("members").select("*").order("created_at", { ascending: false }).limit(limit);
    query = applyExportFilters(query, filters);
    const { data } = await query;
    return (data ?? []) as MemberRow[];
  },

  /** Chunked/paginated fetch used by the background export job processor
   *  so a 5,00,000-row export doesn't require one giant query. */
  async forExportPage(filters: ExportFilters, offset: number, pageSize: number) {
    let query = db()
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);
    query = applyExportFilters(query, filters);
    const { data } = await query;
    return (data ?? []) as MemberRow[];
  },

  async countForExport(filters: ExportFilters) {
    let query = db().from("members").select("*", { count: "exact", head: true });
    query = applyExportFilters(query, filters);
    const { count } = await query;
    return count ?? 0;
  },
};

export type ExportFilters = {
  status?: string;
  verificationStatus?: string;
  gender?: string;
  category?: string;
  jaati?: string;
  loksabhaId?: string;
  districtId?: string;
  assemblyId?: string;
  mandalId?: string;
  hasReferral?: boolean;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
};

/** Sanitizes a value used inside an ILIKE `%...%` pattern: strips ILIKE's
 *  own wildcard characters (so a literal `%`/`_` typed by the admin
 *  doesn't turn into an unintended wildcard) and PostgREST's `.or()`
 *  filter-syntax separators (`,`/`(`/`)`), which would otherwise break
 *  the filter string when several ORed conditions are combined. */
function sanitizeLike(value: string): string {
  return value.trim().replace(/[%_,()]/g, "").slice(0, 100);
}

/** Reliable admin search: ILIKE substring match (not whole-token
 *  full-text search) across exactly the fields the spec calls out —
 *  Membership ID, Name, Mobile, Email, Referral Code — backed by
 *  pg_trgm GIN indexes (000018_search_fix.sql) so this stays fast at
 *  5+ lakh rows despite the leading wildcard. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySearch(query: any, q?: string) {
  if (!q) return query;
  const term = sanitizeLike(q);
  if (!term) return query;
  const like = `%${term}%`;
  return query.or(`membership_id.ilike.${like},full_name.ilike.${like},mobile.ilike.${like},email.ilike.${like},referral_code.ilike.${like}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyExportFilters(query: any, filters: ExportFilters) {
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.verificationStatus) query = query.eq("verification_status", filters.verificationStatus);
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.jaati) query = query.ilike("jaati", `%${sanitizeLike(filters.jaati)}%`);
  if (filters.loksabhaId) query = query.eq("loksabha_id", filters.loksabhaId);
  if (filters.districtId) query = query.eq("district_id", filters.districtId);
  if (filters.assemblyId) query = query.eq("assembly_id", filters.assemblyId);
  if (filters.mandalId) query = query.eq("mandal_id", filters.mandalId);
  if (filters.hasReferral) query = query.gt("referral_count", 0);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);
  query = applySearch(query, filters.q);
  return query;
}

async function activityLog(actorType: "admin" | "member" | "system", actorId: string | null, action: string, targetTable: string, targetId: string, meta: Record<string, unknown> = {}) {
  await db().rpc("log_activity", {
    p_actor_type: actorType,
    p_actor_id: actorId,
    p_actor_label: null,
    p_action: action,
    p_target_table: targetTable,
    p_target_id: targetId,
    p_meta: meta,
  });
}
