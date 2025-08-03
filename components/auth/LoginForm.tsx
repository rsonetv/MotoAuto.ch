'use client';
import { useActionState, useState } from 'react';
import { loginAction } from '@/app/(auth)/login/actions';
import { LoadingButton } from '@/components/ui/loading-button';
import { PasswordInput } from '@/components/ui/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HCaptcha } from '@/components/ui/hcaptcha';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { OAuthButtons } from './OAuthButtons';

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleSubmit = (formData: FormData) => {
    // Add captcha token to form data
    formData.append('captcha', captchaToken);
    action(formData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Zaloguj się</CardTitle>
        <CardDescription>Wprowadź swoje dane logowania</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {state?.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required autoComplete="email"
            className={state?.fieldErrors?.email ? 'border-destructive' : ''} />
          {state?.fieldErrors?.email && (
            <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <PasswordInput id="password" name="password" required autoComplete="current-password"
            className={state?.fieldErrors?.password ? 'border-destructive' : ''} />
          {state?.fieldErrors?.password && (
            <p className="text-sm text-destructive">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" name="remember" />
          <Label htmlFor="remember">Zapamiętaj mnie</Label>
        </div>

        <div className="space-y-2">
          <HCaptcha
            siteKey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001'}
            onVerify={handleCaptchaVerify}
            theme="light"
            size="normal"
            className="flex justify-center"
          />
          {state?.fieldErrors?.captcha && (
            <p className="text-sm text-destructive">{state.fieldErrors.captcha[0]}</p>
          )}
        </div>

        <LoadingButton 
          type="submit" 
          className="w-full" 
          loading={pending}
          disabled={!captchaToken || pending}
        >
          Zaloguj się
        </LoadingButton>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Lub kontynuuj za pomocą
          </span>
        </div>
      </div>

      <OAuthButtons />

        <div className="flex justify-between text-sm">
          <Link href="/auth/reset-password" className="underline hover:text-primary">Nie pamiętasz hasła?</Link>
          <Link href="/auth/register" className="underline hover:text-primary">Załóż konto</Link>
        </div>
      </CardContent>
    </Card>
  );
}