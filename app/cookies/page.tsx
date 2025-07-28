import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/ui/print-button"
import { Globe, Calendar, Cookie, ArrowLeft, Settings, BarChart, Target } from "lucide-react"

export const metadata: Metadata = {
  title: "Polityka Cookies MotoAuto.ch | Informacje o plikach cookies",
  description: "Polityka cookies MotoAuto.ch - informacje o wykorzystywaniu plików cookies i podobnych technologii zgodnie z prawem szwajcarskim i RODO.",
  keywords: ["cookies", "polityka cookies", "pliki cookies", "MotoAuto.ch", "prywatność", "śledzenie"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Polityka Cookies MotoAuto.ch",
    description: "Informacje o wykorzystywaniu plików cookies na platformie MotoAuto.ch",
    type: "article",
    locale: "pl_PL",
  },
  alternates: {
    languages: {
      'de': '/cookie-richtlinie',
      'fr': '/politique-cookies',
      'pl': '/cookies'
    }
  }
}

export default function CookiesPolicyPage() {
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
              <Link href="/cookie-richtlinie" className="text-sm text-gray-600 hover:text-gray-900">DE</Link>
              <span className="text-gray-300">|</span>
              <Link href="/politique-cookies" className="text-sm text-gray-600 hover:text-gray-900">FR</Link>
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
            <Cookie className="w-8 h-8 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Polityka Cookies MotoAuto.ch
            </h1>
          </div>
          
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Ostatnia aktualizacja: {lastUpdated}</span>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-orange-800 text-sm">
              <strong>Zarządzanie cookies:</strong> Możesz zarządzać swoimi preferencjami dotyczącymi cookies 
              w ustawieniach przeglądarki lub korzystając z naszego centrum preferencji.
            </p>
          </div>
        </header>

        {/* Cookie Settings Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Centrum preferencji cookies</h2>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Settings className="w-4 h-4 mr-2" />
              Zarządzaj ustawieniami
            </Button>
          </div>
          <p className="text-gray-600 text-sm">
            Kliknij powyższy przycisk, aby dostosować swoje preferencje dotyczące cookies. 
            Możesz wybrać, które kategorie cookies chcesz zaakceptować.
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Spis treści</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <a href="#section-1" className="text-blue-600 hover:text-blue-800 py-1 block">1. Czym są cookies</a>
            <a href="#section-2" className="text-blue-600 hover:text-blue-800 py-1 block">2. Rodzaje cookies</a>
            <a href="#section-3" className="text-blue-600 hover:text-blue-800 py-1 block">3. Cookies niezbędne</a>
            <a href="#section-4" className="text-blue-600 hover:text-blue-800 py-1 block">4. Cookies funkcjonalne</a>
            <a href="#section-5" className="text-blue-600 hover:text-blue-800 py-1 block">5. Cookies analityczne</a>
            <a href="#section-6" className="text-blue-600 hover:text-blue-800 py-1 block">6. Cookies marketingowe</a>
            <a href="#section-7" className="text-blue-600 hover:text-blue-800 py-1 block">7. Cookies stron trzecich</a>
            <a href="#section-8" className="text-blue-600 hover:text-blue-800 py-1 block">8. Zarządzanie cookies</a>
            <a href="#section-9" className="text-blue-600 hover:text-blue-800 py-1 block">9. Aktualizacje polityki</a>
            <a href="#section-10" className="text-blue-600 hover:text-blue-800 py-1 block">10. Kontakt</a>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border">
          <article className="prose prose-lg max-w-none p-8">
            
            <section id="section-1" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                1. Czym są cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Cookies to małe pliki tekstowe, które są przechowywane na Twoim urządzeniu (komputerze, tablecie, smartfonie) 
                  podczas odwiedzania naszej strony internetowej. Cookies pomagają nam zapewnić lepsze doświadczenie użytkownika 
                  i umożliwiają prawidłowe funkcjonowanie strony.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Podobne technologie</h3>
                  <p className="text-sm text-gray-600">
                    Oprócz cookies używamy również podobnych technologii, takich jak web beacons, piksele śledzące, 
                    local storage i session storage, które służą podobnym celom.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-2" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                2. Rodzaje cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Cookies sesyjne</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Usuwane po zamknięciu przeglądarki</li>
                      <li>• Niezbędne do podstawowego funkcjonowania</li>
                      <li>• Przechowują dane tylko podczas sesji</li>
                      <li>• Nie wymagają zgody użytkownika</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Cookies trwałe</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Pozostają po zamknięciu przeglądarki</li>
                      <li>• Mają określony czas wygaśnięcia</li>
                      <li>• Zapamiętują preferencje użytkownika</li>
                      <li>• Mogą wymagać zgody użytkownika</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-3" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                3. Cookies niezbędne
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Zawsze aktywne - nie wymagają zgody</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Te cookies są niezbędne do podstawowego funkcjonowania strony i nie można ich wyłączyć.
                  </p>
                </div>
                <p>
                  Cookies niezbędne umożliwiają podstawowe funkcje strony, takie jak nawigacja i dostęp do bezpiecznych obszarów.
                </p>
              </div>
            </section>

            <section id="section-4" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                4. Cookies funkcjonalne
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">Opcjonalne - wymagają zgody</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Te cookies poprawiają funkcjonalność strony i zapamiętują Twoje preferencje.
                  </p>
                </div>
                <p>
                  Cookies funkcjonalne pozwalają na zapamiętanie wyborów użytkownika i personalizację doświadczenia.
                </p>
              </div>
            </section>

            <section id="section-5" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                5. Cookies analityczne
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <BarChart className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-semibold text-purple-800">Opcjonalne - wymagają zgody</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Te cookies pomagają nam zrozumieć, jak użytkownicy korzystają z naszej strony.
                  </p>
                </div>
                <p>
                  Cookies analityczne zbierają informacje o sposobie korzystania ze strony w celu jej ulepszania.
                </p>
              </div>
            </section>

            <section id="section-6" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                6. Cookies marketingowe
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800">Opcjonalne - wymagają zgody</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Te cookies służą do wyświetlania spersonalizowanych reklam i śledzenia ich skuteczności.
                  </p>
                </div>
                <p>
                  Cookies marketingowe umożliwiają wyświetlanie reklam dostosowanych do zainteresowań użytkownika.
                </p>
              </div>
            </section>

            <section id="section-7" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                7. Cookies stron trzecich
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Niektóre cookies są ustawiane przez zewnętrznych dostawców usług, z których korzystamy na naszej stronie.
                </p>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Polityki prywatności stron trzecich:</strong> Każdy z dostawców ma własną politykę prywatności, 
                    z którą można się zapoznać na ich stronach internetowych.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-8" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                8. Zarządzanie cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Masz pełną kontrolę nad cookies używanymi na naszej stronie:</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Centrum preferencji</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Użyj naszego centrum preferencji cookies, aby dostosować ustawienia.
                  </p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Otwórz centrum preferencji
                  </Button>
                </div>
              </div>
            </section>

            <section id="section-9" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                9. Aktualizacje polityki cookies
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Niniejsza polityka cookies może być okresowo aktualizowana w celu odzwierciedlenia 
                  zmian w naszych praktykach lub z powodów operacyjnych, prawnych lub regulacyjnych.
                </p>
              </div>
            </section>

            <section id="section-10" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                10. Kontakt
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Jeśli masz pytania dotyczące naszej polityki cookies, skontaktuj się z nami:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">MotoAuto.ch AG</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Adres:</strong> Bahnhofstrasse 1, 8001 Zürich, Szwajcaria</p>
                    <p><strong>Email:</strong> privacy@motoauto.ch</p>
                    <p><strong>Telefon:</strong> +41 44 123 45 67</p>
                    <p><strong>Formularz kontaktowy:</strong> <a href="mailto:kontakt@motoauto.ch" className="text-blue-600 hover:text-blue-800 underline">kontakt@motoauto.ch</a></p>
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
              href="/regulamin" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Regulamin
            </Link>
            <Link 
              href="/polityka-prywatnosci" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Polityka Prywatności
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