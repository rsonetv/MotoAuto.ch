import { cookies } from 'next/headers'
import { type CookieOptions } from '@supabase/ssr'

/**
 * Helper functions to work with cookies in server components and API routes
 * This handles the TypeScript errors with the cookies() API
 */

/**
 * Gets a cookie value by name from the cookie store
 */
export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value
}

/**
 * Sets a cookie in the cookie store
 */
export async function setCookie(name: string, value: string, options: CookieOptions): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set({ name, value, ...options })
  } catch (error) {
    console.error(`Failed to set cookie ${name}:`, error)
  }
}

/**
 * Removes a cookie from the cookie store
 */
export async function removeCookie(name: string, options: CookieOptions): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set({ name, value: '', ...options })
  } catch (error) {
    console.error(`Failed to remove cookie ${name}:`, error)
  }
}
