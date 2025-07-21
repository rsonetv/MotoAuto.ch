"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations"
import { resetPasswordAction } from "@/app/(auth)/actions"

export function ResetForm() {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = (data: ResetPasswordFormData) => {
    startTransition(async () => {
      setError("")
      setSuccess("")

      const formData = new FormData()
      formData.append("email", data.email)

      const result = await resetPasswordAction(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.success)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Resetuj hasło</h1>
        <p className="text-muted-foreground">Wprowadź swój email, aby otrzymać link do resetowania hasła</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wysyłanie...
            </>
          ) : (
            "Wyślij link resetujący"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Pamiętasz hasło?{" "}
        <a href="/auth/login" className="text-primary underline-offset-4 hover:underline">
          Zaloguj się
        </a>
      </div>
    </div>
  )
}
