"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { loginSchema, registerSchema, resetPasswordSchema, updatePasswordSchema } from "@/lib/validations"
import { authRateLimit, registerRateLimit, resetPasswordRateLimit } from "@/lib/ratelimit"

export async function loginAction(formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1"

  // Rate limiting
  const { success } = await authRateLimit.limit(ip)
  if (!success) {
    return {
      error: "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.",
    }
  }

  // Validate form data
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      error: "Nieprawidłowe dane formularza",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        error: "Nieprawidłowy email lub hasło",
      }
    }
  } catch (error) {
    return {
      error: "Wystąpił błąd podczas logowania",
    }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function registerAction(formData: FormData) {
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

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
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
    success: "Sprawdź swoją skrzynkę email, aby potwierdzić konto",
  }
}

export async function resetPasswordAction(formData: FormData) {
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

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
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

export async function updatePasswordAction(formData: FormData) {
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  if (data.url) {
    redirect(data.url)
  }
}
