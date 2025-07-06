import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AddVehicleForm } from "@/components/forms/add-vehicle-form"

export default function DodajOgloszeniePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dodaj ogłoszenie</h1>
            <p className="text-gray-600">Sprzedaj swój pojazd szybko i bezpiecznie.</p>
          </div>

          <AddVehicleForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
