"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Gavel,
  Clock,
  TrendingUp,
  Eye,
  Search,
  Filter,
  Trophy,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'

interface Bid {
  id: string
  amount: number
  max_bid: number
  is_auto_bid: boolean
  status: 'active' | 'outbid' | 'winning' | 'won' | 'lost'
  created_at: string
  listing: {
    id: string
    title: string
    brand: string
    model: string
    year: number
    images: string[]
    current_bid: number
    currency: string
    auction_end_time: string 
    status: string
  }
}

interface AuctionListing {
  id: string
  title: string
  brand: string
  model: string
  year: number
  images: string[]
  starting_price: number
  current_bid: number
  reserve_price: number
  currency: string
  auction_end_time: string
  bid_count: number
  status: string
  is_reserve_met: boolean
  user_max_bid: number
  user_is_winning: boolean
}

export default function BidsManagementPage() {
  const [myBids, setMyBids] = useState<Bid[]>([])
  const [watchedAuctions, setWatchedAuctions] = useState<AuctionListing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-bids')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState({
    activeBids: 0,
    winningBids: 0,
    wonAuctions: 0,
    totalSpent: 0
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchBidsData()
  }, [activeTab])

  const fetchBidsData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Pobierz moje licytacje
      const { data: bidsData } = await supabase
        .from('bids')
        .select(`
          *,
          listings (
            id,
            title,
            brand,
            model,
            year,
            images,
            current_bid,
            currency,
            auction_end_time,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setMyBids(bidsData || [])

      // Oblicz statystyki
      const activeBids = bidsData?.filter(b => b.status === 'active').length || 0
      const winningBids = bidsData?.filter(b => b.status === 'winning').length || 0
      const wonAuctions = bidsData?.filter(b => b.status === 'won').length || 0
      const totalSpent = bidsData?.filter(b => b.status === 'won')
        .reduce((sum, b) => sum + b.amount, 0) || 0

      setStats({ activeBids, winningBids, wonAuctions, totalSpent })

      // Pobierz obserwowane aukcje (jeśli activeTab === 'watched')
      if (activeTab === 'watched') {
        const { data: watchlistData } = await supabase
          .from('watchlist')
          .select(`
            listings (
              id,
              title,
              brand,
              model,
              year,
              images,
              starting_price,
              current_bid,
              reserve_price,
              currency,
              auction_end_time,
              bid_count,
              status,
              is_reserve_met
            )
          `)
          .eq('user_id', user.id)
          .eq('listings.sale_type', 'auction')

        setWatchedAuctions(watchlistData?.map(w => w.listings).filter(Boolean) || [])
      }
    } catch (error) {
      console.error('Error fetching bids data:', error)
      toast.error('Błąd podczas ładowania danych licytacji')
    } finally {
      setLoading(false)
    }
  }

  const placeBid = async (listingId: string, amount: number, maxBid?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('bids')
        .insert({
          listing_id: listingId,
          user_id: user.id,
          amount,
          max_bid: maxBid || amount,
          is_auto_bid: !!maxBid
        })

      if (error) throw error

      toast.success('Licytacja została złożona!')
      fetchBidsData()
    } catch (error) {
      console.error('Error placing bid:', error)
      toast.error('Błąd podczas składania licytacji')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktywna', variant: 'default' as const, icon: Clock },
      outbid: { label: 'Przebita', variant: 'secondary' as const, icon: TrendingUp },
      winning: { label: 'Wygrywam', variant: 'default' as const, icon: Trophy },
      won: { label: 'Wygrałem', variant: 'default' as const, icon: CheckCircle2 },
      lost: { label: 'Przegrana', variant: 'destructive' as const, icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const getTimeRemaining = (endTime: string) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return 'Zakończona'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }

    return `${hours}h ${minutes}m`
  }

  const filteredBids = myBids.filter(bid =>
    bid.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.listing.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.listing.model.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(bid => statusFilter === 'all' || bid.status === statusFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moje licytacje</h1>
          <p className="text-gray-600">Zarządzaj swoimi licytacjami i obserwuj aukcje</p>
        </div>
        <Link href="/aukcje">
          <Button>
            <Gavel className="w-4 h-4 mr-2" />
            Przeglądaj aukcje
          </Button>
        </Link>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.activeBids}</div>
            <div className="text-sm text-gray-600">Aktywne licytacje</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.winningBids}</div>
            <div className="text-sm text-gray-600">Wygrywam</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.wonAuctions}</div>
            <div className="text-sm text-gray-600">Wygrane</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalSpent.toLocaleString()} CHF
            </div>
            <div className="text-sm text-gray-600">Wydane łącznie</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-bids">Moje licytacje</TabsTrigger>
          <TabsTrigger value="watched">Obserwowane</TabsTrigger>
        </TabsList>

        <TabsContent value="my-bids" className="space-y-4">
          {/* Filtry */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Szukaj licytacji..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    <SelectItem value="active">Aktywne</SelectItem>
                    <SelectItem value="winning">Wygrywam</SelectItem>
                    <SelectItem value="outbid">Przebite</SelectItem>
                    <SelectItem value="won">Wygrane</SelectItem>
                    <SelectItem value="lost">Przegrane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista licytacji */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBids.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Brak licytacji
                </h3>
                <p className="text-gray-600 mb-4">
                  Nie masz jeszcze żadnych licytacji. Przeglądaj aukcje i złóż swoją pierwszą ofertę!
                </p>
                <Link href="/aukcje">
                  <Button>
                    <Gavel className="w-4 h-4 mr-2" />
                    Przeglądaj aukcje
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBids.map((bid) => (
                <Card key={bid.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Zdjęcie pojazdu */}
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={bid.listing.images?.[0] || '/placeholder.jpg'}
                          alt={bid.listing.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>

                      {/* Informacje o aukcji */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 truncate">
                              {bid.listing.title}
                            </h3>
                            <p className="text-gray-600">
                              {bid.listing.brand} {bid.listing.model} {bid.listing.year}
                            </p>
                          </div>
                          {getStatusBadge(bid.status)}
                        </div>

                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Moja oferta:</span>
                            <div className="font-semibold">
                              {bid.amount.toLocaleString()} {bid.listing.currency}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Obecna cena:</span>
                            <div className="font-semibold">
                              {bid.listing.current_bid.toLocaleString()} {bid.listing.currency}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Czas pozostały:</span>
                            <div className="font-semibold flex items-center">
                              <Timer className="w-4 h-4 mr-1" />
                              {getTimeRemaining(bid.listing.auction_end_time)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Auto-licytacja:</span>
                            <div className="font-semibold">
                              {bid.is_auto_bid ? `Max: ${bid.max_bid.toLocaleString()}` : 'Nie'}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar dla auto-bid */}
                        {bid.is_auto_bid && (
                          <div className="mt-3">
                            <Progress 
                              value={(bid.listing.current_bid / bid.max_bid) * 100}
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Obecna: {bid.listing.current_bid.toLocaleString()}</span>
                              <span>Max: {bid.max_bid.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Akcje */}
                      <div className="flex flex-col space-y-2">
                        <Link href={`/aukcje/${bid.listing.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Zobacz
                          </Button>
                        </Link>
                        {bid.status === 'outbid' && new Date(bid.listing.auction_end_time) > new Date() && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              // Tu powinna być logika ponownej licytacji
                              toast.info('Funkcja w przygotowaniu')
                            }}
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Przelicituj
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="watched" className="space-y-4">
          {/* Lista obserwowanych aukcji */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : watchedAuctions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Brak obserwowanych aukcji
                </h3>
                <p className="text-gray-600 mb-4">
                  Nie obserwujesz jeszcze żadnych aukcji. Dodaj aukcje do obserwowanych, aby śledzić ich przebieg.
                </p>
                <Link href="/aukcje">
                  <Button>
                    <Eye className="w-4 h-4 mr-2" />
                    Przeglądaj aukcje
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {watchedAuctions.map((auction) => (
                <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={auction.images?.[0] || '/placeholder.jpg'}
                      alt={auction.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={auction.status === 'active' ? 'default' : 'secondary'}>
                        {getTimeRemaining(auction.auction_end_time)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{auction.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {auction.brand} {auction.model} {auction.year}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Obecna cena:</span>
                        <span className="font-semibold">
                          {auction.current_bid.toLocaleString()} {auction.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Liczba ofert:</span>
                        <span className="font-medium">{auction.bid_count}</span>
                      </div>
                      {auction.reserve_price > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Cena minimalna:</span>
                          <Badge variant={auction.is_reserve_met ? 'default' : 'secondary'}>
                            {auction.is_reserve_met ? 'Osiągnięta' : 'Nie osiągnięta'}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Link href={`/aukcje/${auction.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Zobacz
                        </Button>
                      </Link>
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          // Tu powinna być logika licytacji
                          toast.info('Przekierowanie do licytacji')
                        }}
                      >
                        <Gavel className="w-4 h-4 mr-2" />
                        Licytuj
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
