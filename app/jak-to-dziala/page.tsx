"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Search,
  Upload,
  Eye,
  Shield,
  CreditCard,
  Gavel,
  Users,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  Star,
  Zap
} from "lucide-react"

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState("general")

  const steps = [
    {
      icon: <Upload className="h-8 w-8" />,
      title: "Dodaj ogłoszenie",
      description: "Stwórz atrakcyjne ogłoszenie z wysokiej jakości zdjęciami i szczegółowym opisem pojazdu."
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Otrzymuj zapytania",
      description: "Potencjalni kupujący kontaktują się z Tobą bezpośrednio przez naszą platformę."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Bezpieczna transakcja",
      description: "Zawieraj umowy i przeprowadzaj transakcje w bezpieczny sposób."
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Finalizacja sprzedaży",
      description: "Przekaż pojazd nowemu właścicielowi i ciesz się udaną sprzedażą."
    }
  ]

  const auctionSteps = [
    {
      icon: <Gavel className="h-8 w-8" />,
      title: "Ustaw aukcję",
      description: "Określ cenę startową, długość aukcji i ewentualną cenę minimalną."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Licytacja",
      description: "Kupujący składają oferty, a najwyższa oferta wygrywa aukcję."
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Płatność i odbiór",
      description: "Zwycięzca wpłaca prowizję i odbiera pojazd zgodnie z ustaleniami."
    }
  ]

  const generalFAQ = [
    {
      question: "Czy rejestracja na platformie jest darmowa?",
      answer: "Tak, rejestracja jest całkowicie darmowa. Opłaty pobieramy tylko za dodatkowe usługi premium lub prowizję od sprzedaży w aukcjach."
    },
    {
      question: "Ile kosztuje dodanie ogłoszenia?",
      answer: "Ceny zależą od wybranego pakietu. Pakiet Private Seller pozwala na 1 darmowe ogłoszenie, a wyższe pakiety oferują więcej ogłoszeń i dodatkowe funkcje."
    },
    {
      question: "Jak długo moje ogłoszenie będzie aktywne?",
      answer: "Standardowo ogłoszenia są aktywne przez 60 dni. Po tym czasie możesz je odnowić lub przedłużyć."
    },
    {
      question: "Czy mogę edytować swoje ogłoszenie po publikacji?",
      answer: "Tak, możesz edytować większość elementów ogłoszenia w dowolnym momencie przez panel użytkownika."
    },
    {
      question: "Jak działa weryfikacja użytkowników?",
      answer: "Weryfikujemy tożsamość poprzez dokument tożsamości i numer telefonu. Proces trwa zwykle 1-3 dni robocze."
    }
  ]

  const sellingFAQ = [
    {
      question: "Jakie zdjęcia powinienem dodać?",
      answer: "Dodaj co najmniej 5 wysokiej jakości zdjęć: przód, tył, boki, wnętrze i silnik. Zdjęcia powinny być ostre i dobrze oświetlone."
    },
    {
      question: "Jak wycenić mój pojazd?",
      answer: "Sprawdź podobne ogłoszenia na naszej platformie i innych serwisach. Uwzględnij stan, przebieg, wyposażenie i historię serwisową."
    },
    {
      question: "Czy muszę być obecny podczas oględzin?",
      answer: "Tak, zawsze powinieneś być obecny lub wyznaczyć zaufaną osobę. Nigdy nie przekazuj kluczy nieznajomym."
    },
    {
      question: "Jak bezpiecznie przeprowadzić transakcję?",
      answer: "Spotkaj się w bezpiecznym miejscu, sprawdź tożsamość kupującego, sprawdź płatność przed przekazaniem pojazdu."
    }
  ]

  const auctionFAQ = [
    {
      question: "Jaka jest prowizja od aukcji?",
      answer: "Pobieramy 5% prowizji od końcowej ceny sprzedaży, maksymalnie 500 CHF."
    },
    {
      question: "Co to jest cena minimalna (reserve)?",
      answer: "To najniższa cena, za którą zgadzasz się sprzedać pojazd. Jeśli nie zostanie osiągnięta, nie musisz sprzedawać."
    },
    {
      question: "Jak działa przedłużanie aukcji?",
      answer: "Jeśli w ostatnich 5 minutach zostanie złożona oferta, aukcja przedłuża się o kolejne 5 minut."
    },
    {
      question: "Co jeśli zwycięzca nie zapłaci?",
      answer: "Mamy procedury zabezpieczające. Możesz sprzedać pojazd drugiemu licytującemu lub ponownie wystawić aukcję."
    }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Jak działa MotoAuto.ch?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Wszystko, co musisz wiedzieć o sprzedaży i kupnie pojazdów na naszej platformie
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={activeTab === "general" ? "default" : "outline"}
              onClick={() => setActiveTab("general")}
              className="min-w-[140px]"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Ogólne
            </Button>
            <Button
              variant={activeTab === "selling" ? "default" : "outline"}
              onClick={() => setActiveTab("selling")}
              className="min-w-[140px]"
            >
              <Upload className="mr-2 h-4 w-4" />
              Sprzedaż
            </Button>
            <Button
              variant={activeTab === "auctions" ? "default" : "outline"}
              onClick={() => setActiveTab("auctions")}
              className="min-w-[140px]"
            >
              <Gavel className="mr-2 h-4 w-4" />
              Aukcje
            </Button>
          </div>

          {/* How it works - Selling */}
          {activeTab === "selling" && (
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Jak sprzedać pojazd?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Prosty proces w 4 krokach do udanej sprzedaży
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {steps.map((step, index) => (
                  <Card key={index} className="text-center relative">
                    <CardHeader>
                      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="text-primary">
                          {step.icon}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* How it works - Auctions */}
          {activeTab === "auctions" && (
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Jak działają aukcje?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Sprzedaj pojazd poprzez ekscytującą licytację
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {auctionSteps.map((step, index) => (
                  <Card key={index} className="text-center relative">
                    <CardHeader>
                      <div className="bg-orange-100 dark:bg-orange-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="text-orange-600 dark:text-orange-400">
                          {step.icon}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                    {index < auctionSteps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Auction Benefits */}
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Zalety aukcji
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Maksymalna cena</h4>
                      <p className="text-sm text-muted-foreground">
                        Konkurencja kupujących może podnieść cenę powyżej oczekiwań
                      </p>
                    </div>
                    <div className="text-center">
                      <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Szybka sprzedaż</h4>
                      <p className="text-sm text-muted-foreground">
                        Aukcje trwają 7 dni, garantując szybką sprzedaż
                      </p>
                    </div>
                    <div className="text-center">
                      <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <h4 className="font-semibold mb-1">Bezpieczeństwo</h4>
                      <p className="text-sm text-muted-foreground">
                        Weryfikowani licytujący i zabezpieczone transakcje
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Często zadawane pytania</h2>
              <p className="text-muted-foreground">
                Znajdź odpowiedzi na najczęściej zadawane pytania
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {(activeTab === "general" ? generalFAQ : 
                    activeTab === "selling" ? sellingFAQ : 
                    auctionFAQ).map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">
                  Gotowy na sprzedaż swojego pojazdu?
                </h3>
                <p className="mb-6 text-primary-foreground/80">
                  Dołącz do tysięcy zadowolonych użytkowników MotoAuto.ch
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <a href="/ogloszenia/dodaj">
                      <Upload className="mr-2 h-4 w-4" />
                      Dodaj ogłoszenie
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                    <a href="/kontakt">
                      Skontaktuj się z nami
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
