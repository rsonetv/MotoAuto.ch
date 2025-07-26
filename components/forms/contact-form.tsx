"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"

const contactSchema = z.object({
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Temat musi mieć co najmniej 5 znaków"),
  message: z.string().min(20, "Wiadomość musi mieć co najmniej 20 znaków"),
  inquiryType: z.enum(["general", "vehicle", "support", "dealer"]),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      inquiryType: "general",
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Contact form data:", data)
      toast.success("Wiadomość została wysłana! Odpowiemy w ciągu 24 godzin.")
      form.reset()
    } catch (error) {
      toast.error("Wystąpił błąd. Spróbuj ponownie.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Imię i nazwisko *</Label>
          <Input
            id="name"
            {...form.register("name")}
            className="mt-1"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className="mt-1"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            {...form.register("phone")}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="inquiryType">Typ zapytania</Label>
          <select
            {...form.register("inquiryType")}
            className="mt-1 w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="general">Ogólne pytanie</option>
            <option value="vehicle">Pytanie o pojazd</option>
            <option value="support">Wsparcie techniczne</option>
            <option value="dealer">Współpraca dealerska</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="subject">Temat *</Label>
        <Input
          id="subject"
          {...form.register("subject")}
          className="mt-1"
        />
        {form.formState.errors.subject && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.subject.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="message">Wiadomość *</Label>
        <Textarea
          id="message"
          {...form.register("message")}
          rows={6}
          className="mt-1"
          placeholder="Opisz szczegółowo swoje pytanie lub zapotrzebowanie..."
        />
        {form.formState.errors.message && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.message.message}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full md:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wysyłanie...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Wyślij wiadomość
          </>
        )}
      </Button>
    </form>
  )
}