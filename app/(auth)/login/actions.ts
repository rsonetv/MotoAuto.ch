'use server';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations';
import { redirect } from 'next/navigation';

export async function loginAction(_prev: any, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    remember: formData.get('remember') === 'on',
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect('/dashboard');
}