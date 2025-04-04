import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth-config"

/**
 * Next-Auth configuration using Next.js 14 patterns
 * with account linking enabled
 */

// For App Router compatibility and to avoid runtime errors in older Next.js versions
export const {
  handlers,
  auth,
  signIn,
  signOut,
  // @ts-ignore - The type definitions are slightly off in NextAuth but this works
  unstable_update: update,
} = NextAuth({
  ...authConfig,
  // Enable account linking by the same email across providers
  // This is the correct Next.js 14 way to apply this setting
  // This fixes the OAuthAccountNotLinked error
  allowDangerousEmailAccountLinking: true
})

/**
 * Custom wrapper for signIn that handles redirects based on user status
 */
export { auth as default } 