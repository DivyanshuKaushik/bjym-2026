import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { memberRepository } from "@/lib/repositories/member.repository";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import type { Permission } from "@/lib/rbac/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") redirect("/admin-login");

  const permissions = (session.user.permissions ?? []) as Permission[];
  const kpis = await memberRepository.kpis();

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar permissions={permissions} />
      <div className="min-w-0 flex-1">
        <AdminTopbar
          fullName={session.user.fullName ?? session.user.username ?? "Admin"}
          roleName={session.user.roleName ?? ""}
          pendingCount={kpis.pending}
          todayCount={kpis.today}
        />
        <main className="p-5 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
