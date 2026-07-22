"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Menu, X } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { logout } from "@/app/actions/logout";
import { cn } from "@/lib/utils";

export function Navbar({ isAuthed, userType }: { isAuthed: boolean; userType: "member" | "admin" | null }) {
  const { d } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on route change.
  useEffect(() => setMenuOpen(false), [pathname]);
  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isAdminSection = pathname.startsWith("/admin");
  if (isAdminSection) return null; // admin area has its own AdminShell header

  const navItems = [
    { href: "/", label: d.nav.home },
    { href: "/register", label: d.nav.register },
    { href: "/verify", label: d.nav.verify },
    ...(userType === "member" ? [{ href: "/dashboard", label: d.nav.dashboard }] : userType === "admin" ? [{ href: "/admin", label: d.nav.admin }] : [{ href: "/login", label: d.nav.login }]),
  ];

  const doLogout = () => startTransition(async () => {
    await logout();
    router.push("/");
  });

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="BJYM Chhattisgarh" className="h-16 w-16 shrink-0 rounded-lg object-contain sm:h-16 sm:w-16" />
          <div className="min-w-0">
            <div className="truncate text-[14px] font-black text-heading sm:text-sm">भारतीय जनता युवा मोर्चा</div>
            <div className="truncate text-[9.5px] font-extrabold uppercase tracking-widest text-muted sm:text-[10px]">छत्तीसगढ़</div>
          </div>
        </Link>

        {/* desktop nav */}
        <nav className="ml-auto hidden items-center gap-1 rounded-full border border-border bg-white/80 p-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-bold transition-all",
                  active ? "bg-gradient-to-br from-orange-400 to-primary-dark text-white shadow-md" : "text-heading hover:bg-bg"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {isAuthed && (
            <button onClick={doLogout} disabled={pending} className="rounded-full px-4 py-2 text-[13px] font-bold text-heading transition-all hover:bg-bg">
              {d.nav.logout}
            </button>
          )}
        </nav>

        {/* mobile: hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-heading md:hidden"
          aria-label={menuOpen ? "मेनू बंद करें" : "मेनू खोलें"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {/* mobile menu panel */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-white transition-[max-height] duration-300 ease-in-out md:hidden",
          menuOpen ? "max-h-[420px]" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-[14.5px] font-bold transition-colors",
                  active ? "bg-primary-light text-primary-dark" : "text-heading active:bg-bg"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {isAuthed && (
            <button onClick={doLogout} disabled={pending} className="rounded-xl px-4 py-3 text-left text-[14.5px] font-bold text-danger active:bg-red-50">
              {d.nav.logout}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
