"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { toast } from "sonner"

const contactSchema = z.object({
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Temat musi mieć co najmniej 5 znaków"),
  message: z.string().min(10, "Wiadomość musi mieć co najmniej 10 znaków")
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success("Wiadomość została wysłana pomyślnie!")
        reset()
      } else {
        throw new Error('Błąd podczas wysyłania wiadomości')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error("Błąd podczas wysyłania wiadomości. Spróbuj ponownie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Skontaktuj się z nami</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Masz pytania? Chcesz dowiedzieć się więcej o naszych usługach? 
              Jesteśmy tutaj, aby Ci pomóc.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Wyślij wiadomość</CardTitle>
                <CardDescription>
                  Wypełnij formularz, a odpowiemy najszybciej jak to możliwe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Imię i nazwisko *</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Jan Kowalski"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="jan@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="+41 XXX XXX XXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Temat *</Label>
                      <Input
                        id="subject"
                        {...register("subject")}
                        placeholder="W czym możemy pomóc?"
                      />
                      {errors.subject && (
                        <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Wiadomość *</Label>
                    <Textarea
                      id="message"
                      {...register("message")}
                      placeholder="Opisz szczegółowo swoją sprawę..."
                      rows={6}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Wysyłanie..." : "Wyślij wiadomość"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informacje kontaktowe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Adres</p>
                      <p className="text-muted-foreground">
                        MotoAuto.ch AG<br />
                        Bahnhofstrasse 1<br />
                        8001 Zürich, Szwajcaria
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a 
                        href="mailto:info@motoauto.ch" 
                        className="text-primary hover:underline"
                      >
                        info@motoauto.ch
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <a 
                        href="tel:+41431234567" 
                        className="text-primary hover:underline"
                      >
                        +41 43 123 45 67
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Godziny pracy</p>
                      <p className="text-muted-foreground">
                        Pon-Pt: 9:00 - 18:00<br />
                        Sob: 10:00 - 16:00<br />
                        Niedz: Zamknięte
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Lokalizacja</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Mapa Google</p>
                      <p className="text-sm text-muted-foreground">
                        Bahnhofstrasse 1, 8001 Zürich
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle>Często zadawane pytania</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Jak długo trwa weryfikacja konta?</h4>
                    <p className="text-sm text-muted-foreground">
                      Standardowa weryfikacja konta trwa 1-3 dni robocze.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Czy mogę zmienić pakiet w trakcie?</h4>
                    <p className="text-sm text-muted-foreground">
                      Tak, możesz zmienić pakiet w dowolnym momencie w panelu użytkownika.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Jak działa prowizja od aukcji?</h4>
                    <p className="text-sm text-muted-foreground">
                      Pobieramy 5% od ceny sprzedaży, maksymalnie 500 CHF.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}