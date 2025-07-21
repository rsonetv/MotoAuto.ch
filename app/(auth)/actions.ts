"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { loginSchema, registerSchema, resetPasswordSchema, updatePasswordSchema } from "@/lib/validations"
import { authRateLimit, registerRateLimit, resetPasswordRateLimit } from "@/lib/ratelimit"

export async function loginAction(prevState: any, formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1"

  // Rate limiting
  const { success } = await authRateLimit.limit(ip)
  if (!success) {
    return {
      error: "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.",
    }
  }

  // Validate form data - dodano obsługę "remember"
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on", // checkbox handling
  })

  if (!validatedFields.success) {
    return {
      error: "Nieprawidłowe dane formularza",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, remember } = validatedFields.data
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Sprawdzenie czy email jest zweryfikowany
      if (error.message.includes("email not confirmed")) {
        return {
          error: "Potwierdź swój adres e-mail przed zalogowaniem",
        }
      }
      return {
        error: "Nieprawidłowy e-mail lub hasło",
      }
    }

    // Obsługa "Zapamiętaj mnie" - ustaw dłuższą sesję
    if (remember && data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })
    }
  } catch (error) {
    return {
      error: "Wystąpił błąd podczas logowania",
    }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function registerAction(prevState: any, formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1"

  // Rate limiting
  const { success } = await registerRateLimit.limit(ip)
  if (!success) {
    return {
      error: "Zbyt wiele prób rejestracji. Spróbuj ponownie za godzinę.",
    }
  }

  // Validate form data
  const validatedFields = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    name: formData.get("name"),
  })

  if (!validatedFields.success) {
    return {
      error: "Nieprawidłowe dane formularza",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, name } = validatedFields.data
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: name,
        },
      },
    })

    if (error) {
      if (error.message.includes("already registered")) {
        return {
          error: "Użytkownik z tym adresem email już istnieje",
        }
      }
      return {
        error: error.message,
      }
    }
  } catch (error) {
    return {
      error: "Wystąpił błąd podczas rejestracji",
    }
  }

  return {
    success: "Sprawdź swoją skrzynkę email i kliknij link weryfikacyjny",
  }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1"

  // Rate limiting
  const { success } = await resetPasswordRateLimit.limit(ip)
  if (!success) {
    return {
      error: "Zbyt wiele prób resetowania hasła. Spróbuj ponownie za godzinę.",
    }
  }

  // Validate form data
  const validatedFields = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      error: "Nieprawidłowy email",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/update-password`,
    })

    if (error) {
      return {
        error: error.message,
      }
    }
  } catch (error) {
    return {
      error: "Wystąpił błąd podczas resetowania hasła",
    }
  }

  return {
    success: "Sprawdź swoją skrzynkę email, aby zresetować hasło",
  }
}

export async function updatePasswordAction(prevState: any, formData: FormData) {
  // Validate form data
  const validatedFields = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    return {
      error: "Nieprawidłowe dane formularza",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password } = validatedFields.data
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return {
        error: error.message,
      }
    }
  } catch (error) {
    return {
      error: "Wystąpił błąd podczas aktualizacji hasła",
    }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

export async function signInWithOAuthAction(provider: "google" | "github") {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) throw error
  redirect(data.url)
}
