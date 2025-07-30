"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  BarChart4, 
  Fuel, 
  MapPin, 
  Tag, 
  Car, 
  Info, 
  User, 
  ShieldCheck,
  Expand,
  Heart,
  Share2,
  AlertTriangle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ContactPanel } from "./contact-panel"
import type { ExtendedListing } from "@/types/listings"

interface VehicleDetailsProps {
  listing: ExtendedListing
  relatedListings?: ExtendedListing[]
  isLoading?: boolean
}

export function VehicleDetails({ listing, relatedListings = [], isLoading = false }: VehicleDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-96 bg-muted rounded-lg"></div>
        <div className="h-8 w-3/4 bg-muted rounded"></div>
        <div className="h-6 w-1/4 bg-muted rounded"></div>
        <div className="h-40 bg-muted rounded"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Ogłoszenie niedostępne</h2>
          <p className="text-muted-foreground mb-6">
            To ogłoszenie nie istnieje lub zostało usunięte.
          </p>
          <Button asChild>
            <Link href="/ogloszenia">Wróć do ogłoszeń</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const images = listing.images || [listing.main_image].filter(Boolean) as string[]
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "Cena na żądanie"
    return `${price.toLocaleString()} CHF`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric"
    })
  }

  return (
    <div className="space-y-8">
      {/* Mobile Contact Button - only visible on small screens */}
      <div className="md:hidden sticky top-2 z-10 mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full">Kontakt ze sprzedającym</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] pt-6">
            <ContactPanel listing={listing} />
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Gallery */}
      <div className="relative overflow-hidden rounded-lg bg-muted">
        {images.length > 0 ? (
          <>
            <div className="relative aspect-video md:aspect-[16/9] lg:aspect-[21/9]">
              <Image
                src={images[currentImageIndex]}
                alt={listing.title || ""}
                fill
                priority
                className="object-cover"
              />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 bg-background/80 hover:bg-background/90"
                onClick={() => setFullscreenImage(images[currentImageIndex])}
              >
                <Expand className="h-5 w-5" />
              </Button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-background/80 rounded-full px-3 py-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === currentImageIndex ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
              
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 hover:bg-background/90"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 hover:bg-background/90"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Thumbnails */}
            <div className="hidden md:flex overflow-x-auto space-x-2 p-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded ${
                    index === currentImageIndex
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`Zdjęcie ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="aspect-video md:aspect-[16/9] lg:aspect-[21/9] flex items-center justify-center">
            <Car className="h-24 w-24 text-muted-foreground/40" />
          </div>
        )}
      </div>
      
      {/* Fullscreen image modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src={fullscreenImage}
              alt={listing.title || ""}
              fill
              className="object-contain"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4"
              onClick={() => setFullscreenImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                {listing.categories && (
                  <Badge variant="outline" className="mb-2">
                    {listing.categories.name}
                  </Badge>
                )}
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">{listing.title}</h1>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" title="Dodaj do ulubionych">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" title="Udostępnij">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3 flex items-center text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {listing.profiles?.location || "Szwajcaria"}
              <span className="mx-2">•</span>
              <span>ID: {listing.id.substring(0, 8).toUpperCase()}</span>
              <span className="mx-2">•</span>
              <span>Dodano: {formatDate(listing.created_at)}</span>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(listing.price)}
                </p>
                {listing.is_featured && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    Wyróżnione
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Main Features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {listing.year && (
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-6 w-6 mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Rok</p>
                <p className="font-medium">{listing.year}</p>
              </div>
            )}
            {listing.mileage && (
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <BarChart4 className="h-6 w-6 mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Przebieg</p>
                <p className="font-medium">{listing.mileage.toLocaleString()} km</p>
              </div>
            )}
            {listing.fuel_type && (
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <Fuel className="h-6 w-6 mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Paliwo</p>
                <p className="font-medium">{listing.fuel_type}</p>
              </div>
            )}
            {listing.transmission && (
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mb-1 text-muted-foreground">
                  <circle cx="6" cy="6" r="2" />
                  <circle cx="18" cy="18" r="2" />
                  <path d="M6 8v8a4 4 0 0 0 4 4h4" />
                  <path d="M18 16V8a4 4 0 0 0-4-4H8" />
                </svg>
                <p className="text-sm text-muted-foreground">Skrzynia</p>
                <p className="font-medium">{listing.transmission}</p>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Tabs */}
          <Tabs defaultValue="opis">
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid md:grid-cols-3">
              <TabsTrigger value="opis">Opis</TabsTrigger>
              <TabsTrigger value="szczegoly">Szczegóły</TabsTrigger>
              <TabsTrigger value="wyposazenie">Wyposażenie</TabsTrigger>
            </TabsList>
            
            <TabsContent value="opis" className="mt-6 space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {listing.description?.split("\n").map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                )) || <p>Brak opisu</p>}
              </div>
            </TabsContent>
            
            <TabsContent value="szczegoly" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {listing.brand && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Marka</span>
                    <span className="font-medium">{listing.brand}</span>
                  </div>
                )}
                {listing.model && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium">{listing.model}</span>
                  </div>
                )}
                {listing.year && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Rok produkcji</span>
                    <span className="font-medium">{listing.year}</span>
                  </div>
                )}
                {listing.mileage && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Przebieg</span>
                    <span className="font-medium">{listing.mileage.toLocaleString()} km</span>
                  </div>
                )}
                {listing.fuel_type && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Rodzaj paliwa</span>
                    <span className="font-medium">{listing.fuel_type}</span>
                  </div>
                )}
                {listing.transmission && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Skrzynia biegów</span>
                    <span className="font-medium">{listing.transmission}</span>
                  </div>
                )}
                {listing.exterior_color && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Kolor</span>
                    <span className="font-medium">{listing.exterior_color}</span>
                  </div>
                )}
                {listing.interior_color && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Kolor wnętrza</span>
                    <span className="font-medium">{listing.interior_color}</span>
                  </div>
                )}
                {listing.vin && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">VIN</span>
                    <span className="font-medium">{listing.vin}</span>
                  </div>
                )}
                {listing.registration_number && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Nr rejestracyjny</span>
                    <span className="font-medium">{listing.registration_number}</span>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="wyposazenie" className="mt-6">
              {listing.features && listing.features.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {listing.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center py-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Brak informacji o wyposażeniu</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-4 hidden md:block">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Kontakt ze sprzedającym</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactPanel listing={listing} />
            </CardContent>
          </Card>
          
          {/* Safety Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium">
                <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                Bezpieczne zakupy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Sprawdź pojazd przed zakupem</p>
              <p>• Nigdy nie wysyłaj zaliczek przed obejrzeniem pojazdu</p>
              <p>• Spotkaj się ze sprzedającym w bezpiecznym miejscu</p>
              <p>• Sprawdź dokumenty pojazdu i tożsamość sprzedającego</p>
              <p>• W razie wątpliwości skonsultuj się z ekspertem</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Related Listings */}
      {relatedListings.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Podobne ogłoszenia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedListings.slice(0, 3).map((related) => (
              <Link 
                href={`/ogloszenia/${related.id}`}
                key={related.id}
                className="group"
              >
                <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div className="relative h-48 w-full overflow-hidden">
                    {related.main_image ? (
                      <Image
                        src={related.main_image}
                        alt={related.title || ""}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <Car className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium line-clamp-1">{related.title}</h3>
                    <p className="font-bold text-lg text-primary mt-1">
                      {formatPrice(related.price)}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                      {related.year && (
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" /> {related.year}
                        </div>
                      )}
                      {related.mileage && (
                        <div className="flex items-center">
                          <BarChart4 className="mr-1 h-4 w-4" /> {related.mileage.toLocaleString()} km
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
