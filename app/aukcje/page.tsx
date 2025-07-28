"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AuctionList } from "@/components/aukcje/auction-list"
import { AuctionFilters } from "@/components/aukcje/auction-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Gavel,
  TrendingUp,
  Clock,
  Users,
  Trophy,
  Zap,
  Info,
  Star
} from "lucide-react"

export default function AukcjePage() {
  const [stats, setStats] = useState({
    activeAuctions: 156,
    endingToday: 23,
    totalBids: 2847,
    avgIncrease: 15.7
  })

  const [featuredAuctions, setFeaturedAuctions] = useState([
    {
      id: '1',
      title: 'Porsche 911 Turbo S 2021',
      currentBid: 145000,
      timeLeft: '2h 45m',
      image: 'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=400&h=300&fit=crop',
      bidCount: 23,
      isHot: true
    },
    {
      id: '2', 
      title: 'Ferrari 488 GTB 2019',
      currentBid: 189000,
      timeLeft: '5h 12m',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop',
      bidCount: 31,
      isHot: true
    },
    {
      id: '3',
      title: 'Lamborghini Huracán 2020',
      currentBid: 167000,
      timeLeft: '1d 3h',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      bidCount: 18,
      isHot: false
    }
  ])

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Aukcje Samochodowe
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Odkryj wyjątkowe pojazdy w ekscytujących aukcjach online. 
                Licytuj i wygraj pojazd swoich marzeń!
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-2">
                    <Gavel className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold">{stats.activeAuctions}</div>
                  <p className="text-sm text-muted-foreground">Aktywnych aukcji</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold">{stats.endingToday}</div>
                  <p className="text-sm text-muted-foreground">Kończy się dziś</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">{stats.totalBids.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Złożonych ofert</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold">+{stats.avgIncrease}%</div>
                  <p className="text-sm text-muted-foreground">Średni wzrost cen</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Featured Auctions */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Gorące aukcje</h2>
                <p className="text-muted-foreground">
                  Najbardziej ekscytujące aukcje kończące się wkrótce
                </p>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Zap className="w-4 h-4 mr-1" />
                Na żywo
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredAuctions.map((auction) => (
                <Card key={auction.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {auction.isHot && (
                      <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                        <Zap className="w-3 h-3 mr-1" />
                        HOT
                      </Badge>
                    )}
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {auction.timeLeft}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {auction.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-orange-600">
                          {auction.currentBid.toLocaleString()} CHF
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {auction.bidCount} ofert
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Licytuj
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Wskazówka:</strong> Aukcje z oznaczeniem "HOT" 🔥 są szczególnie popularne 
                i mogą zakończyć się wyższą ceną niż oczekiwana.
              </AlertDescription>
            </Alert>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Wszystkie</TabsTrigger>
              <TabsTrigger value="ending-soon">Kończące się</TabsTrigger>
              <TabsTrigger value="new">Nowe</TabsTrigger>
              <TabsTrigger value="no-reserve">Bez min. ceny</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <AuctionFilters />
                </div>
                <div className="lg:col-span-3">
                  <AuctionList />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ending-soon">
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aukcje kończące się wkrótce</h3>
                <p className="text-muted-foreground mb-6">
                  Nie przegap ostatniej szansy na wylicytowanie wymarzonego pojazdu
                </p>
                <Button>Zobacz wszystkie</Button>
              </div>
            </TabsContent>

            <TabsContent value="new">
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Najnowsze aukcje</h3>
                <p className="text-muted-foreground mb-6">
                  Świeżo dodane pojazdy czekają na Twoje oferty
                </p>
                <Button>Przeglądaj nowe</Button>
              </div>
            </TabsContent>

            <TabsContent value="no-reserve">
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Bez ceny minimalnej</h3>
                <p className="text-muted-foreground mb-6">
                  Pojazdy sprzedawane bez ceny minimalnej - najwyższa oferta wygrywa
                </p>
                <Button>Znajdź okazje</Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Benefits Section */}
          <div className="mt-16">
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Dlaczego aukcje MotoAuto.ch?</CardTitle>
                <CardDescription>
                  Najlepsze doświadczenie aukcyjne w Szwajcarii
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-orange-100 dark:bg-orange-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gavel className="h-8 w-8 text-orange-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Sprawiedliwe licytacje</h4>
                    <p className="text-sm text-muted-foreground">
                      Przejrzyste zasady, automatyczne przedłużenia i weryfikowani użytkownicy
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Duża społeczność</h4>
                    <p className="text-sm text-muted-foreground">
                      Tysiące aktywnych licytujących gwarantuje konkurencyjne ceny
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Wyjątkowe pojazdy</h4>
                    <p className="text-sm text-muted-foreground">
                      Klasyki, sportowe auta i unikatowe egzemplarze w jednym miejscu
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
