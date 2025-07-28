"use client"

import { useState } from "react"
import Image from "next/image"
import { User, PhoneCall, Mail, AlertCircle, CheckCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles?: {
    id: string;
    full_name: string | null;
    dealer_name: string | null;
    is_dealer: boolean;
    location: string | null;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

interface ContactPanelProps {
  listing: Listing;
}

export function ContactPanel({ listing }: ContactPanelProps) {
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const sellerName = listing.profiles?.is_dealer 
    ? listing.profiles.dealer_name 
    : listing.profiles?.full_name

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would implement the actual contact form submission
      // For demo purposes, we're just simulating a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      
      // Reset form
      setMessage("")
      setName("")
      setEmail("")
      setPhone("")
    } catch (error) {
      toast({
        title: "Błąd wysyłania wiadomości",
        description: "Spróbuj ponownie później lub skontaktuj się telefonicznie.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string | null, label: string) => {
    if (!text) return
    
    navigator.clipboard.writeText(text)
    toast({
      title: "Skopiowano do schowka",
      description: `${label}: ${text}`,
    })
  }

  return (
    <div className="space-y-4">
      {/* Seller Info */}
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={listing.profiles?.avatar_url || ""} alt={sellerName || "Sprzedający"} />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{sellerName || "Sprzedający"}</h3>
          <p className="text-sm text-muted-foreground">
            {listing.profiles?.is_dealer ? "Dealer" : "Sprzedawca prywatny"}
          </p>
        </div>
      </div>

      <Separator />

      {/* Contact Buttons */}
      {listing.profiles?.phone && (
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.location.href = `tel:${listing.profiles?.phone}`}
          >
            <PhoneCall className="mr-2 h-4 w-4" /> Zadzwoń
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => copyToClipboard(listing.profiles?.phone || null, "Telefon")}
          >
            <Copy className="mr-2 h-4 w-4" /> Kopiuj
          </Button>
        </div>
      )}

      {/* Contact Form */}
      {showSuccess ? (
        <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4 text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
          <h3 className="font-medium text-green-700 dark:text-green-300">Wiadomość wysłana</h3>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Sprzedający skontaktuje się z Tobą wkrótce.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Wiadomość</Label>
            <Textarea 
              id="message"
              placeholder="Jestem zainteresowany/a tym pojazdem. Proszę o kontakt."
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="name">Imię i nazwisko</Label>
            <Input 
              id="name"
              placeholder="Twoje imię i nazwisko"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              placeholder="twój@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input 
              id="phone"
              placeholder="Numer telefonu"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            <div className="flex items-start">
              <AlertCircle className="mr-1 h-3 w-3 mt-0.5 flex-shrink-0" />
              <p>
                Klikając przycisk "Wyślij", wyrażasz zgodę na przetwarzanie Twoich danych 
                osobowych w celu skontaktowania Cię ze sprzedającym.
              </p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
          </Button>
        </form>
      )}
    </div>
  )
}
