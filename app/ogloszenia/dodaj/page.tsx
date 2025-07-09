import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { UnifiedVehicleForm } from "@/components/forms/unified-vehicle-form"

export default function DodajOgloszeniePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dodaj nowe ogłoszenie</h1>
            <p className="text-gray-600">Wypełnij formularz, aby szybko i bezpiecznie sprzedać swój pojazd.</p>
          </div>

          <UnifiedVehicleForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
