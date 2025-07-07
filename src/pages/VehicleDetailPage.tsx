"use client"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, Gauge, MapPin, Cog } from "lucide-react"
import { useVehicles } from "../context/VehicleContext"

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { vehicles } = useVehicles()

  const vehicle = vehicles.find((v) => v.id === id)

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pojazd nie znaleziony</h2>
          <button onClick={() => navigate("/")} className="btn-primary">
            Powrót do strony głównej
          </button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType) {
      case "Electric":
        return "⚡"
      case "Hybrid":
        return "🔋"
      case "Diesel":
        return "⛽"
      default:
        return "⛽"
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold truncate">{vehicle.title}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {/* Hero Image */}
        <div className="relative aspect-[4/3] md:aspect-[16/9]">
          <img
            src={vehicle.imageUrl || "/placeholder.svg"}
            alt={vehicle.title}
            className="w-full h-full object-cover"
          />
          {vehicle.category === "auction" && (
            <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-md font-medium">
              AUKCJA
            </div>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.title}</h1>
            <div className="text-3xl font-bold text-primary-600 mb-4">{formatPrice(vehicle.priceCHF)}</div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Rok</div>
                <div className="font-medium">{vehicle.year}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Gauge className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Przebieg</div>
                <div className="font-medium">{vehicle.mileageKm.toLocaleString()} km</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">{getFuelIcon(vehicle.fuelType)}</span>
              <div>
                <div className="text-sm text-gray-500">Napęd</div>
                <div className="font-medium">{vehicle.fuelType}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Lokalizacja</div>
                <div className="font-medium">{vehicle.location}</div>
              </div>
            </div>

            {vehicle.transmission && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg col-span-2">
                <Cog className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Skrzynia biegów</div>
                  <div className="font-medium">{vehicle.transmission}</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Opis</h2>
              <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
            </div>
          )}

          {/* Contact CTA */}
          <div className="space-y-3">
            <button className="w-full btn-primary py-4 text-lg">Skontaktuj się ze sprzedawcą</button>
            <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Dodaj do ulubionych
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
