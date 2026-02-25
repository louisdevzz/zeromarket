import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { db } from "@/db";
import { users } from "@/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ profile }) {
      if (!profile) return false;

      const githubId = String(profile.id ?? profile.sub ?? "");
      const username =
        (profile as { login?: string }).login ??
        (profile.email?.split("@")[0] ?? githubId);
      const name = profile.name ?? username;
      const avatar =
        (profile as { avatar_url?: string }).avatar_url ?? null;
      const email = profile.email ?? null;

      if (!githubId || !username) return false;

      try {
        await db
          .insert(users)
          .values({
            id: `u_${githubId}`,
            github_id: githubId,
            username,
            name,
            avatar,
            email,
          })
          .onConflictDoUpdate({
            target: users.github_id,
            set: {
              username,
              name,
              avatar,
              email,
            },
          });
      } catch {
        // Non-fatal: allow sign-in even if DB write fails
        console.error("[auth] failed to upsert user");
      }

      return true;
    },

    async jwt({ token, profile }) {
      if (profile) {
        token.username =
          (profile as { login?: string }).login ??
          profile.email?.split("@")[0] ??
          "";
        token.githubId = String(profile.id ?? profile.sub ?? "");
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.username = (token.username as string) ?? "";
        session.user.githubId = (token.githubId as string) ?? "";
      }
      return session;
    },
  },
});
