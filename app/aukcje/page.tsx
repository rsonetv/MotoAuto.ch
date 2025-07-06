import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AuctionList } from "@/components/aukcje/auction-list"
import { AuctionFilters } from "@/components/aukcje/auction-filters"

export default function AukcjePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aukcje Specjalne</h1>
          <p className="text-gray-600">Nie przegap wyjątkowych okazji dostępnych tylko u nas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AuctionFilters />
          </div>
          <div className="lg:col-span-3">
            <AuctionList />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
