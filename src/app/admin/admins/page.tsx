import { adminRepository } from "@/lib/repositories/admin.repository";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [admins, roles] = await Promise.all([adminRepository.list(), adminRepository.listRoles()]);
  return <AdminUsersClient admins={admins} roles={roles} />;
}
