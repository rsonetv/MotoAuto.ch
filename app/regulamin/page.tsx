import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PrintButton } from "@/components/ui/print-button"
import { Globe, Calendar, FileText, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Regulamin serwisu MotoAuto.ch | Warunki korzystania",
  description: "Regulamin serwisu MotoAuto.ch - warunki korzystania z platformy sprzedaży samochodów i motocykli w Szwajcarii zgodnie z prawem szwajcarskim.",
  keywords: ["regulamin", "warunki korzystania", "MotoAuto.ch", "prawo szwajcarskie", "CO", "nFADP"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Regulamin serwisu MotoAuto.ch",
    description: "Warunki korzystania z platformy MotoAuto.ch zgodne z prawem szwajcarskim",
    type: "article",
    locale: "pl_PL",
  },
  alternates: {
    languages: {
      'de': '/nutzungsbedingungen',
      'fr': '/conditions-generales',
      'pl': '/regulamin'
    }
  }
}

export default function TermsOfServicePage() {
  const lastUpdated = "26 lipca 2025"
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do strony głównej
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <Link href="/nutzungsbedingungen" className="text-sm text-gray-600 hover:text-gray-900">DE</Link>
              <span className="text-gray-300">|</span>
              <Link href="/conditions-generales" className="text-sm text-gray-600 hover:text-gray-900">FR</Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-medium text-blue-600">PL</span>
            </div>
            
            {/* Print Button */}
            <PrintButton label="Drukuj" />
          </div>
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Regulamin serwisu MotoAuto.ch
            </h1>
          </div>
          
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Ostatnia aktualizacja: {lastUpdated}</span>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>Informacja prawna:</strong> Niniejszy regulamin jest zgodny z prawem szwajcarskim, 
              w szczególności z Kodeksem Zobowiązań (CO) oraz nową Federalną Ustawą o Ochronie Danych (nFADP).
            </p>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Spis treści</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <a href="#section-1" className="text-blue-600 hover:text-blue-800 py-1 block">1. Postanowienia ogólne</a>
            <a href="#section-2" className="text-blue-600 hover:text-blue-800 py-1 block">2. Definicje</a>
            <a href="#section-3" className="text-blue-600 hover:text-blue-800 py-1 block">3. Rejestracja i konto użytkownika</a>
            <a href="#section-4" className="text-blue-600 hover:text-blue-800 py-1 block">4. Zasady korzystania z serwisu</a>
            <a href="#section-5" className="text-blue-600 hover:text-blue-800 py-1 block">5. Ogłoszenia i aukcje</a>
            <a href="#section-6" className="text-blue-600 hover:text-blue-800 py-1 block">6. Płatności i prowizje</a>
            <a href="#section-7" className="text-blue-600 hover:text-blue-800 py-1 block">7. Odpowiedzialność</a>
            <a href="#section-8" className="text-blue-600 hover:text-blue-800 py-1 block">8. Ochrona danych osobowych</a>
            <a href="#section-9" className="text-blue-600 hover:text-blue-800 py-1 block">9. Postanowienia końcowe</a>
            <a href="#section-10" className="text-blue-600 hover:text-blue-800 py-1 block">10. Kontakt</a>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border">
          <article className="prose prose-lg max-w-none p-8">
            
            <section id="section-1" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                1. Postanowienia ogólne
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Niniejszy regulamin określa zasady korzystania z serwisu internetowego MotoAuto.ch 
                  (dalej: "Serwis") prowadzonego przez MotoAuto.ch AG z siedzibą w Zurychu, Szwajcaria.
                </p>
                <p>
                  Korzystanie z Serwisu oznacza akceptację niniejszego regulaminu w całości. 
                  Regulamin jest zgodny z prawem szwajcarskim, w szczególności z Kodeksem Zobowiązań (CO).
                </p>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Podstawa prawna:</strong> Art. 1-40 CO (Kodeks Zobowiązań Szwajcarii)
                  </p>
                </div>
              </div>
            </section>

            <section id="section-2" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                2. Definicje
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>W niniejszym regulaminie następujące terminy oznaczają:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Serwis</strong> - platforma internetowa MotoAuto.ch</li>
                  <li><strong>Użytkownik</strong> - osoba korzystająca z Serwisu</li>
                  <li><strong>Sprzedający</strong> - użytkownik wystawiający pojazd na sprzedaż</li>
                  <li><strong>Kupujący</strong> - użytkownik zainteresowany zakupem pojazdu</li>
                  <li><strong>Ogłoszenie</strong> - oferta sprzedaży pojazdu</li>
                  <li><strong>Aukcja</strong> - sprzedaż pojazdu w formie licytacji</li>
                </ul>
              </div>
            </section>

            <section id="section-3" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                3. Rejestracja i konto użytkownika
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Aby korzystać z pełnej funkcjonalności Serwisu, użytkownik musi założyć konto. 
                  Rejestracja jest bezpłatna i wymaga podania prawdziwych danych osobowych.
                </p>
                <p>
                  Użytkownik zobowiązuje się do:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Podania prawdziwych i aktualnych danych podczas rejestracji</li>
                  <li>Zachowania poufności danych logowania</li>
                  <li>Niezwłocznego informowania o nieautoryzowanym dostępie do konta</li>
                  <li>Aktualizowania danych osobowych w przypadku ich zmiany</li>
                </ul>
              </div>
            </section>

            <section id="section-4" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                4. Zasady korzystania z serwisu
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z prawem i dobrymi obyczajami.</p>
                <p><strong>Zabronione jest:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Publikowanie nieprawdziwych informacji o pojazdach</li>
                  <li>Naruszanie praw autorskich i własności intelektualnej</li>
                  <li>Używanie Serwisu do działalności niezgodnej z prawem</li>
                  <li>Próby włamania lub zakłócania działania Serwisu</li>
                  <li>Spam i niechciane komunikaty</li>
                </ul>
              </div>
            </section>

            <section id="section-5" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                5. Ogłoszenia i aukcje
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Sprzedający może publikować ogłoszenia sprzedaży pojazdów oraz organizować aukcje. 
                  Wszystkie ogłoszenia muszą zawierać prawdziwe informacje o pojeździe.
                </p>
                <p><strong>Wymagania dla ogłoszeń:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Prawdziwe zdjęcia pojazdu</li>
                  <li>Dokładny opis stanu technicznego</li>
                  <li>Informacje o historii pojazdu</li>
                  <li>Aktualna cena lub cena wywoławcza</li>
                </ul>
              </div>
            </section>

            <section id="section-6" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                6. Płatności i prowizje
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Serwis pobiera prowizję od udanych transakcji. Wszystkie płatności są realizowane 
                  w szwajcarskich frankach (CHF) zgodnie z obowiązującym cennikiem.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Uwaga:</strong> Prowizja jest pobierana tylko po udanej sprzedaży pojazdu.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-7" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                7. Odpowiedzialność
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  MotoAuto.ch AG działa jako pośrednik między sprzedającymi a kupującymi. 
                  Odpowiedzialność za stan prawny i techniczny pojazdów ponosi sprzedający.
                </p>
                <p>
                  Serwis nie ponosi odpowiedzialności za:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Nieprawdziwe informacje podane przez użytkowników</li>
                  <li>Spory między użytkownikami</li>
                  <li>Szkody wynikające z korzystania z Serwisu</li>
                  <li>Przerwy w działaniu Serwisu</li>
                </ul>
              </div>
            </section>

            <section id="section-8" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                8. Ochrona danych osobowych
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Przetwarzanie danych osobowych odbywa się zgodnie z nową Federalną Ustawą 
                  o Ochronie Danych (nFADP) oraz naszą Polityką Prywatności.
                </p>
                <p>
                  Szczegółowe informacje o przetwarzaniu danych znajdują się w 
                  <Link href="/polityka-prywatnosci" className="text-blue-600 hover:text-blue-800 underline">
                    Polityce Prywatności
                  </Link>.
                </p>
              </div>
            </section>

            <section id="section-9" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                9. Postanowienia końcowe
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Regulamin może być zmieniany. O zmianach użytkownicy będą informowani 
                  z 30-dniowym wyprzedzeniem.
                </p>
                <p>
                  W sprawach nieuregulowanych niniejszym regulaminem zastosowanie ma prawo szwajcarskie. 
                  Wszelkie spory będą rozstrzygane przez sądy w Zurychu.
                </p>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Jurysdykcja:</strong> Sądy w Zurychu, Szwajcaria
                  </p>
                </div>
              </div>
            </section>

            <section id="section-10" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                10. Kontakt
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">MotoAuto.ch AG</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Adres:</strong> Bahnhofstrasse 1, 8001 Zürich, Szwajcaria</p>
                    <p><strong>Telefon:</strong> +41 44 123 45 67</p>
                    <p><strong>Email:</strong> kontakt@motoauto.ch</p>
                    <p><strong>Numer rejestrowy:</strong> CHE-123.456.789</p>
                  </div>
                </div>
              </div>
            </section>

          </article>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-6">
            <Link 
              href="/polityka-prywatnosci" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Polityka Prywatności
            </Link>
            <Link 
              href="/cookies" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Polityka Cookies
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            Wersja z dnia {lastUpdated}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}