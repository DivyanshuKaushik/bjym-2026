import "server-only";
import { db } from "@/lib/db/client";
import { hashSecret } from "@/lib/auth/password";
import type { Database } from "@/types/database";

export type AdminRow = Database["public"]["Tables"]["admin_users"]["Row"];

export const adminRepository = {
  async findByUsername(username: string) {
    const { data } = await db().from("admin_users").select("*").eq("username", username).maybeSingle();
    return data as AdminRow | null;
  },

  async findById(id: string) {
    const { data } = await db().from("admin_users").select("*").eq("id", id).maybeSingle();
    return data as AdminRow | null;
  },

  async permissionsForRole(roleId: string): Promise<string[]> {
    const { data: links } = await db().from("role_permissions").select("permission_id").eq("role_id", roleId);
    const permissionIds = ((links ?? []) as { permission_id: string }[]).map((l) => l.permission_id);
    if (permissionIds.length === 0) return [];

    const { data: perms } = await db().from("permissions").select("key").in("id", permissionIds);
    return ((perms ?? []) as { key: string }[]).map((p) => p.key);
  },

  async roleName(roleId: string): Promise<string | null> {
    const { data } = await db().from("roles").select("name").eq("id", roleId).maybeSingle();
    return (data as { name: string } | null)?.name ?? null;
  },

  async getRoleIdByName(name: string): Promise<string | null> {
    const { data } = await db().from("roles").select("id").eq("name", name).maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
  },

  async updateLastLogin(adminId: string) {
    await db().from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", adminId);
  },

  async list() {
    const { data } = await db()
      .from("admin_users")
      .select("id, username, full_name, role_id, is_active, last_login, created_at")
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as { id: string; username: string; full_name: string; role_id: string; is_active: boolean; last_login: string | null; created_at: string }[];

    const { data: rolesData } = await db().from("roles").select("id, name");
    const roleMap = new Map(((rolesData ?? []) as { id: string; name: string }[]).map((r) => [r.id, r.name]));

    return rows.map((r) => ({
      id: r.id,
      username: r.username,
      fullName: r.full_name,
      roleId: r.role_id,
      roleName: roleMap.get(r.role_id) ?? "SUPERVISOR",
      isActive: r.is_active,
      lastLogin: r.last_login,
      createdAt: r.created_at,
    }));
  },

  async create(input: { username: string; password: string; fullName: string; roleId: string; createdBy: string }) {
    const passwordHash = await hashSecret(input.password);
    const { data, error } = await db()
      .from("admin_users")
      .insert({
        username: input.username,
        password_hash: passwordHash,
        full_name: input.fullName,
        role_id: input.roleId,
        created_by: input.createdBy,
      })
      .select("id, username, full_name")
      .single();
    const admin = data as { id: string; username: string; full_name: string } | null;
    return { admin, error: error?.message ?? null };
  },

  async setActive(adminId: string, isActive: boolean) {
    const { error } = await db().from("admin_users").update({ is_active: isActive }).eq("id", adminId);
    return { error: error?.message ?? null };
  },

  async bumpTokenVersion(adminId: string) {
    const { data } = await db().from("admin_users").select("token_version").eq("id", adminId).single();
    const next = ((data as { token_version: number } | null)?.token_version ?? 1) + 1;
    await db().from("admin_users").update({ token_version: next }).eq("id", adminId);
    return next;
  },

  async listRoles() {
    const { data } = await db().from("roles").select("*").order("name");
    return (data ?? []) as { id: string; name: string; description: string | null }[];
  },
};
