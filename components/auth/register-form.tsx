"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { registerAction, signInWithOAuthAction } from "@/app/(auth)/actions"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Mail, Lock, User, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) {
    score += 25
  } else {
    feedback.push("Co najmniej 8 znaków")
  }

  if (/[A-Z]/.test(password)) {
    score += 25
  } else {
    feedback.push("Wielka litera")
  }

  if (/[a-z]/.test(password)) {
    score += 25
  } else {
    feedback.push("Mała litera")
  }

  if (/[0-9]/.test(password)) {
    score += 25
  } else {
    feedback.push("Cyfra")
  }

  let color = "bg-red-500"
  if (score >= 75) color = "bg-green-500"
  else if (score >= 50) color = "bg-yellow-500"
  else if (score >= 25) color = "bg-orange-500"

  return { score, feedback, color }
}

export default function RegisterForm() {
  const [state, action, isPending] = useActionState(registerAction, null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const emailRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const passwordStrength = calculatePasswordStrength(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  // Focus na pierwsze pole z błędem
  useEffect(() => {
    if (state?.fieldErrors) {
      if (state.fieldErrors.email) {
        emailRef.current?.focus()
      } else if (state.fieldErrors.name) {
        nameRef.current?.focus()
      }
    }
  }, [state?.fieldErrors])

  // Toast dla success/error messages
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    } else if (state?.success) {
      toast.success(state.success)
    }
  }, [state?.error, state?.success])

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      await signInWithOAuthAction(provider)
    } catch (error) {
      toast.error("Wystąpił błąd podczas rejestracji przez " + provider)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-lg mx-auto shadow-xl border-0">
        <CardHeader className="space-y-1 pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold text-primary">MotoAuto.ch</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center">Utwórz konto</h1>
          <p className="text-muted-foreground text-center">Dołącz do społeczności MotoAuto.ch</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OAuth Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 h-11 bg-transparent"
              onClick={() => handleOAuthSignIn("google")}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Zarejestruj przez Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 h-11 bg-transparent"
              onClick={() => handleOAuthSignIn("github")}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Zarejestruj przez GitHub</span>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Lub wypełnij formularz</span>
            </div>
          </div>

          {/* Error/Success Alerts */}
          {state?.error && (
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state?.success && (
            <Alert className="animate-in fade-in-50 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Imię i nazwisko</span>
              </Label>
              <Input
                ref={nameRef}
                id="name"
                name="name"
                type="text"
                placeholder="Jan Kowalski"
                required
                autoComplete="name"
                className={`transition-all duration-200 ${
                  state?.fieldErrors?.name ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                aria-describedby={state?.fieldErrors?.name ? "name-error" : undefined}
              />
              {state?.fieldErrors?.name && (
                <p id="name-error" className="text-sm text-destructive animate-in fade-in-50" role="alert">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Adres e-mail</span>
              </Label>
              <Input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                placeholder="twoj@email.com"
                required
                autoComplete="email"
                className={`transition-all duration-200 ${
                  state?.fieldErrors?.email ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                aria-describedby={state?.fieldErrors?.email ? "email-error" : undefined}
              />
              {state?.fieldErrors?.email && (
                <p id="email-error" className="text-sm text-destructive animate-in fade-in-50" role="alert">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Hasło</span>
              </Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Utwórz bezpieczne hasło"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`transition-all duration-200 ${
                  state?.fieldErrors?.password ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                aria-describedby={state?.fieldErrors?.password ? "password-error" : undefined}
              />
              {state?.fieldErrors?.password && (
                <p id="password-error" className="text-sm text-destructive animate-in fade-in-50" role="alert">
                  {state.fieldErrors.password[0]}
                </p>
              )}

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Progress value={passwordStrength.score} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {passwordStrength.score < 25 && "Słabe"}
                      {passwordStrength.score >= 25 && passwordStrength.score < 50 && "Średnie"}
                      {passwordStrength.score >= 50 && passwordStrength.score < 75 && "Dobre"}
                      {passwordStrength.score >= 75 && "Silne"}
                    </span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-xs text-muted-foreground">Brakuje: {passwordStrength.feedback.join(", ")}</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Potwierdź hasło</span>
              </Label>
              <div className="relative">
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Powtórz hasło"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`transition-all duration-200 ${
                    state?.fieldErrors?.confirmPassword
                      ? "border-destructive focus-visible:ring-destructive"
                      : confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-green-500 focus-visible:ring-green-500"
                          : "border-red-500 focus-visible:ring-red-500"
                        : ""
                  }`}
                  aria-describedby={state?.fieldErrors?.confirmPassword ? "confirm-password-error" : undefined}
                />
                {confirmPassword.length > 0 && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    {passwordsMatch ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {state?.fieldErrors?.confirmPassword && (
                <p id="confirm-password-error" className="text-sm text-destructive animate-in fade-in-50" role="alert">
                  {state.fieldErrors.confirmPassword[0]}
                </p>
              )}
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-sm text-red-500 animate-in fade-in-50" role="alert">
                  Hasła nie są identyczne
                </p>
              )}
            </div>

            <LoadingButton
              type="submit"
              className="w-full h-11 font-semibold"
              loading={isPending}
              disabled={isPending || passwordStrength.score < 75 || !passwordsMatch}
            >
              {isPending ? "Tworzenie konta..." : "Utwórz konto"}
            </LoadingButton>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          <div className="text-center text-sm text-muted-foreground">
            Masz już konto?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Zaloguj się
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <Link href="/polityka-prywatnosci" className="hover:underline">
              Polityka prywatności
            </Link>
            <span>•</span>
            <Link href="/regulamin" className="hover:underline">
              Regulamin
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
