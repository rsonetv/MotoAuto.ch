"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, MapPin, Tag, Info, BarChart4, Fuel, Car, Star } from "lucide-react"
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
  main_image?: string;
  is_featured?: boolean;
  is_auction?: boolean;
  fuel_type?: string;
  transmission?: string;
}

interface VehicleListProps {
  listings: Listing[];
  loading: boolean;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  category: string;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

export function VehicleList({ 
  listings, 
  loading, 
  totalCount, 
  currentPage, 
  onPageChange,
  category,
  viewMode = "grid",
  onViewModeChange
}: VehicleListProps) {
  const router = useRouter()
  const itemsPerPage = 12
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const formatPrice = (price: number | null) => {
    if (!price) return "Cena na żądanie"
    return `${price.toLocaleString()} CHF`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Dzisiaj"
    if (diffDays === 1) return "Wczoraj"
    if (diffDays < 7) return `${diffDays} dni temu`
    
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-28" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-1/3 h-48">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-2/3" />
                      <div className="flex flex-wrap gap-2 py-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex justify-between pt-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-28" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  if (listings.length === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Info className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-xl font-medium">Brak ogłoszeń</p>
          </div>
          <p className="text-muted-foreground mb-6">
            Nie znaleziono ogłoszeń pasujących do wybranych kryteriów.
          </p>
          <Button variant="outline" onClick={() => router.push('/ogloszenia')}>
            Resetuj filtry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Znaleziono {totalCount} {totalCount === 1 ? 'ogłoszenie' : totalCount < 5 ? 'ogłoszenia' : 'ogłoszeń'}
        </p>
        
        {onViewModeChange && (
          <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as "grid" | "list")}>
            <TabsList className="grid w-[120px] grid-cols-2">
              <TabsTrigger value="grid">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </TabsTrigger>
              <TabsTrigger value="list">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link 
              href={`/ogloszenia/${listing.id}`} 
              key={listing.id}
              className="group"
            >
              <Card className="overflow-hidden transition-all duration-200 hover:shadow-md h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  {listing.main_image ? (
                    <Image
                      src={listing.main_image}
                      alt={listing.title || ""}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <Car className="h-16 w-16 text-muted-foreground/40" />
                    </div>
                  )}
                  {listing.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                      <Star className="mr-1 h-3 w-3" /> Wyróżnione
                    </Badge>
                  )}
                  {listing.is_auction && (
                    <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600">
                      Aukcja
                    </Badge>
                  )}
                </div>
                <CardContent className="flex-grow p-4 space-y-2">
                  <h3 className="font-medium line-clamp-1 text-lg">{listing.title}</h3>
                  <p className="font-bold text-xl text-primary">
                    {formatPrice(listing.price)}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                    {listing.year && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" /> {listing.year}
                      </div>
                    )}
                    {listing.mileage && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BarChart4 className="mr-1 h-4 w-4" /> {listing.mileage.toLocaleString()} km
                      </div>
                    )}
                    {listing.fuel_type && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Fuel className="mr-1 h-4 w-4" /> {listing.fuel_type}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" /> 
                    {listing.profiles?.location || "Szwajcaria"}
                  </div>
                  <div className="flex items-center">
                    {formatDate(listing.created_at)}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Link 
              href={`/ogloszenia/${listing.id}`} 
              key={listing.id}
              className="group block"
            >
              <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-1/3 h-56 md:h-auto">
                    {listing.main_image ? (
                      <Image
                        src={listing.main_image}
                        alt={listing.title || ""}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <Car className="h-16 w-16 text-muted-foreground/40" />
                      </div>
                    )}
                    {listing.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                        <Star className="mr-1 h-3 w-3" /> Wyróżnione
                      </Badge>
                    )}
                    {listing.is_auction && (
                      <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600">
                        Aukcja
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 p-5">
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">{listing.title}</h3>
                      <p className="font-bold text-2xl text-primary">
                        {formatPrice(listing.price)}
                      </p>
                      <div className="flex flex-wrap gap-4 py-2">
                        {listing.year && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" /> {listing.year}
                          </div>
                        )}
                        {listing.mileage && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <BarChart4 className="mr-1 h-4 w-4" /> {listing.mileage.toLocaleString()} km
                          </div>
                        )}
                        {listing.fuel_type && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Fuel className="mr-1 h-4 w-4" /> {listing.fuel_type}
                          </div>
                        )}
                        {listing.transmission && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <circle cx="6" cy="6" r="2" />
                              <circle cx="18" cy="18" r="2" />
                              <path d="M6 8v8a4 4 0 0 0 4 4h4" />
                              <path d="M18 16V8a4 4 0 0 0-4-4H8" />
                            </svg>
                            {listing.transmission}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between pt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" /> 
                          {listing.profiles?.location || "Szwajcaria"}
                        </div>
                        <div className="flex items-center">
                          {formatDate(listing.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Calculate page numbers to display centered around current page
              const pageOffset = Math.min(
                Math.max(0, currentPage - 3),
                Math.max(0, totalPages - 5)
              );
              const pageNum = i + 1 + pageOffset;
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(pageNum);
                    }}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
