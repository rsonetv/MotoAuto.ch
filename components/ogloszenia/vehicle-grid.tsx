"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, MapPin, Calendar, Gauge, Car, Bike } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { createClient } from "@supabase/supabase-js"

type Listing = {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  year: number | null;
  mileage: number | null;
  fuel_type: string | null;
  created_at: string;
  updated_at: string;
  main_image: string | null;
  images: string[] | null;
  is_auction: boolean;
  location: string | null;
  views: number;
  vehicle_type?: 'car' | 'motorcycle' | string;
  profiles?: {
    id: string;
    full_name: string | null;
    dealer_name: string | null;
    is_dealer: boolean;
    location: string | null;
    phone: string | null;
    email: string | null;
  };
}

interface VehicleGridProps {
  category: string;
  listings?: Listing[];
}

export function VehicleGrid({ category, listings: propListings }: VehicleGridProps) {
  const [listings, setListings] = useState<Listing[]>(propListings || []);
  const [loading, setLoading] = useState(!propListings);
  
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  
  useEffect(() => {
    // If listings are provided as props, use them
    if (propListings) {
      setListings(propListings);
      return;
    }
    
    // Otherwise fetch listings based on the category
    const fetchListings = async () => {
      setLoading(true);
      try {
        const categoryType = category === 'auto' ? 'car' : 'motorcycle';
        
        let query = supabase
          .from('listings')
          .select(`
            *,
            profiles (*)
          `)
          .eq('is_auction', false)
          .order('created_at', { ascending: false })
          .limit(6);
          
        if (category !== 'all') {
          query = query.eq('type', categoryType);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching listings:', error);
          return;
        }
        
        setListings(data as Listing[]);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [category, propListings, supabase]);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-8 w-1/2 mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (listings.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Brak ogłoszeń do wyświetlenia</p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/ogloszenia/dodaj">Dodaj ogłoszenie</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing, index) => {
        const timeAgo = listing.created_at 
          ? formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: pl })
          : '';
          
        return (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <Link href={`/ogloszenia/${listing.id}`}>
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                {listing.main_image ? (
                  <img
                    src={listing.main_image}
                    alt={listing.title || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Brak zdjęcia
                  </div>
                )}
                
                {category === 'all' && (
                  <Badge className="absolute top-2 left-2 bg-gray-700">
                    {listing.vehicle_type === 'car' ? <Car className="h-3 w-3 mr-1" /> : <Bike className="h-3 w-3 mr-1" />}
                    {listing.vehicle_type === 'car' ? 'AUTO' : 'MOTO'}
                  </Badge>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-lg line-clamp-2">{listing.title}</h3>
                
                <div className="mt-2 text-xl font-bold text-primary">
                  {listing.price ? listing.price.toLocaleString() : "Cena na żądanie"} {listing.currency || "CHF"}
                </div>
                
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {listing.year && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{listing.year}</span>
                    </div>
                  )}
                  
                  {listing.mileage && (
                    <div className="flex items-center">
                      <Gauge className="h-4 w-4 mr-1" />
                      <span>{listing.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                  
                  {listing.fuel_type && (
                    <div className="flex items-center">
                      <span>{listing.fuel_type}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  {(listing.location || listing.profiles?.location) && (
                    <div className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{listing.location || listing.profiles?.location}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{listing.views || 0}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Dodano {timeAgo}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
