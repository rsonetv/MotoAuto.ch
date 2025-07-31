"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Imię i nazwisko musi mieć co najmniej 2 znaki.",
  }),
  avatar: z.string().url({ message: "Proszę podać prawidłowy adres URL." }).optional(),
})

export async function updateProfile(values: z.infer<typeof profileFormSchema>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Użytkownik nie jest uwierzytelniony.")
  }

  const { error } = await supabase
    .from("users")
    .update({
      full_name: values.name,
      avatar_url: values.avatar,
    })
    .eq("id", user.id)

  if (error) {
    throw new Error(`Błąd podczas aktualizacji profilu: ${error.message}`)
  }

  revalidatePath("/dashboard/settings")
  return { message: "Profil został pomyślnie zaktualizowany." }
}

const passwordFormSchema = z.object({
  new_password: z.string().min(6, "Nowe hasło musi mieć co najmniej 6 znaków."),
})

export async function updatePassword(values: z.infer<typeof passwordFormSchema>) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: values.new_password,
  })

  if (error) {
    throw new Error(`Błąd podczas aktualizacji hasła: ${error.message}`)
  }

  return { message: "Hasło zostało pomyślnie zaktualizowane." }
}

const notificationsFormSchema = z.object({
  new_offers: z.boolean().default(false),
  bid_updates: z.boolean().default(true),
  newsletter: z.boolean().default(false),
})

export async function updateNotificationSettings(
  values: z.infer<typeof notificationsFormSchema>
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Użytkownik nie jest uwierzytelniony.")
  }

  const { error } = await supabase
    .from("notification_settings")
    .update({
      new_offers: values.new_offers,
      bid_updates: values.bid_updates,
      newsletter: values.newsletter,
    })
    .eq("user_id", user.id)

  if (error) {
    throw new Error(`Błąd podczas aktualizacji ustawień powiadomień: ${error.message}`)
  }

  revalidatePath("/dashboard/settings")
  return { message: "Ustawienia powiadomień zostały pomyślnie zaktualizowane." }
}