import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userType: "member" | "admin";
      membershipId?: string;
      fullName?: string;
      username?: string;
      roleName?: string;
      permissions?: string[];
      tokenVersion?: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: "member" | "admin";
    membershipId?: string;
    fullName?: string;
    username?: string;
    roleName?: string;
    permissions?: string[];
    tokenVersion?: number;
  }
}
