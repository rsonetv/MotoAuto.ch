"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres e-mail." }),
});

export async function resetPasswordAction(_prev: any, formData: FormData) {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXTAUTH_URL}/auth/update-password`,
  });

  if (error) {
    // Don't reveal if the user exists or not.
    console.error("Reset password error:", error.message);
    // Return a generic success message to prevent user enumeration attacks
    return { success: true };
  }

  return { success: true };
}