'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Gauge,
  Car,
  Heart,
  Share2,
  AlertTriangle,
  Eye,
  Users
} from 'lucide-react'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Image from 'next/image'
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import LiveAuctionInterface from '@/components/auction/LiveAuctionInterface'
import { Auction } from '@/types/auctions'

export default function AuctionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWatching, setIsWatching] = useState(false)
  const [auctionData, setAuctionData] = useState<Auction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        const supabase = createClientComponentClient()
        
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            profiles (
              *
            )
          `)
          .eq('id', params.id)
          .single()
        
        if (error) throw error
        
        setAuctionData(data as unknown as Auction)
        
      } catch (err: any) {
        console.error('Error fetching auction details:', err)
        setError(err.message || 'Nie udało się pobrać szczegółów aukcji')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAuctionDetails()
  }, [params.id])


  const toggleWatch = () => {
    setIsWatching(!isWatching)
    // Tutaj byłoby API call
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !auctionData) {
    return <div>Error: {error}</div>
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do aukcji
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {auctionData.title}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={toggleWatch}>
                      <Heart className={`w-4 h-4 mr-1 ${isWatching ? 'fill-red-500 text-red-500' : ''}`} />
                      {auctionData.watch_count}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-1" />
                      Udostępnij
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="secondary">
                    {auctionData.category === 'car' ? '🚗 Samochody' : '🏍️ Motocykle'}
                  </Badge>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {auctionData.location}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {auctionData.views} wyświetleń
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {auctionData.bid_count} ofert
                  </span>
                </div>
              </div>

              {/* Image Gallery */}
              <Card>
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={auctionData.images ? auctionData.images[currentImageIndex] : ''}
                      alt={`${auctionData.title} - zdjęcie ${currentImageIndex + 1}`}
                      width={800}
                      height={600}
                      className="w-full h-96 object-cover rounded-t-lg"
                    />
                    
                    {/* Image Navigation */}
                    {auctionData.images && auctionData.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="flex space-x-2">
                          {auctionData.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentImageIndex
                                  ? 'bg-white'
                                  : 'bg-white/50 hover:bg-white/75'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Strip */}
                  {auctionData.images && auctionData.images.length > 1 && (
                    <div className="p-4 border-t">
                      <div className="flex space-x-2 overflow-x-auto">
                        {auctionData.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-15 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === currentImageIndex
                                ? 'border-primary'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`Miniatura ${index + 1}`}
                              width={80}
                              height={60}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Szczegóły pojazdu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Calendar className="w-8 h-8 mx-auto text-primary mb-2" />
                      <div className="font-semibold">{auctionData.year}</div>
                      <div className="text-sm text-gray-500">Rok produkcji</div>
                    </div>
                    <div className="text-center">
                      <Gauge className="w-8 h-8 mx-auto text-primary mb-2" />
                      <div className="font-semibold">{auctionData.mileage?.toLocaleString()} km</div>
                      <div className="text-sm text-gray-500">Przebieg</div>
                    </div>
                    <div className="text-center">
                      <Car className="w-8 h-8 mx-auto text-primary mb-2" />
                      <div className="font-semibold">{auctionData.transmission}</div>
                      <div className="text-sm text-gray-500">Skrzynia</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                        P
                      </div>
                      <div className="font-semibold">{auctionData.power}</div>
                      <div className="text-sm text-gray-500">Moc</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Opis pojazdu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                      {auctionData.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Bidding */}
            <div className="space-y-6">
              <LiveAuctionInterface auctionId={params.id as string} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
