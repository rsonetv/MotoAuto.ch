"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { loginAction } from "@/app/(auth)/actions"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
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
        <CardTitle className="text-2xl font-bold text-center">Zaloguj się</CardTitle>
        <CardDescription className="text-center">Wprowadź swoje dane logowania</CardDescription>
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
            <Label htmlFor="email">Email</Label>
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

          <LoadingButton type="submit" className="w-full" loading={isPending}>
            Zaloguj się
          </LoadingButton>
        </form>

        <div className="text-center">
          <Link
            href="/auth/reset-password"
            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            Zapomniałeś hasła?
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
