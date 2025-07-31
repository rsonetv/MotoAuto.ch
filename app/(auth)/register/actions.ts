'use server';
import { createClient } from '@/lib/supabase/server';
import { registerSchema } from '@/lib/validations';
import { redirect } from 'next/navigation';

export async function registerAction(_prev: any, formData: FormData) {
  const parsed = registerSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
    terms: formData.get('terms') === 'on',
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { email, password, full_name } = parsed.data;
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name }, emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback` },
  });
  if (error) return { error: error.message };

  redirect('/auth/login?verify=1');
}