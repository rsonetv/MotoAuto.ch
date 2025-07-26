import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, HelpCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PricingPackage } from "@/types"

// Mock pricing data
const pricingPackages: Record<string, PricingPackage[]> = {
  private: [
    {
      id: "private-basic",
      name: "Basic",
      segment: "private",
      listingLimit: 2,
      billingModel: "pay-per-listing",
      pricePerListing: 2,
      features: [
        "2 ogłoszenie",
        "Podstawowe statystyki ogłoszeń",
        "Ogłoszenia aktywne przez 30 dni",
        "Podstawowe zdjęcia (max 5)",
      ],
    },
    {
      id: "private-plus",
      name: "Plus",
      segment: "private",
      listingLimit: 3,
      billingModel: "pay-per-listing",
      pricePerListing: 3,
      features: [
        "3 ogłoszenie",
        "Wyróżnione ogłoszenia",
        "Ogłoszenia aktywne przez 60 dni",
        "Do 10 zdjęć wysokiej jakości",
        "Dostęp do aukcji",
        "Priorytetowe wyświetlanie",
      ],
      isPopular: true,
    },
    {
      id: "private-premium",
      name: "Premium",
      segment: "private",
      listingLimit: 10,
      billingModel: "subscription",
      monthlyPrice: 39.90,
      features: [
        "Do 10 ogłoszeń jednocześnie",
        "Wyróżnione ogłoszenia",
        "Ogłoszenia bez limitu czasowego",
        "Nieograniczona liczba zdjęć HD",
        "Dostęp do aukcji",
        "Priorytetowe wyświetlanie",
        "Wsparcie premium 7 dni w tygodniu",
      ],
    },
  ],
  dealer: [
    {
      id: "dealer-starter",
      name: "Starter",
      segment: "dealer",
      listingLimit: 20,
      billingModel: "subscription",
      monthlyPrice: 99,
      features: [
        "Do 20 ogłoszeń jednocześnie",
        "Profil dealera",
        "Podstawowe statystyki",
        "Ogłoszenia aktywne przez 60 dni",
        "Do 15 zdjęć na ogłoszenie",
      ],
    },
    {
      id: "dealer-pro",
      name: "Professional",
      segment: "dealer",
      listingLimit: 50,
      billingModel: "subscription",
      monthlyPrice: 199,
      features: [
        "Do 50 ogłoszeń jednocześnie",
        "Rozszerzony profil dealera",
        "Zaawansowane statystyki i raporty",
        "Ogłoszenia bez limitu czasowego",
        "Nieograniczona liczba zdjęć HD",
        "Dostęp do aukcji",
        "Priorytetowe wyświetlanie",
        "Dedykowany opiekun klienta",
      ],
      isPopular: true,
    },
    {
      id: "dealer-enterprise",
      name: "Enterprise",
      segment: "dealer",
      listingLimit: "unlimited",
      billingModel: "subscription",
      monthlyPrice: 399,
      features: [
        "Nieograniczona liczba ogłoszeń",
        "Pełny profil dealera z galerią",
        "Zaawansowane statystyki i raporty",
        "Ogłoszenia bez limitu czasowego",
        "Nieograniczona liczba zdjęć HD",
        "Dostęp do aukcji premium",
        "Najwyższy priorytet wyświetlania",
        "Dedykowany opiekun klienta 24/7",
        "API do integracji z systemami dealera",
        "Eksport danych i raportów",
      ],
    },
  ],
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <Breadcrumbs 
            items={[
              { label: "Cennik" }
            ]}
            className="mb-6"
          />
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Wybierz plan idealny dla Ciebie</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Oferujemy elastyczne plany cenowe dostosowane do potrzeb zarówno prywatnych sprzedawców, jak i profesjonalnych dealerów.
            </p>
          </div>

          <Tabs defaultValue="private" className="mb-12">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="private">Klienci indywidualni</TabsTrigger>
                <TabsTrigger value="dealer">Dealerzy</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="private">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPackages.private.map((pkg) => (
                  <PricingCard key={pkg.id} package={pkg} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="dealer">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPackages.dealer.map((pkg) => (
                  <PricingCard key={pkg.id} package={pkg} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-muted rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Potrzebujesz indywidualnej oferty?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Skontaktuj się z naszym zespołem, aby omówić spersonalizowane rozwiązania dla Twojej firmy.
            </p>
            <Button asChild size="lg">
              <a href="/contact">Skontaktuj się z nami</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

interface PricingCardProps {
  package: PricingPackage
}

function PricingCard({ package: pkg }: PricingCardProps) {
  return (
    <Card className={`flex flex-col h-full ${pkg.isPopular ? 'border-brand shadow-lg relative' : ''}`}>
      {pkg.isPopular && (
        <div className="absolute top-0 right-0 bg-brand text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
          Najpopularniejszy
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{pkg.name}</CardTitle>
        <CardDescription>
          {pkg.segment === "private" ? "Dla klientów indywidualnych" : "Dla dealerów"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <div className="flex items-end">
            {pkg.billingModel === "pay-per-listing" && pkg.pricePerListing === 0 ? (
              <span className="text-4xl font-bold">Za darmo</span>
            ) : (
              <>
                <span className="text-4xl font-bold">
                  {pkg.monthlyPrice ? `${pkg.monthlyPrice.toFixed(2)}` : 
                   pkg.pricePerListing ? `${pkg.pricePerListing}` : ""}
                </span>
                <span className="text-muted-foreground ml-2">
                  {pkg.billingModel === "subscription" ? "CHF / miesiąc" : 
                   pkg.billingModel === "pay-per-listing" ? "CHF / ogłoszenie" : ""}
                </span>
              </>
            )}
          </div>
          <div className="mt-2 text-muted-foreground">
            {typeof pkg.listingLimit === "number" 
              ? `Limit: ${pkg.listingLimit} ogłoszeń` 
              : "Bez limitu ogłoszeń"}
          </div>
        </div>
        
        <ul className="space-y-3">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-brand shrink-0 mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${pkg.isPopular ? 'bg-brand hover:bg-brand/90' : ''}`}
          variant={pkg.isPopular ? "default" : "outline"}
        >
          Wybierz plan
        </Button>
      </CardFooter>
    </Card>
  )
}