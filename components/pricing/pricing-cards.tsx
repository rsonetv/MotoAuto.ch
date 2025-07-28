import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Darmowy",
    description: "Doskonały na start dla indywidualnych użytkowników.",
    price: "0",
    features: [
      "3 darmowe ogłoszenia miesięcznie",
      "Podstawowe zdjęcia",
      "Standardowa widoczność",
      "Wsparcie email",
    ],
  },
  {
    name: "Pro",
    description: "Idealne rozwiązanie dla aktywnych sprzedawców.",
    price: "99",
    popular: true,
    features: [
      "10 ogłoszeń miesięcznie",
      "Zdjęcia HD",
      "Wyróżnione ogłoszenia",
      "Priorytetowe wsparcie",
      "Statystyki ogłoszeń",
      "Powiadomienia SMS",
    ],
  },
  {
    name: "Dealer",
    description: "Dla profesjonalnych dealerów i firm.",
    price: "299",
    features: [
      "Nielimitowane ogłoszenia",
      "Zdjęcia HD + wideo",
      "Najwyższa widoczność",
      "Dedykowany opiekun",
      "API dla dealerów",
      "Integracja z CRM",
      "Własny profil dealera",
    ],
  },
]

export function PricingCards() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          className={cn(
            "flex flex-col",
            tier.popular && "border-primary shadow-lg"
          )}
        >
          <CardHeader>
            <CardTitle>{tier.name}</CardTitle>
            <CardDescription>{tier.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid flex-1 gap-4">
            <div className="text-3xl font-bold">
              {tier.price} PLN
              <span className="text-sm font-normal text-muted-foreground">
                /msc
              </span>
            </div>
            <div className="space-y-2">
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              {tier.price === "0" ? "Rozpocznij za darmo" : "Wybierz plan"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
