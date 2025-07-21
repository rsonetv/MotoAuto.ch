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
import { registerSchema, type RegisterFormData } from "@/lib/validations"
import { registerAction } from "@/app/(auth)/actions"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import Link from "next/link"

export function EnhancedRegisterForm() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setFocus,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  const onSubmit = (data: RegisterFormData) => {
    startTransition(async () => {
      setError("")
      setSuccess("")

      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("confirmPassword", data.confirmPassword)

      const result = await registerAction(formData)

      if (result?.error) {
        setError(result.error)
        // Focus na pierwszym polu z błędem
        if (result.fieldErrors?.name) {
          setFocus("name")
        } else if (result.fieldErrors?.email) {
          setFocus("email")
        } else if (result.fieldErrors?.password) {
          setFocus("password")
        }
      } else if (result?.success) {
        setSuccess(result.success)
      }
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Dołącz do MotoAuto.ch</CardTitle>
        <CardDescription className="text-center">Utwórz konto, aby zacząć kupować i sprzedawać pojazdy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Imię i nazwisko</Label>
            <Input
              id="name"
              placeholder="Jan Kowalski"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

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
              placeholder="Utwórz bezpieczne hasło"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
            {password && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  <span>Hasło musi zawierać:</span>
                </div>
                <ul className="ml-5 space-y-0.5">
                  <li className={password.length >= 8 ? "text-green-600" : ""}>✓ Minimum 8 znaków</li>
                  <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>✓ Wielką literę</li>
                  <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>✓ Małą literę</li>
                  <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>✓ Cyfrę</li>
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Powtórz hasło"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" required />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              Akceptuję{" "}
              <Link href="/regulamin" className="underline underline-offset-4 hover:text-primary" target="_blank">
                regulamin
              </Link>{" "}
              i{" "}
              <Link
                href="/polityka-prywatnosci"
                className="underline underline-offset-4 hover:text-primary"
                target="_blank"
              >
                politykę prywatności
              </Link>
            </Label>
          </div>

          <LoadingButton type="submit" className="w-full" loading={isPending}>
            Utwórz konto
          </LoadingButton>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center text-muted-foreground w-full">
          Masz już konto?{" "}
          <Link
            href="/auth/login"
            className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
          >
            Zaloguj się
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
