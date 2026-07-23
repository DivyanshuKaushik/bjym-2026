import "server-only";
import { db } from "@/lib/db/client";
import { hashSecret, verifySecret } from "@/lib/auth/password";
import type { Database } from "@/types/database";

export type MemberRow = Database["public"]["Tables"]["members"]["Row"];
export type MemberInsert = Database["public"]["Tables"]["members"]["Insert"];

const MEMBER_COLUMNS = "*";

/** Used for list/table views (Members list, KPI counts, analytics, exports'
 *  preview) — everything EXCEPT `photo_base64` (can be tens of KB per row;
 *  utterly unnecessary for a 28px list avatar and was the direct cause of
 *  413/oversized-payload errors on the Members list), `mpin_hash` (never
 *  needed client-side), and `search_vector` (internal full-text index,
 *  not used by app code at all anymore — see 000018_search_fix.sql).
 *  Single-record reads that genuinely need the photo (member detail,
 *  the member's own dashboard/ID card, verification review) still use
 *  `MEMBER_COLUMNS` ("*"). */
const LIST_COLUMNS = [
  "id", "membership_id", "status", "verification_status",
  "photo_url", "photo_storage_path",
  "full_name", "father_name", "dob", "gender", "category", "jaati",
  "mobile", "whatsapp", "email",
  "loksabha_id", "loksabha_name_en", "loksabha_name_hi",
  "district_id", "district_name_en", "district_name_hi",
  "assembly_id", "assembly_name_en", "assembly_name_hi",
  "mandal_id", "mandal_name_en", "mandal_name_hi",
  "booth", "address", "pincode",
  "token_version", "referral_code", "referred_by_code", "referral_count",
  "qr_generated", "id_card_generated", "last_login",
  "registration_source", "language_preference", "rejection_reason",
  "created_at", "updated_at", "deleted_at",
  "created_by", "updated_by", "verified_by", "verified_at",
  "suspended_by", "suspended_at", "rejected_by", "rejected_at", "deleted_by",
].join(", ");

export const memberRepository = {
  async create(data: MemberInsert): Promise<{ member: MemberRow | null; error: string | null }> {
    const { data: row, error } = await db().from("members").insert(data).select(MEMBER_COLUMNS).single();
    if (error) return { member: null, error: error.message };
    return { member: row as MemberRow, error: null };
  },

  /** Used on page load for the member's own dashboard — deliberately
   *  excludes photo_base64. The dashboard fetches the photo separately
   *  (see getPhotoById below) once the rest of the page has already
   *  rendered, so a slow/large photo never blocks the initial paint. */
  async findById(id: string) {
    const { data } = await db().from("members").select(LIST_COLUMNS).eq("id", id).is("deleted_at", null).maybeSingle();
    return data as unknown as MemberRow | null;
  },

  /** Used on page load for the admin Member Detail page — same
   *  photo-excluded/on-demand treatment as findById above. */
  async findByIdIncludingDeleted(id: string) {
    const { data } = await db().from("members").select(LIST_COLUMNS).eq("id", id).maybeSingle();
    return data as unknown as MemberRow | null;
  },

  /** On-demand photo fetch — called client-side, after the surrounding
   *  page (dashboard or admin detail) has already rendered its text
   *  content, so the (potentially large) base64 photo is never part of
   *  the initial page payload. */
  /** Server-only, minimal fields for the change-MPIN flow (needs
   *  mpin_hash to verify the current MPIN, and mobile to re-sign-in
   *  after a successful change). Deliberately separate from findById(),
   *  whose result is passed straight into a client component's props —
   *  mpin_hash must never end up there. */
  async authFieldsById(id: string) {
    const { data } = await db().from("members").select("id, mobile, mpin_hash").eq("id", id).is("deleted_at", null).maybeSingle();
    return data as { id: string; mobile: string; mpin_hash: string } | null;
  },

  async getPhotoById(id: string) {
    const { data } = await db().from("members").select("photo_url, photo_base64").eq("id", id).maybeSingle();
    const row = data as { photo_url: string | null; photo_base64: string | null } | null;
    return row?.photo_url ?? row?.photo_base64 ?? null;
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

  async verifyMpin(member: { mpin_hash: string }, mpin: string) {
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
    let query = db().from("members").select(LIST_COLUMNS, { count: "exact" }).order("created_at", { ascending: false });

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
    return { rows: (data ?? []) as unknown as MemberRow[], total: count ?? 0 };
  },

  async pendingVerification(limit = 50, offset = 0) {
    const { data, count } = await db()
      .from("members")
      .select("*", { count: "exact" })
      .eq("verification_status", "Pending")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);
    return { rows: (data ?? []) as MemberRow[], total: count ?? 0 };
  },

  // ---- Public verification (limited fields only) ----

  async verifyPublic(membershipId: string) {
    const { data } = await db()
      .from("members")
      .select("membership_id, full_name, photo_url, photo_base64, district_name_hi, mandal_name_hi, status, verification_status, created_at")
      .eq("membership_id", membershipId)
      .maybeSingle();
    return data;
  },

  // ---- KPIs / analytics ----

  async kpis() {
    const { data, error } = await db().rpc("admin_dashboard_kpis").single();
    if (error || !data) {
      return {
        total: 0, today: 0, week: 0, month: 0, active: 0, suspended: 0, deleted: 0,
        male: 0, female: 0, other: 0, verified: 0, pending: 0, rejected: 0,
        referralCount: 0, conversionPct: "0.0",
      };
    }
    const row = data as {
      total: number; today: number; week: number; month: number;
      active: number; suspended: number; deleted: number;
      male: number; female: number; other: number;
      verified: number; pending: number; rejected: number; referral_count: number;
    };
    const conversionPct = row.total > 0 ? ((row.referral_count / row.total) * 100).toFixed(1) : "0.0";
    return {
      total: row.total, today: row.today, week: row.week, month: row.month,
      active: row.active, suspended: row.suspended, deleted: row.deleted,
      male: row.male, female: row.female, other: row.other,
      verified: row.verified, pending: row.pending, rejected: row.rejected,
      referralCount: row.referral_count, conversionPct,
    };
  },

  // (Removed: analyticsRows() — an older client-side-aggregation approach
  // that fetched up to 5,000 raw rows just to bucket them in JS. Fully
  // superseded by the SQL-aggregated functions below, which scale to any
  // table size and were already the only ones actually called by the
  // Analytics page. Dead code removed as part of the query audit.)

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
    let query = db().from("members").select(LIST_COLUMNS).order("created_at", { ascending: false }).limit(limit);
    query = applyExportFilters(query, filters);
    const { data } = await query;
    return (data ?? []) as unknown as MemberRow[];
  },

  /** Chunked/paginated fetch used by the background export job processor
   *  so a 5,00,000-row export doesn't require one giant query. */
  async forExportPage(filters: ExportFilters, offset: number, pageSize: number) {
    let query = db()
      .from("members")
      .select(LIST_COLUMNS)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);
    query = applyExportFilters(query, filters);
    const { data } = await query;
    return (data ?? []) as unknown as MemberRow[];
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
