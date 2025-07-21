import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cache } from "react"
import type { User } from "@supabase/supabase-js"

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
