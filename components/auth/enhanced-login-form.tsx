"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { loginAction } from "@/app/(auth)/actions"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function EnhancedLoginForm() {
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      setError("")

      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)

      const result = await loginAction(formData)

      if (result?.error) {
        setError(result.error)
        // Focus na pierwszym polu z błędem
        if (result.fieldErrors?.email) {
          setFocus("email")
        } else if (result.fieldErrors?.password) {
          setFocus("password")
        }
      }
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Zaloguj się do MotoAuto.ch</CardTitle>
        <CardDescription className="text-center">Wprowadź swoje dane, aby uzyskać dostęp do konta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adres e-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <PasswordInput
              id="password"
              placeholder="Wprowadź hasło"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm">
              Zapamiętaj mnie
            </Label>
          </div>

          <LoadingButton type="submit" className="w-full" loading={isPending}>
            Zaloguj się
          </LoadingButton>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          <Link
            href="/auth/reset-password"
            className="underline underline-offset-4 hover:text-primary transition-colors"
          >
            Zapomniałeś hasła?
          </Link>
        </div>
        <div className="text-sm text-center text-muted-foreground">
          Nie masz konta?{" "}
          <Link
            href="/auth/register"
            className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
          >
            Zarejestruj się
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
