import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { VehicleDetails } from "@/components/ogloszenia/vehicle-details"
import { ContactPanel } from "@/components/ogloszenia/contact-panel"
import { notFound } from "next/navigation"

interface VehiclePageProps {
  params: {
    id: string
  }
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const vehicle = await getVehicle(params.id)

  if (!vehicle) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <VehicleDetails vehicle={vehicle} />
          </div>
          <div className="lg:col-span-1">
            <ContactPanel vehicle={vehicle} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

async function getVehicle(id: string) {
  // Mock function - replace with actual Supabase query
  return {
    id,
    title: "BMW M3 Competition",
    description: "Doskonały stan, pełna dokumentacja...",
    price: 95000,
    image_urls: ["/placeholder.svg?height=400&width=600"],
    brand: "BMW",
    model: "M3",
    year: 2021,
    mileage: 25000,
    fuel_type: "Benzyna",
    location: "Basel",
    view_count: 670,
  }
}
