import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Search, Gavel, MessageCircle, Car, UserPlus, FileText, Settings, Handshake } from "lucide-react"

export default function JakToDzialaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Jak to działa?</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kupowanie i sprzedawanie na MotoAuto.ch jest proste, szybkie i bezpieczne.
          </p>
        </div>

        {/* For Buyers Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">Dla Kupujących</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Znajdź pojazd</h3>
              <p className="text-gray-600">
                Użyj naszych zaawansowanych filtrów, aby znaleźć idealny samochód lub motocykl.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Licytuj lub Kup Teraz</h3>
              <p className="text-gray-600">
                Weź udział w ekscytujących aukcjach lub skorzystaj z opcji "Kup Teraz", aby natychmiast zabezpieczyć
                swój zakup.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Skontaktuj się ze sprzedawcą</h3>
              <p className="text-gray-600">
                Po wygranej aukcji lub zakupie, skontaktuj się ze sprzedawcą, aby sfinalizować transakcję.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Odbierz pojazd</h3>
              <p className="text-gray-600">Umów się na odbiór pojazdu i ciesz się nowym nabytkiem. Gratulacje!</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-16"></div>

        {/* For Sellers Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-red-600 mb-4">Dla Sprzedających</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Zarejestruj konto</h3>
              <p className="text-gray-600">Stwórz darmowe konto jako sprzedawca prywatny lub zweryfikowany dealer.</p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dodaj ogłoszenie</h3>
              <p className="text-gray-600">
                Wypełnij prosty formularz, dodaj zdjęcia i szczegółowy opis swojego pojazdu.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Zarządzaj aukcją</h3>
              <p className="text-gray-600">
                Śledź oferty, odpowiadaj na pytania potencjalnych kupujących i zarządzaj swoją aukcją.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sfinalizuj sprzedaż</h3>
              <p className="text-gray-600">
                Po zakończeniu aukcji, skontaktuj się z kupującym, aby przekazać pojazd i otrzymać płatność.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 bg-gradient-to-r from-blue-600 to-red-600 text-white py-12 px-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Gotowy, aby zacząć?</h2>
          <p className="text-xl mb-8">Dołącz do tysięcy zadowolonych użytkowników MotoAuto.ch</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Zarejestruj się
            </a>
            <a
              href="/ogloszenia"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Przeglądaj pojazdy
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
