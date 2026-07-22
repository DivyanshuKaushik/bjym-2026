import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { memberRepository } from "@/lib/repositories/member.repository";
import { adminRepository } from "@/lib/repositories/admin.repository";
import { ADMIN_NAV, getDefaultAdminRoute } from "@/lib/rbac/permissions";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isMemberArea = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isMemberArea && !isAdminArea) return NextResponse.next();

  const session = req.auth;

  if (isMemberArea) {
    if (!session?.user || session.user.userType !== "member") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    // "Logout everywhere" enforcement: compare the token's snapshotted
    // tokenVersion against the live DB value on every protected navigation.
    const member = await memberRepository.findById(session.user.id);
    if (!member || member.token_version !== session.user.tokenVersion) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("expired", "1");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Admin area
  if (!session?.user || session.user.userType !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin-login";
    return NextResponse.redirect(url);
  }

  const admin = await adminRepository.findById(session.user.id);
  if (!admin || !admin.is_active || admin.token_version !== session.user.tokenVersion) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin-login";
    url.searchParams.set("expired", "1");
    return NextResponse.redirect(url);
  }

  // RBAC: does this admin's role permit this specific admin route?
  const navItem = ADMIN_NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  if (navItem) {
    const permissions = session.user.permissions ?? [];
    if (!permissions.includes(navItem.permission)) {
      const url = req.nextUrl.clone();
      url.pathname = getDefaultAdminRoute(permissions);
      url.searchParams.set("denied", "1");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
