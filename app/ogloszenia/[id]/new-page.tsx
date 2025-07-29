"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { VehicleGallery } from "@/components/ogloszenia/vehicle-gallery"
import { VehicleDetails } from "@/components/ogloszenia/vehicle-details"
import { ContactPanel } from "@/components/ogloszenia/contact-panel"
import { SimilarVehicles } from "@/components/ogloszenia/similar-vehicles"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Flag, 
  Eye, 
  Calendar,
  MapPin,
  Star,
  ShieldCheck
} from "lucide-react"
import { createClientComponentClient } from "@/lib/supabase"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
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
    avatar_url?: string | null;
    bio?: string | null;
    website?: string | null;
    verification_status?: string;
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
}

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listingId = params?.id as string
  const supabase = createClientComponentClient()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [viewsUpdated, setViewsUpdated] = useState(false)

  useEffect(() => {
    if (listingId) {
      loadListing()
    }
  }, [listingId])

  const loadListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles (
            id,
            full_name,
            dealer_name,
            is_dealer,
            location,
            phone,
            email,
            avatar_url,
            bio,
            website,
            verification_status
          ),
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', listingId)
        .eq('status', 'active')
        .single()

      if (error) throw error

      if (!data) {
        router.push('/ogloszenia')
        toast.error('Ogłoszenie nie zostało znalezione')
        return
      }

      setListing(data)

      // Update views count (only once per session)
      if (!viewsUpdated) {
        await supabase
          .from('listings')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', listingId)
        
        setViewsUpdated(true)
      }

      // Check if in favorites
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: favoriteData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
          .single()
        
        setIsFavorite(!!favoriteData)
      }

    } catch (error) {
      console.error('Error loading listing:', error)
      toast.error('Błąd podczas ładowania ogłoszenia')
      router.push('/ogloszenia')
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Musisz być zalogowany')
        router.push('/auth/login')
        return
      }

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
        
        setIsFavorite(false)
        toast.success('Usunięto z ulubionych')
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listingId
          })
        
        setIsFavorite(true)
        toast.success('Dodano do ulubionych')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Błąd podczas dodawania do ulubionych')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: `Sprawdź to ogłoszenie: ${listing?.title}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link skopiowany do schowka')
    }
  }

  const handleReport = () => {
    toast.info('Funkcja zgłaszania będzie dostępna wkrótce')
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (!listing) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Ogłoszenie nie znalezione</h1>
            <Button onClick={() => router.push('/ogloszenia')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do ogłoszeń
            </Button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const categorySlug = listing.categories?.slug || 'auto'

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/ogloszenia">Ogłoszenia</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/ogloszenia?category=${categorySlug}`}>
                  {listing.categories?.name || 'Samochody'}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{listing.brand} {listing.model}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {listing.is_premium && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="mr-1 h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                  {listing.profiles?.verification_status === 'verified' && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <ShieldCheck className="mr-1 h-3 w-3" />
                      Zweryfikowany
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{listing.views_count || 0} wyświetleń</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Dodano {formatDistanceToNow(new Date(listing.created_at), {
                        addSuffix: true,
                        locale: pl
                      })}
                    </span>
                  </div>
                  {listing.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFavoriteToggle}
                >
                  <Heart 
                    className={`mr-2 h-4 w-4 ${
                      isFavorite ? 'fill-red-500 text-red-500' : ''
                    }`} 
                  />
                  {isFavorite ? 'W ulubionych' : 'Dodaj do ulubionych'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Udostępnij
                </Button>
                <Button variant="outline" size="sm" onClick={handleReport}>
                  <Flag className="mr-2 h-4 w-4" />
                  Zgłoś
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="text-4xl font-bold text-primary">
                {listing.price 
                  ? `${listing.price.toLocaleString()} ${listing.currency}` 
                  : 'Cena do uzgodnienia'
                }
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Gallery and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery */}
              <VehicleGallery 
                images={listing.images || []} 
                title={listing.title}
              />

              {/* Vehicle Details */}
              <VehicleDetails listing={listing} />

              {/* Description */}
              {listing.description && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Opis pojazdu</h2>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">{listing.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Contact */}
            <div className="space-y-6">
              <ContactPanel 
                listing={listing}
                seller={listing.profiles}
              />
            </div>
          </div>

          {/* Similar Vehicles */}
          <div className="mt-12">
            <SimilarVehicles 
              currentListing={listing}
              category={categorySlug}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
