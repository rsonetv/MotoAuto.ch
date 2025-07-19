"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, MapPin, Calendar, Gauge, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useListings } from "@/hooks/use-listings"
import { formatPrice, formatNumber, formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import type { ListingFilters } from "@/lib/queries/listings"

interface VehicleGridProps {
  filters: ListingFilters
}

export function VehicleGrid({ filters }: VehicleGridProps) {
  const { data: listings = [], isLoading, error } = useListings(filters)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Wystąpił błąd podczas ładowania ogłoszeń.</p>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={() => window.location.reload()}>
          Spróbuj ponownie
        </Button>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">Brak wyników</h3>
        <p className="text-gray-500 mb-4">Nie znaleziono pojazdów spełniających wybrane kryteria.</p>
        <p className="text-sm text-gray-400">Spróbuj zmienić filtry lub rozszerzyć kryteria wyszukiwania.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Znaleziono {listings.length} ofert</h2>
          <p className="text-gray-600 mt-1">{filters.category === "auto" ? "Samochody" : "Motocykle"} • Szwajcaria</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Sortuj: Najnowsze
          </Button>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image
                    src={listing.images?.[0] || "/placeholder.svg?height=300&width=400"}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge className={`${listing.category === "auto" ? "bg-blue-600" : "bg-orange-600"} text-white`}>
                    {listing.category === "auto" ? "AUTO" : "MOTO"}
                  </Badge>
                  {listing.is_auction && (
                    <Badge className="bg-red-600 text-white flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      AUKCJA
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                    onClick={() => toggleFavorite(listing.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorites.has(listing.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                    />
                  </Button>
                  <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/90 hover:bg-white">
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>

                {/* Views */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(listing.views)}</span>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{listing.description}</p>
                </div>

                {/* Vehicle Details */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{listing.year}</span>
                  </div>
                  {listing.mileage && (
                    <div className="flex items-center space-x-1">
                      <Gauge className="w-4 h-4" />
                      <span>{formatNumber(listing.mileage)} km</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}</span>
                  {listing.fuel_type && (
                    <>
                      <span>•</span>
                      <span>{listing.fuel_type}</span>
                    </>
                  )}
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(listing.current_bid || listing.price)}
                    </div>
                    {listing.is_auction && listing.current_bid !== listing.price && (
                      <div className="text-sm text-gray-500">Start: {formatPrice(listing.price)}</div>
                    )}
                  </div>

                  <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Link href={`/${listing.category === "auto" ? "samochody" : "motocykle"}/${listing.id}`}>
                      {listing.is_auction ? "Licytuj" : "Zobacz"}
                    </Link>
                  </Button>
                </div>

                {/* Posted Time */}
                <div className="text-xs text-gray-400 pt-1">Dodano {formatRelativeTime(listing.created_at)}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
