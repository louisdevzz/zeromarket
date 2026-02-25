import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username: string;
      githubId: string;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    githubId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    githubId?: string;
  }
}
