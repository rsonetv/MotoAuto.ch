"use client"
import { useNavigate } from "react-router-dom"
import { Calendar, Gauge, MapPin } from "lucide-react"
import type { Vehicle } from "../types/Vehicle"

interface VehicleCardProps {
  vehicle: Vehicle
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const navigate = useNavigate()

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

  const handleClick = () => {
    navigate(`/vehicle/${vehicle.id}`)
  }

  return (
    <div className="card card-hover cursor-pointer" onClick={handleClick}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={vehicle.imageUrl || "/placeholder.svg"}
          alt={vehicle.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        {vehicle.category === "auction" && (
          <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 rounded-md text-xs font-medium">
            AUKCJA
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-1">{vehicle.title}</h3>

        {/* Vehicle Details */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4" />
            <span>{vehicle.mileageKm.toLocaleString()} km</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base">{getFuelIcon(vehicle.fuelType)}</span>
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{vehicle.location}</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">{formatPrice(vehicle.priceCHF)}</div>
          <button className="btn-secondary text-sm px-4 py-2">Zobacz szczegóły</button>
        </div>
      </div>
    </div>
  )
}
