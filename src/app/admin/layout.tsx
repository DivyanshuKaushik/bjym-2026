import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const tabs = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/members", label: "Members" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/hierarchy", label: "Hierarchy" },
    { href: "/admin/settings", label: "Settings" },
  ];
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <div className="text-2xl font-black text-heading">Admin Dashboard</div>
          <div className="text-[12.5px] text-muted">BJYM Chhattisgarh · Live membership intelligence</div>
        </div>
        <nav className="ml-auto flex flex-wrap gap-1 rounded-full border border-border bg-white p-1">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-full px-4 py-2 text-[13px] font-bold text-heading hover:bg-bg">
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
