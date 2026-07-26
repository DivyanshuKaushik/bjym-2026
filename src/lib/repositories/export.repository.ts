import "server-only";
import { db } from "@/lib/db/client";

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

  async history(limit = 10) {
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
};

// (Removed: the export_jobs-backed background job methods —
// createJob/markProcessing/updateProgress/completeJob/failJob/getJob/
// listJobsForAdmin. That design relied on Next.js's `after()` API to
// keep processing after the response was sent, which isn't supported
// on AWS Amplify Hosting. Exports now always download in synchronous
// batches of up to 3,000 rows instead — see src/app/actions/export.ts.
// The `export_jobs` table itself is left in place in the DB schema;
// it's simply unused now, which is harmless.)
