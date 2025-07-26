import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
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
        answer: "Koszt zależy od wybranego pakietu. Oferujemy darmowe ogłoszenia w pakiecie Basic (do 3 ogłoszeń), a także płatne pakiety z dodatkowymi funkcjami. Szczegóły znajdziesz w sekcji 'Cennik'."
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
            <h1 className="text-3xl font-bold mb-4">Najczęściej zadawane pytania</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące korzystania z platformy MotoAuto.ch
            </p>
          </div>

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