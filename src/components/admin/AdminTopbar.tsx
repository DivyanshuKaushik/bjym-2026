"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Bell, Search, ChevronDown, LogOut } from "lucide-react";
import { logout } from "@/app/actions/logout";
import { ADMIN_NAV } from "@/lib/rbac/permissions";

export function AdminTopbar({
  fullName, roleName, pendingCount, todayCount,
}: { fullName: string; roleName: string; pendingCount: number; todayCount: number }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const current = ADMIN_NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  const crumb = current?.labelHi ?? "डैशबोर्ड";
  const notifCount = pendingCount + (todayCount > 0 ? 1 : 0);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-white/90 px-5 py-3 backdrop-blur">
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide text-muted">Admin / {crumb}</div>
        <div className="truncate text-base font-black text-heading">{crumb}</div>
      </div>

      <div className="relative ml-auto hidden max-w-[280px] flex-1 sm:block">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          placeholder="Search members, ID…"
          className="w-full rounded-full border border-border bg-bg py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const q = (e.target as HTMLInputElement).value.trim();
              if (q) window.location.href = `/admin/members?q=${encodeURIComponent(q)}`;
            }
          }}
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted hover:bg-bg"
          title="Notifications"
        >
          <Bell size={16} />
          {pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-black text-white">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-border bg-white py-2 shadow-xl">
            <div className="border-b border-border px-3.5 pb-2 text-xs font-black text-heading">Notifications</div>
            <Link href="/admin/verification" onClick={() => setNotifOpen(false)} className="block px-3.5 py-2.5 text-xs hover:bg-bg">
              <span className="font-bold text-heading">{pendingCount}</span> सदस्य सत्यापन के लिए लंबित हैं
            </Link>
            <Link href="/admin/members" onClick={() => setNotifOpen(false)} className="block px-3.5 py-2.5 text-xs hover:bg-bg">
              आज <span className="font-bold text-heading">{todayCount}</span> नए पंजीकरण हुए
            </Link>
          </div>
        )}
      </div>

      <div className="relative">
        <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-3 hover:bg-bg">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-[11px] font-black text-white">
            {fullName.slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-xs font-bold leading-tight text-heading">{fullName}</div>
            <div className="text-[10px] leading-tight text-muted">{roleName}</div>
          </div>
          <ChevronDown size={14} className="text-muted" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-border bg-white py-1.5 shadow-xl">
            <button
              onClick={() => startTransition(() => logout())}
              disabled={pending}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-bold text-danger hover:bg-red-50"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
