import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { memberRepository } from "@/lib/repositories/member.repository";
import { adminRepository } from "@/lib/repositories/admin.repository";
import { verifySecret } from "@/lib/auth/password";

const ONE_DAY = 24 * 60 * 60;
const THIRTY_DAYS = 30 * 24 * 60 * 60;

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: THIRTY_DAYS },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "member",
      name: "Member Login",
      credentials: {
        identifier: { label: "Mobile or Email", type: "text" },
        mpin: { label: "MPIN", type: "password" },
        remember: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? "").trim();
        const mpin = String(credentials?.mpin ?? "").trim();
        if (!identifier || !mpin) return null;

        const member = await memberRepository.findByIdentifier(identifier);
        if (!member) return null;
        if (member.status === "Suspended" || member.status === "Deleted") return null;

        const valid = await memberRepository.verifyMpin(member, mpin);
        if (!valid) return null;

        await memberRepository.updateLastLogin(member.id);

        return {
          id: member.id,
          userType: "member" as const,
          membershipId: member.membership_id,
          fullName: member.full_name,
          tokenVersion: member.token_version,
          remember: credentials?.remember === "true",
        };
      },
    }),
    Credentials({
      id: "admin",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "").trim();
        if (!username || !password) return null;

        const admin = await adminRepository.findByUsername(username);
        if (!admin || !admin.is_active) return null;

        const valid = await verifySecret(password, admin.password_hash);
        if (!valid) return null;

        const roleName = await adminRepository.roleName(admin.role_id);
        const permissions = await adminRepository.permissionsForRole(admin.role_id);
        await adminRepository.updateLastLogin(admin.id);

        return {
          id: admin.id,
          userType: "admin" as const,
          username: admin.username,
          fullName: admin.full_name,
          roleName: roleName ?? "SUPERVISOR",
          permissions,
          tokenVersion: admin.token_version,
          remember: credentials?.remember === "true",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // First sign-in: copy the authorize() result onto the token.
        Object.assign(token, user);

        // "Remember Me": shorten the token's own expiry when unchecked.
        // (Session-level maxAge above stays at 30 days so the cookie
        // itself doesn't get killed early; this per-token exp is the
        // actual enforcement point checked on every request.)
        const remember = (user as { remember?: boolean }).remember;
        const seconds = remember === false ? ONE_DAY : THIRTY_DAYS;
        token.exp = Math.floor(Date.now() / 1000) + seconds;
      }
      return token;
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = token as any;
      session.user = {
        ...session.user,
        id: t.id,
        userType: t.userType,
        membershipId: t.membershipId,
        fullName: t.fullName,
        username: t.username,
        roleName: t.roleName,
        permissions: t.permissions ?? [],
        tokenVersion: t.tokenVersion,
      };
      return session;
    },
  },
};
