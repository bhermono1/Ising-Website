import type { NextAuthConfig } from "next-auth";

/**
 * Shared, DB-free config consumed by both proxy.ts (route gating) and the
 * full auth.ts (Route Handlers / Server Components). The `session` callback
 * lives here — not just in auth.ts — because it's pure data-shaping (copies
 * fields already embedded in the JWT by auth.ts's `jwt` callback at sign-in
 * time) with no Prisma dependency. Without it, proxy.ts's NextAuth instance
 * would never see `session.user.role`, since the default session callback
 * doesn't know about our custom JWT claims, and every /admin request would
 * incorrectly bounce a real admin to the sign-in page.
 */
export default {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "CUSTOMER" | "ADMIN") ?? "CUSTOMER";
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;

      if (pathname.startsWith("/admin")) {
        return isLoggedIn && role === "ADMIN";
      }

      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
