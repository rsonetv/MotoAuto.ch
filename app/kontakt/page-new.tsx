'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors: Partial<FormData> = {}
    if (!formData.name.trim()) newErrors.name = 'Imię jest wymagane'
    if (!formData.email.trim()) newErrors.email = 'Email jest wymagany'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Podaj poprawny adres email'
    if (!formData.subject.trim()) newErrors.subject = 'Temat jest wymagany'
    if (!formData.message.trim()) newErrors.message = 'Wiadomość jest wymagana'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Dziękujemy za wiadomość. Skontaktujemy się z Tobą wkrótce!')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setErrors({})
      } else {
        const data = await res.json()
        toast.error(data.message || 'Wystąpił błąd podczas wysyłania wiadomości.')
      }
    } catch (error) {
      toast.error('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kontakt</h1>
          <p className="text-xl text-gray-600">
            Masz pytania? Skontaktuj się z nami - chętnie pomożemy!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informacje kontaktowe */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Informacje kontaktowe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-600">kontakt@motoauto.ch</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Telefon</h3>
                    <p className="text-gray-600">+41 79 123 45 67</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Adres</h3>
                    <p className="text-gray-600">
                      Bahnhofstrasse 1<br />
                      8001 Zürich, Szwajcaria
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Godziny pracy</h3>
                    <p className="text-gray-600">
                      Pon-Pt: 9:00 - 18:00<br />
                      Sob: 10:00 - 16:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Najczęściej zadawane pytania</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Jak dodać ogłoszenie?</h4>
                  <p className="text-gray-600 text-sm">
                    Pierwsze ogłoszenie jest za darmo! Zarejestruj się i dodaj swoje pierwsze ogłoszenie bez opłat.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Jaka jest prowizja?</h4>
                  <p className="text-gray-600 text-sm">
                    Pobieramy 5% prowizji od sprzedaży, maksymalnie 500 CHF za transakcję.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Czy mogę edytować ogłoszenie?</h4>
                  <p className="text-gray-600 text-sm">
                    Tak, możesz edytować swoje ogłoszenia w panelu użytkownika w dowolnym momencie.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formularz kontaktowy */}
          <Card>
            <CardHeader>
              <CardTitle>Wyślij wiadomość</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Imię i nazwisko *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Temat *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={errors.subject ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <Label htmlFor="message">Wiadomość *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
