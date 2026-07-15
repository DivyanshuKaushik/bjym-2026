"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function Navbar({ isAuthed, isAdmin }: { isAuthed: boolean; isAdmin: boolean }) {
  const { d } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const navItems = [
    { href: "/", label: d.nav.home },
    { href: "/register", label: d.nav.register },
    { href: "/verify", label: d.nav.verify },
    ...(isAdmin ? [{ href: "/admin", label: d.nav.admin }] : isAuthed ? [{ href: "/dashboard", label: d.nav.dashboard }] : [{ href: "/login", label: d.nav.login }]),
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex flex-wrap items-center gap-3 px-4 sm:px-8 py-3 backdrop-blur-xl border-b",
        isHome ? "bg-[#0D1220]/70 border-white/10" : "bg-bg/85 border-border"
      )}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-primary-dark font-serif font-black text-white shadow-lg">
          भा
        </div>
        <div>
          <div className={cn("text-sm font-black leading-tight", isHome ? "text-white" : "text-heading")}>BJYM छत्तीसगढ़</div>
          <div className={cn("text-[9px] font-extrabold uppercase tracking-widest", isHome ? "text-white/60" : "text-muted")}>
            Digital Membership
          </div>
        </div>
      </Link>

      <nav
        className={cn(
          "ml-auto flex flex-wrap gap-1 rounded-full border p-1",
          isHome ? "border-white/15 bg-white/8" : "border-border bg-white/80"
        )}
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-bold transition-all",
                active
                  ? "bg-gradient-to-br from-orange-400 to-primary-dark text-white shadow-md"
                  : isHome
                  ? "text-white/85 hover:text-white"
                  : "text-heading hover:bg-bg"
              )}
            >
              {item.label}
            </Link>
          );
        })}
        {isAuthed && (
          <button
            onClick={handleLogout}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-bold transition-all",
              isHome ? "text-white/85 hover:text-white" : "text-heading hover:bg-bg"
            )}
          >
            {d.nav.logout}
          </button>
        )}
      </nav>

      <LanguageSwitcher dark={isHome} />
    </header>
  );
}
