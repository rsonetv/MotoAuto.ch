"use client"

import { useActionState } from "react"
import { loginAction } from "@/app/(auth)/actions"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null)

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Zaloguj się do MotoAuto.ch</h1>
        <p className="text-muted-foreground">Wprowadź swoje dane logowania</p>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="twoj@email.com" required autoComplete="email" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Wprowadź hasło"
            required
            autoComplete="current-password"
          />
        </div>

        <LoadingButton type="submit" className="w-full" loading={isPending}>
          Zaloguj się
        </LoadingButton>
      </form>

      <div className="text-center space-y-2">
        <Link href="/auth/reset-password" className="text-sm text-muted-foreground hover:text-primary underline">
          Zapomniałeś hasła?
        </Link>
        <div className="text-sm text-muted-foreground">
          Nie masz konta?{" "}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            Zarejestruj się
          </Link>
        </div>
      </div>
    </div>
  )
}
