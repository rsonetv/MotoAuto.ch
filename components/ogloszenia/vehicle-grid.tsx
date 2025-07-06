"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Eye, MapPin, Calendar, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getListings } from "@/lib/queries/listings"
import Link from "next/link"

interface VehicleGridProps {
  category: "moto" | "auto"
}

export function VehicleGrid({ category }: VehicleGridProps) {
  const {
    data: listings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listings", category],
    queryFn: () => getListings({ category, isAuction: false, limit: 12 }),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Wystąpił błąd podczas ładowania ogłoszeń.</p>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Brak ogłoszeń w tej kategorii.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Znaleziono {listings.length} ofert</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <div className="relative overflow-hidden">
              <img
                src={listing.images?.[0] || "/placeholder.svg?height=300&width=400"}
                alt={listing.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Badge className="absolute top-3 left-3 bg-teal-600 text-white">
                {listing.category === "auto" ? "AUTO" : "MOTO"}
              </Badge>
              <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded text-sm">
                <Eye className="w-4 h-4" />
                <span>{listing.views}</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="font-bold text-lg text-gray-900">{listing.title}</h3>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{listing.year}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gauge className="w-4 h-4" />
                  <span>{listing.mileage?.toLocaleString()} km</span>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{listing.location}</span>
                <span>•</span>
                <span>{listing.fuel_type}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">CHF {listing.price.toLocaleString()}</div>
                <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Link href={`/ogloszenia/${listing.id}`}>Zobacz szczegóły</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
