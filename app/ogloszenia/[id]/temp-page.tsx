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
import type { Database } from "@/types/database.types"

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles?: {
    id: string;
    full_name: string | null;
    dealer_name: string | null;
    is_dealer: boolean;
    location: string | null;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
    bio?: string | null;
    website?: string | null;
    verification_status?: string;
  };
  categories?: {
    id: string;
    name: string;
  };
  // Dodatkowe pola, które nie są w bazie danych, ale są używane w komponencie
  price_negotiable?: boolean;
  category_id?: string;
  package_id?: string | null;
  images?: string[];
  main_image?: string;
  features?: string[];
  exterior_color?: string;
  interior_color?: string;
  image_urls?: string[];
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
            verification_status
          ),
          categories (
            id,
            name
          )
        `)
        .eq('id', listingId)
        .single()

      if (error) {
        console.error('Error fetching listing:', error)
        setLoading(false)
        return
      }

      setListing(data)

      // Check if listing is in favorites
      const user = await supabase.auth.getUser()
      if (user.data?.user) {
        const { data: favoriteData } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.data.user.id)
          .eq('listing_id', listingId)
          .single()
        
        setIsFavorite(!!favoriteData)
      }

      // Increment view count if not already done in this session
      if (!viewsUpdated) {
        await supabase
          .rpc('increment_views', { listing_id: listingId })
        setViewsUpdated(true)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      const user = await supabase.auth.getUser()
      
      if (!user.data?.user) {
        toast.error('Musisz być zalogowany, aby dodać ogłoszenie do ulubionych')
        router.push('/auth/login')
        return
      }
      
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.data.user.id)
          .eq('listing_id', listingId)
          
        toast.success('Usunięto z ulubionych')
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.data.user.id,
            listing_id: listingId
          })
          
        toast.success('Dodano do ulubionych')
      }
      
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Wystąpił błąd. Spróbuj ponownie później.')
    }
  }

  const handleShare = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast.success('Link skopiowany do schowka')
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Nie udało się skopiować linku')
    }
  }

  const handleReport = () => {
    toast.info('Funkcja zgłaszania ogłoszenia będzie dostępna wkrótce')
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

  return (
    <>
      <Header />
      <main className="container py-8">
        {/* Breadcrumb navigation */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Strona główna</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/ogloszenia">Ogłoszenia</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{listing.title || `${listing.brand} ${listing.model}`}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót
        </Button>

        {/* Title and action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{listing.title || `${listing.brand} ${listing.model}`}</h1>
            <div className="flex items-center mt-1 text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">
                Dodano {formatDistanceToNow(new Date(listing.created_at), { locale: pl, addSuffix: true })}
              </span>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{listing.profiles?.location || 'Lokalizacja nieznana'}</span>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Eye className="h-4 w-4 mr-1" />
              <span className="text-sm">{listing.views || 0} wyświetleń</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              onClick={handleToggleFavorite}
            >
              <Heart className={`mr-1 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Ulubione' : 'Dodaj do ulubionych'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-1 h-4 w-4" />
              Udostępnij
            </Button>
            <Button variant="outline" size="sm" onClick={handleReport}>
              <Flag className="mr-1 h-4 w-4" />
              Zgłoś
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <VehicleGallery 
              images={listing.image_urls || []} 
              title={listing.title || `${listing.brand} ${listing.model}`} 
            />
            
            {/* Vehicle details */}
            <VehicleDetails listing={listing} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {listing.price ? `${listing.price.toLocaleString('pl-PL')} PLN` : 'Cena na zapytanie'}
                </div>
                {listing.price_negotiable && (
                  <Badge variant="outline" className="mb-4">Do negocjacji</Badge>
                )}
                <div className="mt-4">
                  <Badge className="mr-2">{listing.categories?.name || 'Pojazd'}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact panel */}
            <ContactPanel listing={listing} />
          </div>
        </div>

        {/* Similar vehicles */}
        <div className="mt-12">
          <SimilarVehicles 
            currentListingId={listing.id.toString()}
            category={listing.category_id || listing.category || ""}
            make={listing.brand || undefined}
            model={listing.model || undefined}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
