import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth-config"

/**
 * Next-Auth configuration using Next.js 14 patterns
 */

// For App Router compatibility and to avoid runtime errors in older Next.js versions
export const {
  handlers,
  auth,
  signIn,
  signOut,
  // @ts-ignore - The type definitions are slightly off in NextAuth but this works
  unstable_update: update,
} = NextAuth(authConfig)

/**
 * Custom wrapper for signIn that handles redirects based on user status
 */
export { auth as default } 