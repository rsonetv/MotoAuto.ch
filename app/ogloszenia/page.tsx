import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { VehicleList } from "@/components/ogloszenia/vehicle-list"
import { VehicleFilters } from "@/components/ogloszenia/vehicle-filters"

export default function OgloszeniePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ogłoszenia</h1>
          <p className="text-gray-600">Znajdź swój wymarzony pojazd wśród tysięcy ofert.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <VehicleFilters />
          </div>
          <div className="lg:col-span-3">
            <VehicleList />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
