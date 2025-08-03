'use client';
import { useActionState } from 'react';
import { registerAction } from '@/app/(auth)/register/actions';
import { LoadingButton } from '@/components/ui/loading-button';
import { PasswordInput } from '@/components/ui/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { OAuthButtons } from './OAuthButtons';

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, null);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Załóż konto</CardTitle>
        <CardDescription>Wprowadź swoje dane, aby się zarejestrować</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {state?.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Imię i nazwisko</Label>
          <Input id="full_name" name="full_name" required
            className={state?.fieldErrors?.full_name ? 'border-destructive' : ''} />
          {state?.fieldErrors?.full_name && (
            <p className="text-sm text-destructive">{state.fieldErrors.full_name[0]}</p>
          )}
        </div>

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
          <PasswordInput id="password" name="password" required
            className={state?.fieldErrors?.password ? 'border-destructive' : ''} />
          {state?.fieldErrors?.password && (
            <p className="text-sm text-destructive">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Potwierdź hasło</Label>
          <PasswordInput id="confirm_password" name="confirm_password" required
            className={state?.fieldErrors?.confirm_password ? 'border-destructive' : ''} />
          {state?.fieldErrors?.confirm_password && (
            <p className="text-sm text-destructive">{state.fieldErrors.confirm_password[0]}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="terms" name="terms" />
          <Label htmlFor="terms">Akceptuję regulamin</Label>
          {state?.fieldErrors?.terms && (
            <p className="text-sm text-destructive">{state.fieldErrors.terms[0]}</p>
          )}
        </div>

        <LoadingButton type="submit" className="w-full" loading={pending}>
          Zarejestruj się
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

        <div className="text-center text-sm">
          Masz już konto?{' '}
          <Link href="/auth/login" className="underline hover:text-primary">
            Zaloguj się
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}