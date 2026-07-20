import "server-only";
import { db } from "@/lib/db/client";

export type ExportJobRow = {
  id: string;
  admin_id: string;
  format: "csv" | "xlsx" | "pdf";
  filters: Record<string, unknown>;
  columns: string[];
  status: "queued" | "processing" | "completed" | "failed";
  total_rows: number;
  processed_rows: number;
  file_base64: string | null;
  file_name: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export const exportRepository = {
  async record(entry: {
    adminId: string;
    format: "csv" | "xlsx" | "pdf";
    filters: Record<string, unknown>;
    columns?: string[] | null;
    recordCount: number;
    status?: "completed" | "failed";
  }) {
    await db().from("export_history").insert({
      admin_id: entry.adminId,
      format: entry.format,
      filters: entry.filters,
      columns: entry.columns ?? null,
      record_count: entry.recordCount,
      status: entry.status ?? "completed",
    });
  },

  async history(limit = 30) {
    const { data } = await db()
      .from("export_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    const rows = (data ?? []) as {
      id: string; admin_id: string; format: string; record_count: number; status: string; created_at: string; filters: Record<string, unknown> | null;
    }[];

    const adminIds = [...new Set(rows.map((r) => r.admin_id))];
    let adminMap = new Map<string, string>();
    if (adminIds.length > 0) {
      const { data: admins } = await db().from("admin_users").select("id, username, full_name").in("id", adminIds);
      adminMap = new Map(((admins ?? []) as { id: string; username: string; full_name: string }[]).map((a) => [a.id, a.full_name || a.username]));
    }

    return rows.map((r) => ({
      id: r.id,
      format: r.format,
      recordCount: r.record_count,
      status: r.status,
      createdAt: r.created_at,
      adminName: adminMap.get(r.admin_id) ?? "—",
      filters: r.filters,
    }));
  },

  // ---- Phase 2: background export jobs ----

  async createJob(entry: { adminId: string; format: "csv" | "xlsx" | "pdf"; filters: Record<string, unknown>; columns: string[] }) {
    const { data, error } = await db()
      .from("export_jobs")
      .insert({ admin_id: entry.adminId, format: entry.format, filters: entry.filters, columns: entry.columns, status: "queued" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return (data as { id: string }).id;
  },

  async markProcessing(jobId: string, totalRows: number) {
    await db().from("export_jobs").update({ status: "processing", total_rows: totalRows, started_at: new Date().toISOString() }).eq("id", jobId);
  },

  async updateProgress(jobId: string, processedRows: number) {
    await db().from("export_jobs").update({ processed_rows: processedRows }).eq("id", jobId);
  },

  async completeJob(jobId: string, fileBase64: string, fileName: string) {
    await db()
      .from("export_jobs")
      .update({ status: "completed", file_base64: fileBase64, file_name: fileName, completed_at: new Date().toISOString() })
      .eq("id", jobId);
  },

  async failJob(jobId: string, message: string) {
    await db().from("export_jobs").update({ status: "failed", error_message: message, completed_at: new Date().toISOString() }).eq("id", jobId);
  },

  async getJob(jobId: string, adminId: string) {
    const { data } = await db().from("export_jobs").select("*").eq("id", jobId).eq("admin_id", adminId).maybeSingle();
    return data as ExportJobRow | null;
  },

  async listJobsForAdmin(adminId: string, limit = 10) {
    const { data } = await db()
      .from("export_jobs")
      .select("id, format, status, total_rows, processed_rows, file_name, created_at, completed_at")
      .eq("admin_id", adminId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as Pick<ExportJobRow, "id" | "format" | "status" | "total_rows" | "processed_rows" | "file_name" | "created_at" | "completed_at">[];
  },
};
