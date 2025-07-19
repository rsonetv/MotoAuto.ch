import { supabase } from "@/lib/supabase/client"

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  email_verified?: boolean
  is_dealer?: boolean
  dealer_name?: string
  phone?: string
}

/**
 * Get current user with error handling
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // First check if we have a session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return null
    }

    if (!session?.user) {
      // No session is a normal state (user not logged in)
      return null
    }

    // Get user profile from our profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      // Return basic user info from auth if profile fetch fails
      return {
        id: session.user.id,
        email: session.user.email || "",
        full_name: session.user.user_metadata?.full_name,
        avatar_url: session.user.user_metadata?.avatar_url,
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name || undefined,
      avatar_url: profile.avatar_url || undefined,
      email_verified: profile.email_verified || false,
      is_dealer: profile.is_dealer || false,
      dealer_name: profile.dealer_name || undefined,
      phone: profile.phone || undefined,
    }
  } catch (error) {
    console.error("Unexpected error in getCurrentUser:", error)
    return null
  }
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, fullName?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
      },
    })

    if (error) {
      throw error
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

/**
 * Update user profile
 */
export async function updateProfile(updates: Partial<AuthUser>) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("No authenticated user")
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.full_name,
        phone: updates.phone,
        avatar_url: updates.avatar_url,
        is_dealer: updates.is_dealer,
        dealer_name: updates.dealer_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Update profile error:", error)
    throw error
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Reset password error:", error)
    throw error
  }
}
