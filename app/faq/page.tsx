"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  HelpCircle, 
  Car, 
  Gavel, 
  CreditCard, 
  Shield, 
  Users,
  ArrowRight,
  CheckCircle
} from "lucide-react"

const faqCategories = [
  {
    id: "general",
    title: "Ogólne",
    icon: HelpCircle,
    color: "bg-blue-500",
    faqs: [
      {
        question: "Jak działa MotoAuto.ch?",
        answer: "MotoAuto.ch to platforma do sprzedaży i kupna pojazdów w Szwajcarii. Możesz dodawać ogłoszenia, uczestniczyć w aukcjach i przeglądać oferty innych użytkowników. Oferujemy bezpieczne transakcje i weryfikację użytkowników."
      },
      {
        question: "Czy mogę sprzedawać pojazdy bez rejestracji?",
        answer: "Nie, aby dodać ogłoszenie lub uczestniczyć w aukcjach, musisz założyć konto i przejść proces weryfikacji. To zapewnia bezpieczeństwo wszystkim użytkownikom platformy."
      },
      {
        question: "Jakie pojazdy mogę sprzedawać?",
        answer: "Możesz sprzedawać samochody osobowe, motocykle, pojazdy użytkowe i inne pojazdy mechaniczne. Wszystkie pojazdy muszą być zgodne z prawem szwajcarskim."
      }
    ]
  },
  {
    id: "selling",
    title: "Sprzedaż",
    icon: Car,
    color: "bg-green-500",
    faqs: [
      {
        question: "Ile kosztuje dodanie ogłoszenia?",
        answer: "Koszt zależy od wybranego pakietu. Pakiet Private Seller (1 ogłoszenie) jest darmowy. Pakiety płatne zaczynają się od 29 CHF/miesiąc i oferują więcej ogłoszeń oraz dodatkowe funkcje."
      },
      {
        question: "Jak długo trwa publikacja ogłoszenia?",
        answer: "Ogłoszenia są publikowane natychmiast po wypełnieniu formularza. Weryfikacja zdjęć i danych może potrwać do 24 godzin."
      },
      {
        question: "Czy mogę edytować ogłoszenie po publikacji?",
        answer: "Tak, możesz edytować większość informacji w swoim ogłoszeniu przez panel użytkownika. Niektóre zmiany mogą wymagać ponownej weryfikacji."
      },
      {
        question: "Jak działa system zdjęć?",
        answer: "Możesz dodać do 20 zdjęć na ogłoszenie. Pierwsze zdjęcie będzie głównym zdjęciem w wynikach wyszukiwania. Zdjęcia są automatycznie optymalizowane."
      }
    ]
  },
  {
    id: "auctions",
    title: "Aukcje",
    icon: Gavel,
    color: "bg-purple-500",
    faqs: [
      {
        question: "Jak działają aukcje na MotoAuto.ch?",
        answer: "Aukcje trwają określony czas (zwykle 7 dni). Użytkownicy składają oferty, a najwyższa oferta wygrywa. Mamy system 'soft close' - jeśli oferta zostanie złożona w ostatnich 5 minutach, aukcja zostaje przedłużona o 5 minut."
      },
      {
        question: "Jaka jest prowizja od aukcji?",
        answer: "Pobieramy 5% prowizji od końcowej ceny sprzedaży, maksymalnie 500 CHF. Prowizja jest pobierana tylko w przypadku udanej sprzedaży."
      },
      {
        question: "Czy mogę anulować ofertę w aukcji?",
        answer: "Oferty w aukcjach są wiążące i nie można ich anulować. Upewnij się, że jesteś gotów na zakup przed złożeniem oferty."
      },
      {
        question: "Co to jest cena minimalna (reserve price)?",
        answer: "To najniższa cena, za którą sprzedawca jest gotów sprzedać pojazd. Jeśli aukcja nie osiągnie tej ceny, sprzedaż nie dojdzie do skutku."
      }
    ]
  },
  {
    id: "payments",
    title: "Płatności",
    icon: CreditCard,
    color: "bg-orange-500",
    faqs: [
      {
        question: "Jakie metody płatności akceptujecie?",
        answer: "Akceptujemy karty kredytowe/debetowe (Visa, Mastercard), przelewy bankowe i płatności przez Stripe. Wszystkie płatności są bezpieczne i szyfrowane."
      },
      {
        question: "Kiedy zostanę obciążony za pakiet?",
        answer: "Płatność za pakiet jest pobierana natychmiast po wyborze. Pakiety są rozliczane miesięcznie i automatycznie odnawiane."
      },
      {
        question: "Czy mogę anulować subskrypcję?",
        answer: "Tak, możesz anulować subskrypcję w dowolnym momencie w panelu użytkownika. Anulowanie wejdzie w życie na koniec bieżącego okresu rozliczeniowego."
      },
      {
        question: "Czy otrzymam fakturę?",
        answer: "Tak, faktury są automatycznie generowane i wysyłane na Twój adres email po każdej płatności."
      }
    ]
  },
  {
    id: "safety",
    title: "Bezpieczeństwo",
    icon: Shield,
    color: "bg-red-500",
    faqs: [
      {
        question: "Jak weryfikujecie użytkowników?",
        answer: "Wszyscy użytkownicy muszą potwierdzić swój adres email i numer telefonu. Dealerzy przechodzą dodatkową weryfikację dokumentów biznesowych."
      },
      {
        question: "Co robić w przypadku oszustwa?",
        answer: "Natychmiast skontaktuj się z nami przez formularz kontaktowy lub email. Mamy zespół ds. bezpieczeństwa, który zajmuje się takimi przypadkami."
      },
      {
        question: "Czy transakcje są bezpieczne?",
        answer: "Zalecamy spotkania osobiste i oględziny pojazdu przed zakupem. Dla większych transakcji oferujemy usługę escrow (depozyt u trzeciej strony)."
      },
      {
        question: "Jak zgłosić podejrzane ogłoszenie?",
        answer: "Na każdym ogłoszeniu znajdziesz przycisk 'Zgłoś'. Możesz też napisać do nas bezpośrednio z opisem problemu."
      }
    ]
  },
  {
    id: "account",
    title: "Konto użytkownika",
    icon: Users,
    color: "bg-teal-500",
    faqs: [
      {
        question: "Jak zmienić dane w profilu?",
        answer: "Zaloguj się i przejdź do 'Mój profil' w menu użytkownika. Tam możesz edytować wszystkie swoje dane osobowe i preferencje."
      },
      {
        question: "Zapomniałem hasła - co robić?",
        answer: "Kliknij 'Zapomniałem hasła' na stronie logowania. Wyślemy Ci link do resetowania hasła na adres email."
      },
      {
        question: "Czy mogę usunąć konto?",
        answer: "Tak, możesz usunąć konto w ustawieniach profilu. Pamiętaj, że ta operacja jest nieodwracalna i wszystkie Twoje dane zostaną usunięte."
      },
      {
        question: "Jak zmienić adres email?",
        answer: "W ustawieniach profilu możesz zmienić adres email. Nowy adres musi zostać potwierdzony przed aktywacją."
      }
    ]
  }
]

