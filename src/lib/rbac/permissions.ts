export const ROLES = {
  MASTER_ADMIN: "MASTER_ADMIN",
  TEAM_MEMBER: "TEAM_MEMBER",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/** Every permission key used across the admin dashboard. Mirrors the
 *  `permissions` table seeded by supabase/migrations/000013_seed.sql —
 *  keep both in sync when adding a new permission. */
export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  ANALYTICS_VIEW: "analytics.view",
  MEMBERS_VIEW: "members.view",
  MEMBERS_EDIT: "members.edit",
  MEMBERS_APPROVE: "members.approve",
  MEMBERS_REJECT: "members.reject",
  MEMBERS_SUSPEND: "members.suspend",
  MEMBERS_ACTIVATE: "members.activate",
  MEMBERS_DELETE: "members.delete",
  MEMBERS_RESET_MPIN: "members.reset_mpin",
  MEMBERS_EXPORT: "members.export",
  REFERRALS_VIEW: "referrals.view",
  HIERARCHY_VIEW: "hierarchy.view",
  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",
  ADMINS_MANAGE: "admins.manage",
  LOGS_VIEW: "logs.view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Fallback role -> permission map, used if the DB-driven role_permissions
 *  table lookup fails for any reason (e.g. seed not run yet). The DB table
 *  is the source of truth in production; this exists so the app never
 *  hard-locks an admin out due to a missing seed row.
 *
 *  TEAM_MEMBER (formerly "Supervisor") is intentionally narrow: verification
 *  only — no dashboard stats, no member list browsing, no suspend/activate,
 *  no MPIN reset, no analytics/export/settings/admin-management. */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  MASTER_ADMIN: Object.values(PERMISSIONS),
  TEAM_MEMBER: [PERMISSIONS.MEMBERS_APPROVE, PERMISSIONS.MEMBERS_REJECT],
};

export function can(permissions: string[] | undefined, permission: Permission): boolean {
  return !!permissions?.includes(permission);
}

/** Nav item definitions for the admin sidebar, each gated by a permission.
 *  The sidebar filters this list against the signed-in admin's permissions. */
export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", labelHi: "डैशबोर्ड", icon: "LayoutDashboard", permission: PERMISSIONS.DASHBOARD_VIEW },
  { href: "/admin/members", label: "Members", labelHi: "सदस्य", icon: "Users", permission: PERMISSIONS.MEMBERS_VIEW },
  { href: "/admin/verification", label: "Verification", labelHi: "सत्यापन", icon: "BadgeCheck", permission: PERMISSIONS.MEMBERS_APPROVE },
  { href: "/admin/analytics", label: "Analytics", labelHi: "विश्लेषण", icon: "BarChart3", permission: PERMISSIONS.ANALYTICS_VIEW },
  { href: "/admin/export", label: "Export", labelHi: "एक्सपोर्ट", icon: "Download", permission: PERMISSIONS.MEMBERS_EXPORT },
  { href: "/admin/hierarchy", label: "Hierarchy", labelHi: "संरचना", icon: "Network", permission: PERMISSIONS.HIERARCHY_VIEW },
  { href: "/admin/admins", label: "Admin Users", labelHi: "एडमिन यूज़र्स", icon: "ShieldCheck", permission: PERMISSIONS.ADMINS_MANAGE },
  { href: "/admin/activity-logs", label: "Activity Logs", labelHi: "गतिविधि लॉग", icon: "History", permission: PERMISSIONS.LOGS_VIEW },
  { href: "/admin/settings", label: "Settings", labelHi: "सेटिंग्स", icon: "Settings", permission: PERMISSIONS.SETTINGS_VIEW },
] as const;

/** First nav route a given permission set actually grants access to — used
 *  as the post-login redirect and as the "denied" fallback in middleware,
 *  so a permission-restricted role (like TEAM_MEMBER, which has no
 *  dashboard.view) never gets redirected into a route it also can't see
 *  (which would otherwise loop). Falls back to /admin-login in the
 *  (should-never-happen) case an admin has no permissions at all. */
export function getDefaultAdminRoute(permissions: string[]): string {
  const match = ADMIN_NAV.find((n) => permissions.includes(n.permission));
  return match?.href ?? "/admin-login";
}
