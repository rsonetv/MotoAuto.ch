"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { auth } from "@/lib/auth"

const forgotPasswordSchema = z.object({
  email: z.string().email("Wprowadź prawidłowy adres email"),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    setError(null)

    try {
      await auth.resetPassword(data.email)
      setIsSuccess(true)
    } catch (error: any) {
      setError(error.message || "Wystąpił błąd podczas wysyłania emaila")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    const email = getValues("email")
    if (email) {
      await onSubmit({ email })
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Email wysłany!</CardTitle>
          <CardDescription>Sprawdź swoją skrzynkę pocztową i kliknij w link resetujący hasło.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Email został wysłany na adres: <strong>{getValues("email")}</strong>
            </AlertDescription>
          </Alert>
          <p className="text-sm text-gray-600 text-center">
            Nie otrzymałeś emaila? Sprawdź folder spam lub{" "}
            <button
              onClick={handleResendEmail}
              className="text-blue-600 hover:text-blue-500 underline"
              disabled={isLoading}
            >
              wyślij ponownie
            </button>
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do logowania
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resetuj hasło</CardTitle>
        <CardDescription>Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Adres email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input id="email" type="email" placeholder="twoj@email.com" className="pl-12" {...register("email")} />
            </div>
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do logowania
            </Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
