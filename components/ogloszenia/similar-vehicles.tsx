"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import type { Database } from "@/types/database.types"

type Listing = Database['public']['Tables']['listings']['Row'] & {
  category?: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuel_type?: string;
  image_urls?: string[];
}

interface SimilarVehiclesProps {
  currentListingId: string
  category: string
  make?: string
  model?: string
  limit?: number
}

export function SimilarVehicles({ 
  currentListingId, 
  category, 
  make, 
  model, 
  limit = 4 
}: SimilarVehiclesProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [similarVehicles, setSimilarVehicles] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilarVehicles = async () => {
      try {
        setLoading(true)
        
        // Base query to get similar vehicles
        let query = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .eq('category', category)
          .neq('id', currentListingId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        // Add make filter if provided
        if (make) {
          query = query.eq('make', make)
        }
        
        // Add model filter if provided
        if (model) {
          query = query.eq('model', model)
        }
        
        const { data, error } = await query
        
        if (error) {
          console.error('Error fetching similar vehicles:', error)
          return
        }
        
        setSimilarVehicles(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchSimilarVehicles()
    }
  }, [currentListingId, category, make, model, limit, supabase])

  const handleViewAll = () => {
    let queryParams = new URLSearchParams()
    queryParams.append('category', category)
    
    if (make) {
      queryParams.append('make', make)
    }
    
    if (model) {
      queryParams.append('model', model)
    }
    
    router.push(`/ogloszenia?${queryParams.toString()}`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Podobne pojazdy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(limit).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="bg-muted h-48 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-5 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (similarVehicles.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Podobne pojazdy</h2>
        <Button variant="ghost" size="sm" onClick={handleViewAll}>
          Zobacz wszystkie <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {similarVehicles.map((vehicle) => (
          <Card 
            key={vehicle.id} 
            className="overflow-hidden transition-all hover:shadow-md"
            onClick={() => router.push(`/ogloszenia/${vehicle.id}`)}
          >
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={vehicle.image_urls?.[0] || '/placeholder.jpg'}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </AspectRatio>
              <Badge className="absolute top-2 right-2 bg-primary/90 hover:bg-primary">{vehicle.category}</Badge>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg truncate">{vehicle.title || `${vehicle.make} ${vehicle.model}`}</h3>
              <p className="text-muted-foreground text-sm mb-2 truncate">
                {vehicle.year} • {vehicle.mileage} km • {vehicle.fuel_type}
              </p>
              <p className="font-bold text-primary">{formatPrice(vehicle.price)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
