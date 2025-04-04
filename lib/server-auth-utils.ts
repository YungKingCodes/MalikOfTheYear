'use server'

import { auth } from '@/auth'
import { type Session } from 'next-auth'

/**
 * Get the current session on the server
 * This function can only be used in Server Components or Route Handlers
 */
export async function getSession(): Promise<Session | null> {
  return await auth()
} 