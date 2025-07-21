import { createClient } from "@/lib/supabase/server"
import { createClient as createClientClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import { cache } from "react"

// Server-side auth helpers
export const getUser = cache(async () => {
  const supabase = await createClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error:", error)
    return null
  }
})

export const getSession = cache(async () => {
  const supabase = await createClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error:", error)
    return null
  }
})

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireGuest() {
  const user = await getUser()
  if (user) {
    redirect("/dashboard")
  }
}

// Client-side auth helpers
export function useSupabaseClient() {
  return createClientClient()
}

// Profile helpers
export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function updateUserProfile(userId: string, updates: any) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating profile:", error)
    return { error: error.message }
  }

  return { data }
}

// Email verification helpers
export async function resendEmailVerification(email: string) {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Email weryfikacyjny został wysłany ponownie" }
}

// Password strength checker
export function checkPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const score = Object.values(checks).filter(Boolean).length
  const strength = score < 2 ? "weak" : score < 4 ? "medium" : "strong"

  return {
    score,
    strength,
    checks,
    isValid: score >= 4,
  }
}

// Session management
export async function refreshSession() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.refreshSession()

  if (error) {
    console.error("Error refreshing session:", error)
    return null
  }

  return data.session
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
