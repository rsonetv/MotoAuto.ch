'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Vehicle360View from "@/components/ui/vehicle-360-view"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  ArrowLeft,
  History,
  MapPin,
  Calendar,
  Gauge,
  Car,
  Heart,
  Share2,
  AlertTriangle,
  Eye,
  Users,
  TrendingUp,
  ShieldCheck
} from 'lucide-react'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Image from 'next/image'
import { createClientComponentClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { Tables } from '@/types/supabase'
import LiveAuctionInterface from '@/components/auction/LiveAuctionInterface'
import MarketDataContext from '@/components/auction/MarketDataContext'
import { Auction, AuctionEdit, Bid } from '@/types/auctions'
import { getWebSocketClient, AuctionWebSocketClient } from '@/lib/websocket/client'
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { AuctionQuestions } from '@/components/aukcje/auction-questions'
import { Session } from '@supabase/auth-helpers-nextjs'

type MarketData = {
  average_market_price: number
  price_history: { date: string; price: number }[]
  similar_vehicles: { id: number; title: string; final_price: number }[]
}

const Toast = ({ title, description }: { title: string, description: string }) => {
  const { toast } = useToast()

  useEffect(() => {
    toast({
      title,
      description,
      action: <ToastAction altText="Goto schedule to undo">Undo</ToastAction>,
    })
  }, [title, description, toast])

  return null
}

export default function AuctionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWatching, setIsWatching] = useState(false)
  const [auctionData, setAuctionData] = useState<Auction | null>(null)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [wsClient, setWsClient] = useState<AuctionWebSocketClient | null>(null)
  const [isExtended, setIsExtended] = useState(false);
  const [extensionCount, setExtensionCount] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);

  const handleNewBid = useCallback((data: {
    auctionId: string;
    bid: {
      id: string;
      amount: number;
      userId: string;
      userName: string;
      isAutomatic: boolean;
      timestamp: string;
      newCurrentBid: number;
      newBidCount: number;
      nextMinBid: number;
    };
    timestamp: number;
  }) => {
    setAuctionData(prev => {
      if (!prev) return null
      return {
        ...prev,
        current_bid: data.bid.newCurrentBid,
        bid_count: data.bid.newBidCount,
      }
    })
    toast({
      title: "Nowa oferta!",
      description: `Użytkownik ${data.bid.userName} zalicytował ${formatCurrency(data.bid.amount)}`,
    })
  }, [toast])

  const handleAuctionExtended = useCallback((data: {
    newEndTime: string;
    extensionCount: number;
  }) => {
    setAuctionData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        auction_end_time: data.newEndTime,
      };
    });
    setIsExtended(true);
    setExtensionCount(data.extensionCount);
    toast({
      title: "Aukcja przedłużona!",
      description: `Czas zakończenia został przedłużony o 3 minuty.`,
      variant: "info",
    });
  }, [toast]);

  useEffect(() => {
    const supabase = createClientComponentClient()

    const initializeWebSocket = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (!session) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(profileData as Tables<'profiles'> | null);

      const client = getWebSocketClient({ token: session.access_token })
      setWsClient(client)

      client.on('auction_joined', (data) => {
        setParticipantCount(data.participantCount)
      })

      client.on('participant_joined', (data) => {
        setParticipantCount(data.participantCount)
      })

      client.on('participant_left', (data) => {
        setParticipantCount(data.participantCount)
      })

      client.on('bid_placed', handleNewBid)
      client.on('auction_extended', handleAuctionExtended)

      if (params.id) {
        client.joinAuction(params.id as string)
      }
    }

    const fetchAuctionDetails = async () => {
      if (!params.id) return
      
      try {
        setLoading(true);
        const response = await fetch(`/api/auctions/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch auction data');
        }
        const data = await response.json();
        setAuctionData(data.data as Auction);
      } catch (err: any) {
        console.error('Error fetching auction details:', err);
        setError(err.message || 'Nie udało się pobrać szczegółów aukcji')
      } finally {
        setLoading(false)
      }
    }

    const fetchMarketData = async () => {
      if (!params.id) return;
      try {
        const response = await fetch(`/api/auctions/${params.id}/market-data`);
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        const data = await response.json();
        setMarketData(data);
      } catch (err: any) {
        // Non-critical error, so we just log it
        console.error('Error fetching market data:', err);
      }
    }
    
    fetchAuctionDetails()
    fetchMarketData()
    initializeWebSocket()

    return () => {
      if (wsClient && params.id) {
        wsClient.leaveAuction(params.id as string)
        wsClient.off('bid_placed', handleNewBid)
        wsClient.off('auction_extended', handleAuctionExtended)
      }
    }
  }, [params.id, handleNewBid, handleAuctionExtended])

  useEffect(() => {
    const incrementViewCount = async () => {
      if (params.id) {
        const supabase = createClientComponentClient()
        await supabase.rpc('increment_view_count', { auction_id_param: params.id })
      }
    }
    incrementViewCount()
  }, [params.id])

  useEffect(() => {
    const checkWatchStatus = async () => {
      if (!session || !params.id) return;
      const response = await fetch(`/api/auctions/${params.id}/watch`);
      if (response.ok) {
        const { isWatching } = await response.json();
        setIsWatching(isWatching);
      }
    };
    checkWatchStatus();
  }, [session, params.id]);

  const toggleWatch = async () => {
    if (!session) {
      toast({
        title: 'Not logged in',
        description: 'You must be logged in to watch an auction.',
        variant: 'destructive',
      });
      return;
    }

    const response = await fetch(`/api/auctions/${params.id}/watch`, {
      method: 'POST',
    });

    if (response.ok) {
      const { isWatching: newIsWatching, watchCount } = await response.json();
      setIsWatching(newIsWatching);
      setAuctionData(prev => prev ? { ...prev, watch_count: watchCount } : null);
      toast({
        title: newIsWatching ? 'Auction watched' : 'Auction unwatched',
        description: newIsWatching
          ? 'You are now watching this auction.'
          : 'You are no longer watching this auction.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update watch status.',
        variant: 'destructive',
      });
    }
  };

  const handlePlaceBid = async (amount: number) => {
    if (!session || !params.id) {
      toast({
        title: "Błąd",
        description: "Musisz być zalogowany, aby licytować.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/bids/auction/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Nie udało się złożyć oferty.');
      }

      toast({
        title: "Sukces!",
        description: `Twoja oferta w wysokości ${formatCurrency(amount)} została złożona.`,
      });
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
                  <span className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    {participantCount} oglądających
                  </span>
                </div>
                {auctionData.is_verified && (
                   <div className="mt-4 flex items-center gap-4">
                     <Badge className="bg-green-100 text-green-800 border-green-300 text-base px-4 py-2">
                       <ShieldCheck className="w-5 h-5 mr-2" />
                       Pojazd Zweryfikowany
                     </Badge>
                     <a
                       href={auctionData.verification_report_url || '#'}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-sm font-medium text-blue-600 hover:underline"
                     >
                       Zobacz raport z weryfikacji
                     </a>
                   </div>
                 )}
              </div>

              {/* Image Gallery */}
              <Tabs defaultValue="gallery">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="gallery">Galeria</TabsTrigger>
                  <TabsTrigger value="360" disabled={!auctionData.images360 || auctionData.images360.length === 0}>
                    Widok 360°
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="gallery">
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
                </TabsContent>
                <TabsContent value="360">
                  <Card>
                    <CardContent>
                      {auctionData.images360 && auctionData.images360.length > 0 ? (
                        <Vehicle360View images={auctionData.images360} />
                      ) : (
                        <div className="text-center py-12">
                          <p>Brak zdjęć 360° dla tej aukcji.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

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
                  <CardTitle className="flex items-center">
                    Opis pojazdu
                    {auctionData.edit_history && auctionData.edit_history.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        <History className="w-3 h-3 mr-1" />
                        Edytowano
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                      {auctionData.description}
                    </p>
                  </div>

                  {auctionData.edit_history && auctionData.edit_history.length > 0 && (
                    <Accordion type="single" collapsible className="w-full mt-4">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Pokaż historię zmian</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {auctionData.edit_history.map((edit: AuctionEdit) => (
                              <div key={edit.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                  Zmiana z dnia: {new Date(edit.edited_at).toLocaleString()}
                                </p>
                                <div>
                                  <h4 className="font-semibold text-xs text-gray-400">Poprzednia wersja:</h4>
                                  <pre className="whitespace-pre-wrap font-mono text-sm p-2 bg-red-900/10 rounded-md">
                                    {edit.old_value}
                                  </pre>
                                </div>
                                <div className="mt-2">
                                  <h4 className="font-semibold text-xs text-gray-400">Nowa wersja:</h4>
                                  <pre className="whitespace-pre-wrap font-mono text-sm p-2 bg-green-900/10 rounded-md">
                                    {edit.new_value}
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </CardContent>
              </Card>

              {/* Questions and Answers */}
              {auctionData.questions && (
                <AuctionQuestions
                  auctionId={auctionData.id}
                  questions={auctionData.questions}
                  session={session}
                  isOwner={auctionData.is_owner}
                />
              )}
            </div>

            {/* Right Column - Bidding */}
            <div className="space-y-6">
              {auctionData && (
                <LiveAuctionInterface
                  auctionData={auctionData}
                  isExtended={isExtended}
                  extensionCount={extensionCount}
                  profile={profile}
                  onBid={handlePlaceBid}
                />
              )}
               {marketData && auctionData && (
                 <div className="mt-6">
                   <MarketDataContext marketData={marketData} currentBid={auctionData.current_bid} />
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
