"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Star, Zap } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

const packages = [
  {
    id: "private",
    name: "Private Seller",
    description: "Dla sprzedawców prywatnych",
    price: 0,
    billingModel: "Pay-per-listing",
    listingLimit: "1 ogłoszenie",
    features: [
      "Pierwsze ogłoszenie za darmo",
      "Podstawowe funkcje",
      "Email support",
      "30 dni wyświetlania"
    ],
    icon: <Star className="h-5 w-5" />,
    popular: false
  },
  {
    id: "dealer-lite",
    name: "Dealer Lite",
    description: "Podstawowy pakiet dla dealerów",
    price: 50,
    billingModel: "Subscription",
    listingLimit: "≤10 ogłoszeń",
    features: [
      "Do 10 aktywnych ogłoszeń",
      "Wsparcie email",
      "Podstawowe statystyki",
      "60 dni wyświetlania",
      "Logo dealera"
    ],
    icon: <Zap className="h-5 w-5" />,
    popular: false
  },
  {
    id: "dealer-starter",
    name: "Dealer Starter",
    description: "Rozszerzony pakiet dla dealerów",
    price: 100,
    billingModel: "Subscription",
    listingLimit: "≤25 ogłoszeń",
    features: [
      "Do 25 aktywnych ogłoszeń",
      "Priorytetowe wsparcie",
      "Zaawansowane statystyki",
      "90 dni wyświetlania",
      "Promocyjne wyróżnienie",
      "CSV eksport"
    ],
    icon: <Crown className="h-5 w-5" />,
    popular: true
  },
  {
    id: "dealer-pro",
    name: "Dealer Pro",
    description: "Profesjonalny pakiet",
    price: 300,
    billingModel: "Subscription",
    listingLimit: "≤50 ogłoszeń",
    features: [
      "Do 50 aktywnych ogłoszeń",
      "Dedykowany manager",
      "Analityka premium",
      "120 dni wyświetlania",
      "Automatyczne odnawianie",
      "API access (beta)",
      "Social media integration"
    ],
    icon: <Crown className="h-5 w-5" />,
    popular: false
  },
  {
    id: "dealer-enterprise",
    name: "Dealer Enterprise",
    description: "Pakiet dla dużych dealerów",
    price: 800,
    billingModel: "Subscription",
    listingLimit: "Unlimited + Boost",
    features: [
      "Nielimitowane ogłoszenia",
      "Dedykowane wsparcie 24/7",
      "Custom branding",
      "White-label solution",
      "Advanced API access",
      "Bulk import/export",
      "Custom integrations",
      "Priority listing boost"
    ],
    icon: <Crown className="h-5 w-5" />,
    popular: false
  }
]

const additionalServices = [
  {
    name: "Premium Listing",
    description: "Wyróżnienie ogłoszenia na 7 dni",
    price: 20,
    unit: "7 dni"
  },
  {
    name: "Sponsored Search",
    description: "Reklama w wynikach wyszukiwania",
    price: 15,
    unit: "CPM"
  },
  {
    name: "Public Auction",
    description: "Prowizja od sprzedaży",
    price: 5,
    unit: "% (max 500 CHF)"
  },
  {
    name: "Insurance Blind Auction",
    description: "Prowizja od sprzedaży ubezpieczeniowej",
    price: 3,
    unit: "% (max 1,000 CHF)"
  }
]

export default function PricingClient() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const locale = params.locale

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId)
    router.push(`/${locale}/dashboard/payments?package=${packageId}`)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Cennik MotoAuto.ch</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Wybierz pakiet dopasowany do Twoich potrzeb. Wszystkie ceny netto w CHF.
            </p>
          </div>

          {/* Pakiety główne */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative ${pkg.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Najpopularniejszy
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {pkg.icon}
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  </div>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{pkg.price}</span>
                    <span className="text-muted-foreground">CHF</span>
                    {pkg.price > 0 && (
                      <span className="text-sm text-muted-foreground">/miesiąc</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pkg.listingLimit} • {pkg.billingModel}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handleSelectPackage(pkg.id)}
                  >
                    {pkg.price === 0 ? "Rozpocznij za darmo" : "Wybierz pakiet"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usługi dodatkowe */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Usługi dodatkowe</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {additionalServices.map((service, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{service.price}</span>
                      <span className="text-sm text-muted-foreground">
                        {service.unit}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tabela porównawcza */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Szczegółowe porównanie</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">Segment</th>
                    <th className="border border-border p-3 text-left">Package</th>
                    <th className="border border-border p-3 text-left">Listing Limit</th>
                    <th className="border border-border p-3 text-left">Billing Model</th>
                    <th className="border border-border p-3 text-left">Monthly Price (net)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Private seller</td>
                    <td className="border border-border p-3">Listing #1</td>
                    <td className="border border-border p-3">1</td>
                    <td className="border border-border p-3">Pay-per-listing</td>
                    <td className="border border-border p-3">0 CHF</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border p-3">"</td>
                    <td className="border border-border p-3">Listing #2–#5</td>
                    <td className="border border-border p-3">4</td>
                    <td className="border border-border p-3">Pay-per-listing</td>
                    <td className="border border-border p-3">2–5 CHF</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">"</td>
                    <td className="border border-border p-3">Listing #6+</td>
                    <td className="border border-border p-3">∞</td>
                    <td className="border border-border p-3">Pay-per-listing</td>
                    <td className="border border-border p-3">8 CHF</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border p-3">Dealer</td>
                    <td className="border border-border p-3">Lite</td>
                    <td className="border border-border p-3">≤10 ads</td>
                    <td className="border border-border p-3">Subscription</td>
                    <td className="border border-border p-3">50 CHF</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Dealer</td>
                    <td className="border border-border p-3">Starter</td>
                    <td className="border border-border p-3">≤25 ads</td>
                    <td className="border border-border p-3">Subscription</td>
                    <td className="border border-border p-3">100 CHF</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border p-3">Dealer</td>
                    <td className="border border-border p-3">Pro</td>
                    <td className="border border-border p-3">≤50 ads</td>
                    <td className="border border-border p-3">Subscription</td>
                    <td className="border border-border p-3">300 CHF</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Dealer</td>
                    <td className="border border-border p-3">Enterprise</td>
                    <td className="border border-border p-3">Unlimited + Boost</td>
                    <td className="border border-border p-3">Subscription</td>
                    <td className="border border-border p-3">800 CHF</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border p-3">Auction</td>
                    <td className="border border-border p-3">Public auction</td>
                    <td className="border border-border p-3">-</td>
                    <td className="border border-border p-3">Success Fee</td>
                    <td className="border border-border p-3">5% (cap 500 CHF)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Insurance</td>
                    <td className="border border-border p-3">Blind auction</td>
                    <td className="border border-border p-3">-</td>
                    <td className="border border-border p-3">Success Fee</td>
                    <td className="border border-border p-3">3% (cap 1,000 CHF)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Masz pytania?</h2>
            <p className="text-muted-foreground mb-6">
              Skontaktuj się z nami, aby uzyskać więcej informacji o naszych pakietach.
            </p>
            <Button variant="outline" onClick={() => router.push('/contact')}>
              Skontaktuj się z nami
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
