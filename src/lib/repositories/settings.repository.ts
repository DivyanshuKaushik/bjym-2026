import "server-only";
import { db } from "@/lib/db/client";

export const settingsRepository = {
  async getAll(): Promise<Record<string, unknown>> {
    const { data } = await db().from("settings").select("key, value");
    const rows = (data ?? []) as { key: string; value: unknown }[];
    const map: Record<string, unknown> = {};
    rows.forEach((row) => { map[row.key] = row.value; });
    return map;
  },

  async get(key: string) {
    const { data } = await db().from("settings").select("value").eq("key", key).maybeSingle();
    return (data as { value: unknown } | null)?.value ?? null;
  },

  async set(key: string, value: unknown, adminId: string) {
    const { error } = await db().from("settings").upsert({ key, value, updated_by: adminId });
    return { error: error?.message ?? null };
  },
};
