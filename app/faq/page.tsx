import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Search, Gavel, MessageCircle, Car, UserPlus, FileText, Settings, Handshake } from "lucide-react"
import { Input } from "@/components/ui/input"

interface FaqCategory {
  id: string
  title: string
  questions: {
    question: string
    answer: string
  }[]
}

const faqData: FaqCategory[] = [
  {
    id: "general",
    title: "Ogólne",
    questions: [
      {
        question: "Czym jest MotoAuto.ch?",
        answer: "MotoAuto.ch to szwajcarska platforma ogłoszeniowa, która umożliwia kupno i sprzedaż samochodów oraz motocykli. Oferujemy zarówno tradycyjne ogłoszenia, jak i aukcje pojazdów."
      },
      {
        question: "Czy korzystanie z MotoAuto.ch jest bezpłatne?",
        answer: "Przeglądanie ogłoszeń jest całkowicie bezpłatne. Dla sprzedających oferujemy zarówno darmowe, jak i płatne opcje publikacji ogłoszeń, w zależności od wybranego pakietu."
      },
      {
        question: "Jak mogę się zarejestrować?",
        answer: "Rejestracja jest prosta. Kliknij przycisk 'Zarejestruj się' w prawym górnym rogu strony, podaj swój adres e-mail, utwórz hasło i wypełnij podstawowe informacje o profilu."
      },
      {
        question: "Czy MotoAuto.ch jest dostępne tylko w Szwajcarii?",
        answer: "Tak, MotoAuto.ch jest platformą dedykowaną dla rynku szwajcarskiego, ale użytkownicy z innych krajów również mogą przeglądać ogłoszenia."
      }
    ]
  },
  {
    id: "buying",
    title: "Kupowanie",
    questions: [
      {
        question: "Jak mogę wyszukać pojazd?",
        answer: "Możesz skorzystać z wyszukiwarki na stronie głównej lub przejść do sekcji 'Ogłoszenia' i użyć zaawansowanych filtrów, aby znaleźć pojazd spełniający Twoje kryteria."
      },
      {
        question: "Jak działa system aukcji?",
        answer: "Aukcje na MotoAuto.ch trwają 7 dni. Możesz licytować, zwiększając aktualną ofertę o minimum 100 CHF. Aukcje mają system soft close - jeśli ktoś złoży ofertę w ostatnich 5 minutach, aukcja zostanie przedłużona o kolejne 5 minut."
      },
      {
        question: "Czy mogę negocjować cenę ogłoszenia?",
        answer: "Tak, w przypadku tradycyjnych ogłoszeń możesz skontaktować się ze sprzedającym i negocjować cenę. W przypadku aukcji, cena jest ustalana przez proces licytacji."
      },
      {
        question: "Jak mogę skontaktować się ze sprzedającym?",
        answer: "Na stronie ogłoszenia znajdziesz przycisk 'Kontakt', który umożliwi Ci wysłanie wiadomości do sprzedającego lub wyświetli numer telefonu, jeśli sprzedający go udostępnił."
      }
    ]
  },
  {
    id: "selling",
    title: "Sprzedawanie",
    questions: [
      {
        question: "Jak dodać ogłoszenie?",
        answer: "Po zalogowaniu kliknij przycisk 'Dodaj ogłoszenie' i postępuj zgodnie z instrukcjami. Będziesz musiał podać szczegółowe informacje o pojeździe, dodać zdjęcia i ustalić cenę."
      },
      {
        question: "Ile kosztuje wystawienie ogłoszenia?",
        answer: "Koszt zależy od wybranego pakietu. Oferujemy pakiet Basic (2 ogłoszenie za 2 fr), pakiet Plus (3 ogłoszenie za 3 fr), a także inne płatne pakiety z dodatkowymi funkcjami. Szczegóły znajdziesz w sekcji 'Cennik'."
      },
      {
        question: "Jak wystawić pojazd na aukcję?",
        answer: "Podczas dodawania ogłoszenia wybierz opcję 'Aukcja' zamiast 'Ogłoszenie'. Będziesz musiał ustalić cenę wywoławczą (zawsze 1 CHF) oraz opcjonalnie cenę minimalną (reserve price)."
      },
      {
        question: "Jak długo moje ogłoszenie będzie aktywne?",
        answer: "Czas trwania ogłoszenia zależy od wybranego pakietu. W pakiecie Basic ogłoszenia są aktywne przez 30 dni, w pakiecie Plus przez 60 dni, a w pakiecie Premium bez limitu czasowego."
      }
    ]
  },
  {
    id: "account",
    title: "Konto i płatności",
    questions: [
      {
        question: "Jak zmienić dane mojego konta?",
        answer: "Po zalogowaniu przejdź do sekcji 'Moje konto' i wybierz 'Edytuj profil'. Tam możesz zaktualizować swoje dane osobowe, zmienić hasło lub dodać zdjęcie profilowe."
      },
      {
        question: "Jakie metody płatności akceptujecie?",
        answer: "Akceptujemy płatności kartą kredytową (Visa, Mastercard), TWINT, oraz przelewy bankowe. Wszystkie płatności są przetwarzane przez bezpieczny system płatności."
      },
      {
        question: "Jak anulować subskrypcję?",
        answer: "Aby anulować subskrypcję, przejdź do sekcji 'Moje konto' > 'Subskrypcje' i kliknij 'Anuluj subskrypcję'. Subskrypcja będzie aktywna do końca opłaconego okresu."
      },
      {
        question: "Czy mogę zmienić pakiet w trakcie subskrypcji?",
        answer: "Tak, możesz zmienić pakiet w dowolnym momencie. Jeśli zmieniasz na wyższy, dopłacisz różnicę. Jeśli zmieniasz na niższy, zmiana nastąpi po zakończeniu bieżącego okresu rozliczeniowego."
      }
    ]
  },
  {
    id: "technical",
    title: "Techniczne",
    questions: [
      {
        question: "Jakie przeglądarki są wspierane?",
        answer: "MotoAuto.ch działa na wszystkich nowoczesnych przeglądarkach, w tym Chrome, Firefox, Safari i Edge. Zalecamy korzystanie z najnowszych wersji przeglądarek dla optymalnego doświadczenia."
      },
      {
        question: "Czy MotoAuto.ch ma aplikację mobilną?",
        answer: "Obecnie nie mamy dedykowanej aplikacji mobilnej, ale nasza strona jest w pełni responsywna i zoptymalizowana do korzystania na urządzeniach mobilnych."
      },
      {
        question: "Co zrobić, jeśli mam problemy techniczne?",
        answer: "W przypadku problemów technicznych, skontaktuj się z naszym zespołem wsparcia przez formularz kontaktowy w sekcji 'Kontakt' lub wyślij e-mail na adres support@motoauto.ch."
      }
    ]
  }
]

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <Breadcrumbs 
            items={[
              { label: "FAQ" }
            ]}
            className="mb-6"
          />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Jak to działa i FAQ</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dowiedz się, jak działa MotoAuto.ch i znajdź odpowiedzi na najczęściej zadawane pytania
            </p>
          </div>

          <Tabs defaultValue="how-it-works" className="mb-12">
            <div className="flex justify-center mb-8 overflow-x-auto pb-2">
              <TabsList>
                <TabsTrigger value="how-it-works">Jak to działa</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Jak to działa section */}
            <TabsContent value="how-it-works">
              {/* For Buyers Section */}
              <div className="mb-16">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-primary mb-4">Dla Kupujących</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Znajdź pojazd</h3>
                    <p className="text-muted-foreground">
                      Użyj naszych zaawansowanych filtrów, aby znaleźć idealny samochód lub motocykl.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gavel className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Licytuj lub Kup Teraz</h3>
                    <p className="text-muted-foreground">
                      Weź udział w ekscytujących aukcjach lub skorzystaj z opcji "Kup Teraz", aby natychmiast zabezpieczyć
                      swój zakup.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Skontaktuj się ze sprzedawcą</h3>
                    <p className="text-muted-foreground">
                      Po wygranej aukcji lub zakupie, skontaktuj się ze sprzedawcą, aby sfinalizować transakcję.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Odbierz pojazd</h3>
                    <p className="text-muted-foreground">Umów się na odbiór pojazdu i ciesz się nowym nabytkiem. Gratulacje!</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border my-16"></div>

              {/* For Sellers Section */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-brand mb-4">Dla Sprzedających</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="bg-brand/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-10 h-10 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Zarejestruj konto</h3>
                    <p className="text-muted-foreground">Stwórz darmowe konto jako sprzedawca prywatny lub zweryfikowany dealer.</p>
                  </div>

                  <div className="text-center">
                    <div className="bg-brand/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Dodaj ogłoszenie</h3>
                    <p className="text-muted-foreground">
                      Wypełnij prosty formularz, dodaj zdjęcia i szczegółowy opis swojego pojazdu.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-brand/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-10 h-10 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Zarządzaj aukcją</h3>
                    <p className="text-muted-foreground">
                      Śledź oferty, odpowiadaj na pytania potencjalnych kupujących i zarządzaj swoją aukcją.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="bg-brand/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Handshake className="w-10 h-10 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Sfinalizuj sprzedaż</h3>
                    <p className="text-muted-foreground">
                      Po zakończeniu aukcji, skontaktuj się z kupującym, aby przekazać pojazd i otrzymać płatność.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center mt-16 bg-gradient-to-r from-primary to-brand text-white py-12 px-8 rounded-lg">
                <h2 className="text-3xl font-bold mb-4">Gotowy, aby zacząć?</h2>
                <p className="text-xl mb-8">Dołącz do tysięcy zadowolonych użytkowników MotoAuto.ch</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary" size="lg">
                    <a href="/auth/register">Zarejestruj się</a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                    <a href="/ogloszenia">Przeglądaj pojazdy</a>
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* FAQ section */}
            <TabsContent value="faq">
              <div className="max-w-xl mx-auto mb-12">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input 
                    placeholder="Wyszukaj pytanie..." 
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Tabs defaultValue="general" className="mb-12">
                <div className="flex justify-center mb-8 overflow-x-auto pb-2">
                  <TabsList>
                    {faqData.map((category) => (
                      <TabsTrigger key={category.id} value={category.id}>
                        {category.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                {faqData.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                      {category.questions.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="prose prose-sm max-w-none">
                              <p>{faq.answer}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          </Tabs>

          <div className="bg-muted rounded-lg p-8 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Nie znalazłeś odpowiedzi?</h2>
            <p className="text-muted-foreground mb-6">
              Skontaktuj się z naszym zespołem wsparcia, który chętnie pomoże Ci rozwiązać wszelkie problemy.
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