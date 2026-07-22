"use client";

import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, ChevronDown, LogOut } from "lucide-react";
import { logout } from "@/app/actions/logout";
import { ADMIN_NAV } from "@/lib/rbac/permissions";

export function AdminTopbar({ fullName, roleName, canSearchMembers }: { fullName: string; roleName: string; canSearchMembers: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const current = ADMIN_NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  const crumb = current?.labelHi ?? "डैशबोर्ड";

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-white/90 px-5 py-3 backdrop-blur">
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide text-muted">एडमिन / {crumb}</div>
        <div className="truncate text-base font-black text-heading">{crumb}</div>
      </div>

      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-3">
        {canSearchMembers && (
          <div className="relative hidden max-w-[280px] flex-1 sm:block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="सदस्य, ID खोजें…"
              className="w-full rounded-full border border-border bg-bg py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value.trim();
                  if (q) window.location.href = `/admin/members?q=${encodeURIComponent(q)}`;
                }
              }}
            />
          </div>
        )}

        <div className="relative shrink-0">
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
                <LogOut size={14} /> लॉगआउट
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
