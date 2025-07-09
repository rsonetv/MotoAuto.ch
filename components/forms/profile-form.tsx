"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { User, Mail, Phone, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/hooks/use-auth"
import { auth } from "@/lib/auth"

const profileSchema = z.object({
  fullName: z.string().min(2, "Imię i nazwisko musi mieć co najmniej 2 znaki"),
  email: z.string().email("Wprowadź prawidłowy adres email"),
  phone: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (user) {
      setValue("fullName", user.profile?.full_name || "")
      setValue("email", user.email || "")
      setValue("phone", user.profile?.phone || "")
    }
  }, [user, setValue])

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await auth.updateProfile({
        full_name: data.fullName,
        phone: data.phone,
      })
      setSuccess("Profil został zaktualizowany pomyślnie!")
    } catch (error: any) {
      setError(error.message || "Wystąpił błąd podczas aktualizacji profilu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane osobowe</CardTitle>
        <CardDescription>Zaktualizuj swoje dane osobowe i informacje kontaktowe.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="fullName">Imię i nazwisko</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input id="fullName" type="text" placeholder="Jan Kowalski" className="pl-12" {...register("fullName")} />
            </div>
            {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adres email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="jan@example.com"
                className="pl-12"
                {...register("email")}
                disabled
              />
            </div>
            <p className="text-sm text-gray-500">
              Adres email nie może być zmieniony. Skontaktuj się z obsługą klienta.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Numer telefonu (opcjonalnie)</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input id="phone" type="tel" placeholder="+41 44 123 45 67" className="pl-12" {...register("phone")} />
            </div>
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}
