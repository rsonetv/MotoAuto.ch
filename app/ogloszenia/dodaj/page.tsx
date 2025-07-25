import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ModernListingForm } from "@/components/forms/modern-listing-form"
import { Toaster } from "sonner"

export default function DodajOgloszeniePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Dodaj nowe ogłoszenie
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nowoczesny formularz z asynchronicznym przesyłaniem zdjęć, 
              walidacją inline i automatycznym przypisywaniem kategorii.
            </p>
            <div className="mt-4 flex justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                ✨ Pasek postępu
              </span>
              <span className="flex items-center gap-1">
                📸 Async upload zdjęć
              </span>
              <span className="flex items-center gap-1">
                🗺️ Google Maps
              </span>
              <span className="flex items-center gap-1">
                ⚡ Walidacja inline
              </span>
            </div>
          </div>

          <ModernListingForm />
        </div>
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={5000}
      />
    </div>
  )
}
