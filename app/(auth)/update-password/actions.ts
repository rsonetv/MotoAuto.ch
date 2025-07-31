"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { redirect } from "next/navigation";

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków." }),
    confirm_password: z.string(),
    code: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Hasła nie są takie same.",
    path: ["confirm_password"],
  });

export async function updatePasswordAction(_prev: any, formData: FormData) {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { code, password } = parsed.data;
  const supabase = await createClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return { error: "Link do resetowania hasła jest nieprawidłowy lub wygasł." };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return { error: "Nie udało się zaktualizować hasła. Spróbuj ponownie." };
  }

  redirect("/auth/login?password-reset=true");
}