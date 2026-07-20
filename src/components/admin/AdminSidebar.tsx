"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, BadgeCheck, BarChart3, Download, Network,
  ShieldCheck, History, Settings, ChevronLeft, ChevronRight,
} from "lucide-react";
import { ADMIN_NAV, type Permission } from "@/lib/rbac/permissions";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, Users, BadgeCheck, BarChart3, Download, Network, ShieldCheck, History, Settings,
};

export function AdminSidebar({ permissions }: { permissions: Permission[] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const items = ADMIN_NAV.filter((item) => permissions.includes(item.permission));

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-white transition-all",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-primary-dark font-serif font-black text-white">
          भा
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-[13px] font-black text-heading">BJYM Admin</div>
            <div className="truncate text-[9px] font-extrabold uppercase tracking-widest text-muted">Chhattisgarh</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.labelHi : undefined}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors",
                active ? "bg-primary-light text-primary-dark" : "text-heading hover:bg-bg"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.labelHi}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center gap-2 border-t border-border py-3 text-xs font-bold text-muted hover:bg-bg"
      >
        {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Collapse</>}
      </button>
    </aside>
  );
}
