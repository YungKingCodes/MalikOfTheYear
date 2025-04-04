import { handlers } from "@/auth"

/**
 * NextAuth.js API route
 * 
 * This handles all authentication-related API requests
 * including OAuth callbacks, sign-in, sign-out, etc.
 */

// Using the Next.js 14 approach
export const { GET, POST } = handlers 