const howItWorksSteps = [
  {
    step: 1,
    title: "Zarejestruj się",
    description: "Utwórz darmowe konto i zweryfikuj swój email oraz numer telefonu.",
    icon: Users
  },
  {
    step: 2,
    title: "Dodaj ogłoszenie",
    description: "Wypełnij formularz, dodaj zdjęcia i opublikuj swoje ogłoszenie.",
    icon: Car
  },
  {
    step: 3,
    title: "Sprzedaj lub kup",
    description: "Czekaj na oferty lub licytuj w aukcjach. Finalizuj transakcję bezpiecznie.",
    icon: CheckCircle
  }
]

export default function FAQPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Jak to działa & FAQ</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Dowiedz się, jak korzystać z MotoAuto.ch i znajdź odpowiedzi na najczęściej zadawane pytania
            </p>
          </div>

          {/* How It Works Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Jak to działa</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorksSteps.map((step) => (
                <Card key={step.step} className="text-center border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="mb-4">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        Krok {step.step}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button size="lg" className="mr-4">
                Rozpocznij teraz
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Zobacz cennik
              </Button>
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-12">Często zadawane pytania</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {faqCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                        <category.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>
                          {category.faqs.length} pytań
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* FAQ Accordions */}
            <div className="space-y-8">
              {faqCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}>
                        <category.icon className="h-4 w-4 text-white" />
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`${category.id}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="text-center py-12">
              <h3 className="text-2xl font-bold mb-4">Nie znalazłeś odpowiedzi?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Nasz zespół wsparcia jest gotowy pomóc. Skontaktuj się z nami, a odpowiemy na wszystkie Twoje pytania.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  Skontaktuj się z nami
                </Button>
                <Button variant="outline" size="lg">
                  Wyślij email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  )
}