"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { auth, type AuthUser } from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    auth.getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data } = auth.onAuthStateChange((usr) => {
      setUser(usr)
      setLoading(false)
    })

    const subscription = data?.subscription

    return () => subscription?.unsubscribe?.()
  }, [])

  const signIn = async (email: string, password: string) => {
    await auth.signIn(email, password)
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    await auth.signUp(email, password, fullName)
  }

  const signOut = async () => {
    await auth.signOut()
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
