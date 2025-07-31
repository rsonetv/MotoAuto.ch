import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/auth/login');
  return user;
}