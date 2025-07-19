"use client"

import type React from "react"

import { useState, memo, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Eye,
  MapPin,
  Calendar,
  Gauge,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { formatPrice, formatNumber, formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import type { Listing } from "@/types/database.types"

interface VehicleCardProps {
  listing: Listing
  index: number
  onToggleFavorite: (id: number) => void
  isFavorite: boolean
  viewMode?: "grid" | "list"
}

export const VehicleCard = memo<VehicleCardProps>(function VehicleCard({
  listing,
  index,
  onToggleFavorite,
  isFavorite,
  viewMode = "grid",
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const images = listing.images || ["/placeholder.svg?height=300&width=400&text=Vehicle"]

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const openGallery = useCallback((imageIndex: number) => {
    setCurrentImageIndex(imageIndex)
    setIsGalleryOpen(true)
  }, [])

  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite(listing.id)
  }, [onToggleFavorite, listing.id])

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  const handleImageClick = useCallback(() => {
    openGallery(currentImageIndex)
  }, [openGallery, currentImageIndex])

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      prevImage()
    },
    [prevImage],
  )

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      nextImage()
    },
    [nextImage],
  )

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
          <div className="flex flex-col sm:flex-row">
            {/* Image section */}
            <div className="relative w-full sm:w-80 flex-shrink-0">
              <div className="aspect-[4/3] sm:aspect-[16/10] relative overflow-hidden">
                <Image
                  src={images[currentImageIndex] || "/placeholder.svg"}
                  alt={listing.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={handleImageClick}
                  onError={handleImageError}
                />

                {/* Image navigation for list view */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge
                    className={`${listing.category === "auto" ? "bg-blue-600" : "bg-orange-600"} text-white text-xs`}
                  >
                    {listing.category === "auto" ? "AUTO" : "MOTO"}
                  </Badge>
                  {listing.is_auction && (
                    <Badge className="bg-red-600 text-white flex items-center gap-1 text-xs">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      AUKCJA
                    </Badge>
                  )}
                </div>

                {/* Image count */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {currentImageIndex + 1}/{images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Content section */}
            <CardContent className="flex-1 p-4 sm:p-6">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-900 line-clamp-responsive-1 mb-1">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-responsive-2">{listing.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-8 h-8 p-0 bg-white hover:bg-gray-50"
                        onClick={handleToggleFavorite}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                      </Button>
                      <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white hover:bg-gray-50">
                        <Share2 className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
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
                    <div className="flex items-center space-x-1 col-span-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                  </div>

                  {listing.fuel_type && (
                    <div className="mb-4">
                      <Badge variant="outline" className="text-xs">
                        {listing.fuel_type}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Price and actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {formatPrice(listing.current_bid || listing.price)}
                    </div>
                    {listing.is_auction && listing.current_bid !== listing.price && (
                      <div className="text-sm text-gray-500">Start: {formatPrice(listing.price)}</div>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                      <Eye className="w-3 h-3" />
                      <span>{formatNumber(listing.views)} wyświetleń</span>
                      <span>•</span>
                      <span>{formatRelativeTime(listing.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button size="sm" variant="outline" className="hidden sm:flex bg-transparent">
                      <Phone className="w-4 h-4 mr-1" />
                      Zadzwoń
                    </Button>
                    <Button size="sm" variant="outline" className="hidden sm:flex bg-transparent">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Wiadomość
                    </Button>
                    <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
                      <Link href={`/${listing.category === "auto" ? "samochody" : "motocykle"}/${listing.id}`}>
                        {listing.is_auction ? "Licytuj" : "Zobacz"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    )
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden card-hover group">
        <div className="relative">
          <div className="aspect-responsive relative overflow-hidden">
            <Image
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={handleImageClick}
              onError={handleImageError}
            />

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
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
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
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

          {/* Image Count */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1}/{images.length}
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 space-y-3">
          <div>
            <h3 className="font-bold text-responsive-lg text-gray-900 line-clamp-responsive-1">{listing.title}</h3>
            <p className="text-responsive-sm text-gray-600 line-clamp-responsive-2 mt-1">{listing.description}</p>
          </div>

          {/* Vehicle Details */}
          <div className="flex items-center justify-between text-responsive-sm text-gray-600">
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

          <div className="flex items-center space-x-2 text-responsive-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{listing.location}</span>
            {listing.fuel_type && (
              <>
                <span>•</span>
                <span className="truncate">{listing.fuel_type}</span>
              </>
            )}
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="min-w-0 flex-1">
              <div className="text-responsive-2xl font-bold text-gray-900">
                {formatPrice(listing.current_bid || listing.price)}
              </div>
              {listing.is_auction && listing.current_bid !== listing.price && (
                <div className="text-responsive-sm text-gray-500">Start: {formatPrice(listing.price)}</div>
              )}
            </div>

            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white btn-responsive ml-3">
              <Link href={`/${listing.category === "auto" ? "samochody" : "motocykle"}/${listing.id}`}>
                {listing.is_auction ? "Licytuj" : "Zobacz"}
              </Link>
            </Button>
          </div>

          {/* Posted Time */}
          <div className="text-xs text-gray-400 pt-1">Dodano {formatRelativeTime(listing.created_at)}</div>
        </CardContent>
      </Card>

      {/* Image Gallery Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl w-full p-0 max-h-[90vh] overflow-hidden">
          <div className="relative">
            <div className="aspect-responsive relative">
              <Image
                src={images[currentImageIndex] || "/placeholder.svg"}
                alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 p-0"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 p-0"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Gallery Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-lg p-2 max-w-xs overflow-hidden">
              <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                {images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? "border-white" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${idx + 1}`}
                      width={48}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
})
