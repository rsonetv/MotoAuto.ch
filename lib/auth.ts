import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import type { User } from "@supabase/supabase-js"

export const createClient = cache(async () => {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
})

export const getUser = cache(async (): Promise<User | null> => {
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

export const getCurrentUser = cache(async (): Promise<User | null> => {
  return await getUser()
})

export const requireUser = cache(async (): Promise<User> => {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
})

export const requireAnonymous = cache(async (): Promise<void> => {
  const user = await getUser()
  if (user) {
    redirect("/dashboard")
  }
})

export const requireNoAuth = cache(async (): Promise<void> => {
  const user = await getUser()
  if (user) {
    redirect("/dashboard")
  }
})

export const signIn = async (email: string, password: string) => {
  const supabase = await createClient()
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signUp = async (email: string, password: string, options?: { data?: any }) => {
  const supabase = await createClient()
  return await supabase.auth.signUp({
    email,
    password,
    options,
  })
}

export const signOut = async () => {
  const supabase = await createClient()
  return await supabase.auth.signOut()
}

export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
})

export const updateProfile = async (userId: string, updates: any) => {
  const supabase = await createClient()
  return await supabase.from("profiles").update(updates).eq("id", userId)
}

export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getUser()
  if (!user) return false

  const profile = await getProfile(user.id)
  return profile?.role === "admin" || profile?.role === "super_admin"
})
