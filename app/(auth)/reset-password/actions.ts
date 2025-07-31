'use server';
import { createClient } from '@/lib/supabase/server';
import { resetPasswordSchema } from '@/lib/validations';

export async function resetPasswordAction(_prev: any, formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXTAUTH_URL}/auth/update-password`,
  });
  if (error) return { error: error.message };
  return { success: true };
}