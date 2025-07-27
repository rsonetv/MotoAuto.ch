import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PrintButton } from "@/components/ui/print-button"
import { Globe, Calendar, Shield, ArrowLeft, Lock, Eye, Database } from "lucide-react"

export const metadata: Metadata = {
  title: "Polityka Prywatności MotoAuto.ch | Ochrona danych osobowych",
  description: "Polityka prywatności MotoAuto.ch - informacje o przetwarzaniu danych osobowych zgodnie z nową Federalną Ustawą o Ochronie Danych (nFADP) Szwajcarii.",
  keywords: ["polityka prywatności", "ochrona danych", "RODO", "nFADP", "MotoAuto.ch", "prawo szwajcarskie"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Polityka Prywatności MotoAuto.ch",
    description: "Informacje o przetwarzaniu danych osobowych zgodnie z prawem szwajcarskim",
    type: "article",
    locale: "pl_PL",
  },
  alternates: {
    languages: {
      'de': '/datenschutzrichtlinie',
      'fr': '/politique-confidentialite',
      'pl': '/polityka-prywatnosci'
    }
  }
}

export default function PrivacyPolicyPage() {
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
              <Link href="/datenschutzrichtlinie" className="text-sm text-gray-600 hover:text-gray-900">DE</Link>
              <span className="text-gray-300">|</span>
              <Link href="/politique-confidentialite" className="text-sm text-gray-600 hover:text-gray-900">FR</Link>
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
            <Shield className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Polityka Prywatności MotoAuto.ch
            </h1>
          </div>
          
          <div className="flex items-center justify-center text-gray-600 mb-6">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Ostatnia aktualizacja: {lastUpdated}</span>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-green-800 text-sm">
              <strong>Zgodność prawna:</strong> Niniejsza polityka prywatności jest zgodna z nową Federalną 
              Ustawą o Ochronie Danych (nFADP) Szwajcarii oraz RODO dla użytkowników z UE.
            </p>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Spis treści</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <a href="#section-1" className="text-blue-600 hover:text-blue-800 py-1 block">1. Administrator danych</a>
            <a href="#section-2" className="text-blue-600 hover:text-blue-800 py-1 block">2. Rodzaje przetwarzanych danych</a>
            <a href="#section-3" className="text-blue-600 hover:text-blue-800 py-1 block">3. Cele przetwarzania</a>
            <a href="#section-4" className="text-blue-600 hover:text-blue-800 py-1 block">4. Podstawy prawne</a>
            <a href="#section-5" className="text-blue-600 hover:text-blue-800 py-1 block">5. Udostępnianie danych</a>
            <a href="#section-6" className="text-blue-600 hover:text-blue-800 py-1 block">6. Okres przechowywania</a>
            <a href="#section-7" className="text-blue-600 hover:text-blue-800 py-1 block">7. Prawa użytkowników</a>
            <a href="#section-8" className="text-blue-600 hover:text-blue-800 py-1 block">8. Bezpieczeństwo danych</a>
            <a href="#section-9" className="text-blue-600 hover:text-blue-800 py-1 block">9. Cookies i technologie śledzące</a>
            <a href="#section-10" className="text-blue-600 hover:text-blue-800 py-1 block">10. Kontakt</a>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border">
          <article className="prose prose-lg max-w-none p-8">
            
            <section id="section-1" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                1. Administrator danych
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Administratorem danych osobowych jest MotoAuto.ch AG z siedzibą w Zurychu, Szwajcaria.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Dane kontaktowe administratora:</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nazwa:</strong> MotoAuto.ch AG</p>
                    <p><strong>Adres:</strong> Bahnhofstrasse 1, 8001 Zürich, Szwajcaria</p>
                    <p><strong>Email:</strong> privacy@motoauto.ch</p>
                    <p><strong>Telefon:</strong> +41 44 123 45 67</p>
                    <p><strong>Numer rejestrowy:</strong> CHE-123.456.789</p>
                  </div>
                </div>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Podstawa prawna:</strong> Art. 19-25 nFADP (nowa Federalna Ustawa o Ochronie Danych)
                  </p>
                </div>
              </div>
            </section>

            <section id="section-2" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                2. Rodzaje przetwarzanych danych
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Przetwarzamy następujące kategorie danych osobowych:</p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Database className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold">Dane rejestracyjne</h3>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Imię i nazwisko</li>
                      <li>• Adres email</li>
                      <li>• Numer telefonu</li>
                      <li>• Adres zamieszkania</li>
                      <li>• Data urodzenia</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Eye className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold">Dane behawioralne</h3>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Historia przeglądania</li>
                      <li>• Preferencje wyszukiwania</li>
                      <li>• Dane o urządzeniu</li>
                      <li>• Adres IP</li>
                      <li>• Lokalizacja geograficzna</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center mb-3">
                    <Lock className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold">Dane transakcyjne</h3>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Historia transakcji</li>
                    <li>• Dane płatnicze (zaszyfrowane)</li>
                    <li>• Faktury i rachunki</li>
                    <li>• Komunikacja z obsługą klienta</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="section-3" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                3. Cele przetwarzania
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Dane osobowe przetwarzamy w następujących celach:</p>
                <div className="space-y-4 mt-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Świadczenie usług</h4>
                    <p className="text-sm text-gray-600">Umożliwienie korzystania z platformy, zarządzanie kontem użytkownika, obsługa transakcji</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Komunikacja</h4>
                    <p className="text-sm text-gray-600">Kontakt z użytkownikami, powiadomienia o transakcjach, obsługa klienta</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Marketing</h4>
                    <p className="text-sm text-gray-600">Wysyłanie informacji o nowych ofertach, personalizacja treści (za zgodą)</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Bezpieczeństwo</h4>
                    <p className="text-sm text-gray-600">Zapobieganie oszustwom, ochrona przed nadużyciami, zapewnienie bezpieczeństwa</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-4" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                4. Podstawy prawne przetwarzania
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Przetwarzanie danych osobowych odbywa się na podstawie:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Wykonania umowy</strong> - świadczenie usług platformy (art. 31 nFADP)</li>
                  <li><strong>Zgody</strong> - marketing, cookies niezbędne (art. 31 nFADP)</li>
                  <li><strong>Prawnie uzasadnionego interesu</strong> - bezpieczeństwo, analityka (art. 31 nFADP)</li>
                  <li><strong>Obowiązku prawnego</strong> - przechowywanie dokumentów księgowych (CO art. 957-963)</li>
                </ul>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-sm text-gray-600">
                    <strong>Uwaga:</strong> Zgodę można wycofać w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania przed jej wycofaniem.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-5" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                5. Udostępnianie danych trzecim stronom
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Dane osobowe mogą być udostępniane następującym kategoriom odbiorców:</p>
                <div className="space-y-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Dostawcy usług technicznych</h4>
                    <p className="text-sm text-gray-600">Hosting, przetwarzanie płatności, analityka - wyłącznie w zakresie niezbędnym do świadczenia usług</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Organy państwowe</h4>
                    <p className="text-sm text-gray-600">Na żądanie organów ścigania lub innych uprawnionych instytucji zgodnie z prawem szwajcarskim</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Partnerzy biznesowi</h4>
                    <p className="text-sm text-gray-600">Dealerzy, firmy ubezpieczeniowe - wyłącznie za zgodą użytkownika</p>
                  </div>
                </div>
                <p className="mt-4">
                  <strong>Przekazywanie danych poza Szwajcarię:</strong> Dane mogą być przekazywane do krajów UE/EOG 
                  oraz krajów z odpowiednim poziomem ochrony danych zgodnie z decyzjami Federalnego Komisarza ds. Ochrony Danych.
                </p>
              </div>
            </section>

            <section id="section-6" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                6. Okres przechowywania danych
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Dane osobowe przechowujemy przez następujące okresy:</p>
                <div className="overflow-x-auto mt-6">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Kategoria danych</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Okres przechowywania</th>
                        <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Podstawa prawna</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Dane konta użytkownika</td>
                        <td className="border-b border-gray-200 px-4 py-3">Do usunięcia konta + 1 rok</td>
                        <td className="border-b border-gray-200 px-4 py-3">Prawnie uzasadniony interes</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Dane transakcyjne</td>
                        <td className="border-b border-gray-200 px-4 py-3">10 lat</td>
                        <td className="border-b border-gray-200 px-4 py-3">CO art. 958f (obowiązek księgowy)</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Logi systemowe</td>
                        <td className="border-b border-gray-200 px-4 py-3">12 miesięcy</td>
                        <td className="border-b border-gray-200 px-4 py-3">Bezpieczeństwo systemu</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3">Dane marketingowe</td>
                        <td className="border-b border-gray-200 px-4 py-3">Do wycofania zgody</td>
                        <td className="border-b border-gray-200 px-4 py-3">Zgoda użytkownika</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="section-7" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                7. Prawa użytkowników
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Zgodnie z nFADP przysługują Państwu następujące prawa:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Prawo dostępu</h4>
                    <p className="text-sm text-gray-600">Informacja o przetwarzanych danych osobowych</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Prawo sprostowania</h4>
                    <p className="text-sm text-gray-600">Poprawienie nieprawidłowych danych</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Prawo usunięcia</h4>
                    <p className="text-sm text-gray-600">Usunięcie danych w określonych przypadkach</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Prawo ograniczenia</h4>
                    <p className="text-sm text-gray-600">Ograniczenie przetwarzania danych</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Prawo przenoszenia</h4>
                    <p className="text-sm text-gray-600">Otrzymanie danych w formacie strukturalnym</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Prawo sprzeciwu</h4>
                    <p className="text-sm text-gray-600">Sprzeciw wobec przetwarzania w określonych celach</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Jak skorzystać z praw:</strong> Aby skorzystać z powyższych praw, skontaktuj się z nami 
                    pod adresem privacy@motoauto.ch. Odpowiemy w ciągu 30 dni.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-8" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                8. Bezpieczeństwo danych
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony danych osobowych 
                  przed nieautoryzowanym dostępem, utratą, zniszczeniem lub ujawnieniem.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Środki techniczne:</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Szyfrowanie SSL/TLS</li>
                      <li>• Szyfrowanie baz danych</li>
                      <li>• Regularne kopie zapasowe</li>
                      <li>• Monitoring bezpieczeństwa 24/7</li>
                      <li>• Aktualizacje bezpieczeństwa</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Środki organizacyjne:</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Szkolenia pracowników</li>
                      <li>• Kontrola dostępu</li>
                      <li>• Procedury bezpieczeństwa</li>
                      <li>• Audyty bezpieczeństwa</li>
                      <li>• Plan reagowania na incydenty</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section id="section-9" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                9. Cookies i technologie śledzące
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Nasza strona internetowa wykorzystuje pliki cookies i podobne technologie. 
                  Szczegółowe informacje znajdują się w naszej 
                  <Link href="/cookies" className="text-blue-600 hover:text-blue-800 underline">
                    Polityce Cookies
                  </Link>.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Zarządzanie cookies:</strong> Możesz zarządzać ustawieniami cookies w swojej przeglądarce 
                    lub skorzystać z naszego centrum preferencji cookies.
                  </p>
                </div>
              </div>
            </section>

            <section id="section-10" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                10. Kontakt i skargi
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Inspektor Ochrony Danych</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> privacy@motoauto.ch</p>
                    <p><strong>Telefon:</strong> +41 44 123 45 67</p>
                    <p><strong>Adres:</strong> MotoAuto.ch AG, Bahnhofstrasse 1, 8001 Zürich</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Prawo do wniesienia skargi</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    W przypadku naruszenia przepisów o ochronie danych osobowych, można wnieść skargę do:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Federalny Komisarz ds. Ochrony Danych i Informacji (EDÖB)</strong></p>
                    <p>Feldeggweg 1, 3003 Bern, Szwajcaria</p>
                    <p>Email: contact@edoeb.admin.ch</p>
                    <p>Tel: +41 58 462 43 95</p>
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