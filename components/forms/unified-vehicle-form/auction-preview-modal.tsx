"use client"

import { UnifiedVehicleFormValues } from "@/lib/schemas/unified-vehicle-schema"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import ImageGallery from "@/components/ui/image-gallery/ImageGallery"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gauge, MapPin } from "lucide-react"

interface AuctionPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  formData: Partial<UnifiedVehicleFormValues>
}

export function AuctionPreviewModal({ isOpen, onClose, formData }: AuctionPreviewModalProps) {
  if (!isOpen) return null

  const { title, price, currency, images, description, year, mileage, fuelType, location } = formData

  const galleryImages = images?.map(img => ({
    src: img.preview,
    alt: title || 'Vehicle image',
    thumbnail: img.preview,
    is360: false
  })) || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Podgląd ogłoszenia</DialogTitle>
          <DialogDescription>
            Tak będzie wyglądać Twoje ogłoszenie dla potencjalnych kupujących.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h1 className="text-3xl font-bold mb-3">{title || "Tytuł ogłoszenia"}</h1>
          <div className="flex flex-wrap gap-3 mb-6">
            {year && (
              <Badge variant="outline" className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" /> {year}
              </Badge>
            )}
            {mileage && (
              <Badge variant="outline" className="flex items-center">
                <Gauge className="mr-1 h-4 w-4" /> {mileage.toLocaleString()} km
              </Badge>
            )}
            {fuelType && (
              <Badge variant="outline" className="flex items-center">
                {fuelType}
              </Badge>
            )}
            {location && (
              <Badge variant="outline" className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" /> {location.city}, {location.country}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ImageGallery images={galleryImages} />
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-4">
                {price ? `${price.toLocaleString()} ${currency}` : "Cena nieustalona"}
              </div>
              <div className="prose max-w-none">
                <p>{description || "Opis nie został jeszcze dodany."}</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Zamknij podgląd</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}