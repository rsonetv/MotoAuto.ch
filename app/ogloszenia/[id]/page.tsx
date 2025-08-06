"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import ImageGallery from "@/components/ui/image-gallery/ImageGallery"
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
  Gauge, 
  MapPin 
} from "lucide-react"
import { createClientComponentClient } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"
import { Listing } from "@/types/listings"

export default function VehicleDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        const supabase = createClientComponentClient()
        
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            profiles: user_id (
              id,
              full_name,
              dealer_name,
              is_dealer,
              avatar_url,
              email,
              phone,
              rating,
              listings_count
            )
          `)
          .eq('id', params.id)
          .single()
        
        if (error) throw error
        
        // Increment view count
        await supabase
          .from('listings')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', params.id)
        
        setVehicle({
          ...data,
          views: (data.views || 0) + 1
        } as unknown as Listing)
        
      } catch (err: any) {
        console.error('Error fetching vehicle details:', err)
        setError(err.message || 'Nie udało się pobrać szczegółów pojazdu')
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicleDetails()
  }, [params.id])
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
            <div>
              <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !vehicle) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Wystąpił błąd</h2>
            <p className="text-muted-foreground mb-4">{error || 'Nie udało się znaleźć tego pojazdu'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do listy ogłoszeń
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <Breadcrumb className="mb-6">
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
              <BreadcrumbLink href={`/ogloszenia?condition=${vehicle.condition}`}>
                {vehicle.condition === 'new' ? 'Nowe' : vehicle.condition === 'used' ? 'Używane' : 'Uszkodzone'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{vehicle.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Heart className="mr-2 h-4 w-4" /> Zapisz
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" /> Udostępnij
            </Button>
            <Button variant="outline" size="sm">
              <Flag className="mr-2 h-4 w-4" /> Zgłoś
            </Button>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-3">{vehicle.title}</h1>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {vehicle.year && (
            <Badge variant="outline" className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" /> {vehicle.year}
            </Badge>
          )}
          {vehicle.mileage && (
            <Badge variant="outline" className="flex items-center">
              <Gauge className="mr-1 h-4 w-4" /> {vehicle.mileage.toLocaleString()} km
            </Badge>
          )}
          {vehicle.fuel_type && (
            <Badge variant="outline" className="flex items-center">
              {vehicle.fuel_type}
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center">
            <MapPin className="mr-1 h-4 w-4" /> {vehicle.location}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <Eye className="mr-1 h-4 w-4" /> {vehicle.views} wyświetleń
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={vehicle.images ? vehicle.images.map(img => ({ src: img, alt: vehicle.title || 'Vehicle image', thumbnail: img, is360: false })) : []} />
            <VehicleDetails listing={vehicle} />
          </div>
          
          <div className="space-y-6">
            <ContactPanel listing={vehicle} />
          </div>
        </div>
        
        <Separator className="my-12" />
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Podobne ogłoszenia</h2>
          <SimilarVehicles 
            currentListingId={vehicle.id}
            category={vehicle.category}
            make={vehicle.brand}
            model={vehicle.model} 
          />
        </section>
      </main>
      
      <Footer />
    </>
  )
}