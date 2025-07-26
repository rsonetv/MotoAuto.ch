import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ModernListingForm } from "@/components/forms/modern-listing-form"

export default function DodajOgloszeniePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dodaj nowe ogłoszenie
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nowoczesny formularz z natychmiastowym podglądem zdjęć, walidacją inline 
              i automatycznym przekierowaniem do odpowiedniej kategorii.
            </p>
            <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>✅ Asynchroniczny upload zdjęć</span>
              <span>✅ Google Maps</span>
              <span>✅ Poprawiona struktura BMW</span>
              <span>✅ Walidacja inline</span>
            </div>
          </div>

          <ModernListingForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
