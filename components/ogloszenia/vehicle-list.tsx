"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Eye, 
  Heart, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Star,
  User,
  Building,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { createClientComponentClient } from "@/lib/supabase"
import { toast } from "sonner"
import type { Database } from "@/lib/database.types"

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles?: {
    id: string;
    full_name: string | null;
    dealer_name: string | null;
    is_dealer: boolean;
    location: string | null;
    phone: string | null;
    email: string | null;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: string[];
  views_count?: number;
  favorites_count?: number;
  is_premium?: boolean;
  fuel_type?: string;
  transmission?: string;
}

interface VehicleListProps {
  listings: Listing[]
  loading: boolean
  totalCount: number
  currentPage: number
  onPageChange: (page: number) => void
  category: string
}

interface VehicleCardProps {
  listing: Listing
  onFavoriteToggle: (listingId: string, isFavorite: boolean) => void
}

function VehicleCard({ listing, onFavoriteToggle }: VehicleCardProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setFavoriteLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Musisz być zalogowany, aby dodać do ulubionych')
        router.push('/auth/login')
        return
      }

      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id)
        
        setIsFavorite(false)
        toast.success('Usunięto z ulubionych')
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listing.id
          })
        
        setIsFavorite(true)
        toast.success('Dodano do ulubionych')
      }

      onFavoriteToggle(listing.id, !isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Błąd podczas dodawania do ulubionych')
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleCardClick = () => {
    router.push(`/ogloszenia/${listing.id}`)
  }

  const mainImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : '/placeholder-car.jpg'

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-green-100 text-green-800'
      case 'excellent':
        return 'bg-blue-100 text-blue-800'
      case 'very_good':
        return 'bg-emerald-100 text-emerald-800'
      case 'good':
        return 'bg-yellow-100 text-yellow-800'
      case 'fair':
        return 'bg-orange-100 text-orange-800'
      case 'damaged':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: 'Nowy',
      excellent: 'Doskonały',
      very_good: 'Bardzo dobry',
      good: 'Dobry',
      fair: 'Przeciętny',
      damaged: 'Uszkodzony'
    }
    return labels[condition] || condition
  }

  const getFuelTypeLabel = (fuelType: string) => {
    const labels: Record<string, string> = {
      gasoline: 'Benzyna',
      diesel: 'Diesel',
      electric: 'Elektryczny',
      hybrid: 'Hybryda',
      plugin_hybrid: 'Hybryda plug-in',
      gas: 'Gaz',
      ethanol: 'Etanol'
    }
    return labels[fuelType] || fuelType
  }

  const getTransmissionLabel = (transmission: string) => {
    const labels: Record<string, string> = {
      manual: 'Manualna',
      automatic: 'Automatyczna',
      semi_automatic: 'Półautomatyczna',
      cvt: 'CVT'
    }
    return labels[transmission] || transmission
  }

  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <div onClick={handleCardClick}>
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <Image
            src={typeof mainImage === 'string' ? mainImage : '/placeholder-car.jpg'}
            alt={listing.title || 'Vehicle'}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {listing.is_premium && (
              <Badge className="bg-yellow-500 text-white">
                <Star className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            )}
            {listing.condition && (
              <Badge className={getConditionColor(listing.condition)}>
                {getConditionLabel(listing.condition)}
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={handleFavoriteClick}
            disabled={favoriteLoading}
          >
            <Heart 
              className={`h-4 w-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} 
            />
          </Button>

          {/* Image Count */}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
              +{listing.images.length - 1} zdjęć
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">
              {listing.title}
            </h3>
            <p className="text-2xl font-bold text-primary">
              {listing.price ? `${listing.price.toLocaleString()} ${listing.currency}` : 'Cena do uzgodnienia'}
            </p>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{listing.year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              <span>{listing.mileage?.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              <span>{listing.fuel_type ? getFuelTypeLabel(listing.fuel_type) : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>{listing.transmission ? getTransmissionLabel(listing.transmission) : 'N/A'}</span>
            </div>
          </div>

          {/* Location & Seller */}
          <div className="space-y-2 mb-3">
            {listing.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {listing.profiles?.is_dealer ? (
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {listing.profiles.dealer_name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Dealer
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    {listing.profiles?.full_name || 'Użytkownik prywatny'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{listing.views_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{listing.favorites_count || 0}</span>
              </div>
            </div>
            <span>
              {listing.created_at && formatDistanceToNow(new Date(listing.created_at), {
                addSuffix: true,
                locale: pl
              })}
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function VehicleList({ 
  listings, 
  loading, 
  totalCount, 
  currentPage, 
  onPageChange,
  category 
}: VehicleListProps) {
  const itemsPerPage = 20
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handleFavoriteToggle = (listingId: string, isFavorite: boolean) => {
    // Update local state if needed
    console.log(`Listing ${listingId} favorite status: ${isFavorite}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-[4/3] w-full rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Brak ogłoszeń</h3>
          <p className="text-muted-foreground mb-6">
            Nie znaleziono ogłoszeń spełniających kryteria wyszukiwania.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Wyczyść filtry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Znaleziono {totalCount.toLocaleString()} ogłoszeń
          {category !== 'all' && (
            <span> w kategorii {category === 'auto' ? 'Samochody' : 'Motocykle'}</span>
          )}
        </p>
        <div className="text-sm text-muted-foreground">
          Strona {currentPage} z {totalPages}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <VehicleCard
            key={listing.id}
            listing={listing}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Poprzednia
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Następna
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
