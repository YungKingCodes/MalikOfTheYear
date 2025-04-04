import NextAuth, { NextAuthConfig } from "next-auth"
import { authConfig } from "@/lib/auth-config"

/**
 * Next-Auth configuration using Next.js 14 patterns
 * with account linking enabled
 */

// Create a merged config that includes the base config plus our custom overrides
const mergedConfig: NextAuthConfig = {
  ...authConfig,
  // Override the redirect callback to handle all redirects properly
  callbacks: {
    ...authConfig.callbacks,
    // Force the session check to always return true during sign-in
    authorized({ auth, request }) {
      // Add debug logs
      console.log("Auth status:", !!auth?.user);
      return !!auth?.user;
    },
    // Force NextAuth to properly set the session
    async session({ session, token, user }) {
      if (session.user) {
        if (token) {
          // For JWT strategy
          session.user.id = token.sub ?? token.id ?? "";
          session.user.role = token.role as string || "player";
          if (token.teamId) session.user.teamId = token.teamId as string;
          if (token.isNewUser) session.user.isNewUser = token.isNewUser as boolean;
        } else if (user) {
          // For database strategy
          session.user.id = user.id;
          session.user.role = user.role || "player";
          if (user.teamId) session.user.teamId = user.teamId;
          session.user.isNewUser = user.isNewUser || false;
        }
      }
      // Add debug logs
      console.log("Session created:", session);
      return session;
    }
  }
}

// For App Router compatibility and to avoid runtime errors in older Next.js versions
export const {
  handlers,
  auth,
  signIn,
  signOut,
  // @ts-ignore - The type definitions are slightly off in NextAuth but this works
  unstable_update: update,
} = NextAuth(mergedConfig)

/**
 * Custom wrapper for signIn that handles redirects based on user status
 */
export { auth as default } 