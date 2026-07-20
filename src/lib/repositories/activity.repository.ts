import "server-only";
import { db } from "@/lib/db/client";

export type ActivityLogRow = {
  id: string;
  actor_type: "admin" | "member" | "system";
  actor_id: string | null;
  actor_label: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

export const activityRepository = {
  async log(entry: {
    actorType: "admin" | "member" | "system";
    actorId?: string | null;
    actorLabel?: string | null;
    action: string;
    targetTable?: string | null;
    targetId?: string | null;
    meta?: Record<string, unknown>;
  }) {
    await db().from("activity_logs").insert({
      actor_type: entry.actorType,
      actor_id: entry.actorId ?? null,
      actor_label: entry.actorLabel ?? null,
      action: entry.action,
      target_table: entry.targetTable ?? null,
      target_id: entry.targetId ?? null,
      meta: entry.meta ?? {},
    });
  },

  async list(params: { limit?: number; offset?: number; actorType?: string } = {}) {
    let query = db().from("activity_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (params.actorType) query = query.eq("actor_type", params.actorType);
    query = query.range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 50) - 1);
    const { data, count } = await query;
    return { rows: (data ?? []) as ActivityLogRow[], total: count ?? 0 };
  },
};
