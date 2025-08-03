'use server';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations';
import { redirect } from 'next/navigation';
import { env } from '@/lib/env';

async function verifyHCaptcha(token: string): Promise<boolean> {
  const secretKey = env.HCAPTCHA_SECRET_KEY;
  
  console.log('🔍 HCaptcha verification started');
  console.log('🔑 Secret key configured:', !!secretKey);
  console.log('🎫 Token received:', token ? 'Yes' : 'No');
  
  if (!secretKey) {
    console.error('❌ HCAPTCHA_SECRET_KEY not configured');
    return false;
  }

  try {
    console.log('📡 Making request to hCaptcha API...');
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();
    console.log('📊 HCaptcha API Response:', data);
    return data.success === true;
  } catch (error) {
    console.error('❌ HCaptcha verification error:', error);
    return false;
  }
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    remember: formData.get('remember') === 'on',
    captcha: formData.get('captcha'),
  });
  
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password, captcha } = parsed.data;

  // Verify hCaptcha - TEMPORARILY DISABLED
  // const captchaValid = await verifyHCaptcha(captcha);
  // if (!captchaValid) {
  //   return { 
  //     fieldErrors: { 
  //       captcha: ['Weryfikacja captcha nie powiodła się. Spróbuj ponownie.'] 
  //     } 
  //   };
  // }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect('/dashboard');
}