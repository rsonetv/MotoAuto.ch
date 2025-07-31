'use client';
import { useActionState } from 'react';
import { resetPasswordAction } from '@/app/(auth)/reset-password/actions';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, null);

  if (state?.success) {
    return (
      <Alert variant="success">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Wysłano!</AlertTitle>
        <AlertDescription>
          Sprawdź swoją skrzynkę e-mail, aby zresetować hasło.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Zresetuj hasło</h1>
        <p className="text-muted-foreground">
          Podaj swój e-mail, a wyślemy Ci link do resetu hasła.
        </p>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={state?.fieldErrors?.email ? 'border-destructive' : ''}
          />
          {state?.fieldErrors?.email && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <LoadingButton type="submit" className="w-full" loading={pending}>
          Wyślij link
        </LoadingButton>
      </form>

      <div className="text-center text-sm">
        <Link href="/auth/login" className="underline">
          Wróć do logowania
        </Link>
      </div>
    </div>
  );
}