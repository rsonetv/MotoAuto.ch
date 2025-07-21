"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { loginAction } from "@/app/(auth)/actions"
import { OAuthButton } from "./oauth-button"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Zaloguj się</h1>
        <p className="text-muted-foreground">Wprowadź swoje dane, aby zalogować się do konta</p>
      </div>

      {error && (
        <Alert variant="destructive">
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
            {...register("email")}
            disabled={isPending}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="text-sm text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Wprowadź hasło"
              {...register("password")}
              disabled={isPending}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
              aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logowanie...
            </>
          ) : (
            "Zaloguj się"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Lub kontynuuj z</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <OAuthButton provider="google" />
        <OAuthButton provider="github" />
      </div>

      <div className="text-center text-sm">
        <a href="/auth/reset-password" className="text-primary underline-offset-4 hover:underline">
          Zapomniałeś hasła?
        </a>
      </div>

      <div className="text-center text-sm">
        Nie masz konta?{" "}
        <a href="/auth/register" className="text-primary underline-offset-4 hover:underline">
          Zarejestruj się
        </a>
      </div>
    </div>
  )
}
