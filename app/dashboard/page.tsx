"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Car, 
  Gavel, 
  Eye, 
  Heart, 
  TrendingUp, 
  Package, 
  CreditCard,
  Bell,
  Plus,
  BarChart3
} from "lucide-react"
import { toast } from "sonner"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    activeListings: 0,
    totalViews: 0,
    activeBids: 0,
    favorites: 0,
    packageLimit: 10,
    packageUsed: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock user data - in real app would come from Supabase
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        user_metadata: {
          package_name: 'Private Seller',
          package_price: 0
        }
      }
      
      setUser(mockUser)

      // Mock stats data
      setStats({
        activeListings: 3,
        totalViews: 1247,
        activeBids: 2,
        favorites: 8,
        packageLimit: 10,
        packageUsed: 3
      })

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'listing_created',
          title: 'Nowe ogłoszenie zostało utworzone',
          description: 'BMW X5 2020',
          time: '2 godziny temu'
        },
        {
          id: 2,
          type: 'bid_placed',
          title: 'Nowa oferta w aukcji',
          description: 'Mercedes C-Class - 25,000 CHF',
          time: '4 godziny temu'
        },
        {
          id: 3,
          type: 'listing_viewed',
          title: 'Twoje ogłoszenie zostało wyświetlone',
          description: 'Audi A4 2019 - 15 wyświetleń',
          time: '6 godzin temu'
        }
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Błąd podczas ładowania danych')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Ładowanie dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Zarządzaj swoimi ogłoszeniami i aukcjami
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Przegląd</TabsTrigger>
              <TabsTrigger value="listings">Ogłoszenia</TabsTrigger>
              <TabsTrigger value="bids">Licytacje</TabsTrigger>
              <TabsTrigger value="billing">Rozliczenia</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Aktywne ogłoszenia
                    </CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeListings}</div>
                    <p className="text-xs text-muted-foreground">
                      z {stats.packageLimit} dostępnych
                    </p>
                    <Progress 
                      value={(stats.packageUsed / stats.packageLimit) * 100} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Łączne wyświetlenia
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalViews}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% od zeszłego miesiąca
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Aktywne licytacje
                    </CardTitle>
                    <Gavel className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeBids}</div>
                    <p className="text-xs text-muted-foreground">
                      Prowadzisz w {stats.activeBids} aukcjach
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ulubione
                    </CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.favorites}</div>
                    <p className="text-xs text-muted-foreground">
                      Obserwowanych ogłoszeń
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Szybkie akcje</CardTitle>
                    <CardDescription>
                      Najczęściej używane funkcje
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/ogloszenia/dodaj')}
                    >
                      <Plus className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Dodaj ogłoszenie</div>
                        <div className="text-sm text-muted-foreground">
                          Utwórz nowe ogłoszenie lub aukcję
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/cennik')}
                    >
                      <Package className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Zmień pakiet</div>
                        <div className="text-sm text-muted-foreground">
                          Uaktualnij swój plan subskrypcji
                        </div>
                      </div>
                    </Button>

                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => router.push('/dashboard?tab=analytics')}
                    >
                      <BarChart3 className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Zobacz analitykę</div>
                        <div className="text-sm text-muted-foreground">
                          Sprawdź statystyki swoich ogłoszeń
                        </div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ostatnia aktywność</CardTitle>
                    <CardDescription>
                      Co działo się w Twoim koncie
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity: any) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Bell className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="listings">
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Zarządzanie ogłoszeniami</h3>
                <p className="text-muted-foreground mb-6">
                  Tutaj będzie lista Twoich ogłoszeń z opcjami edycji
                </p>
                <Button onClick={() => router.push('/ogloszenia/dodaj')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj nowe ogłoszenie
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="bids">
              <div className="text-center py-12">
                <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Twoje licytacje</h3>
                <p className="text-muted-foreground mb-6">
                  Przeglądaj swoje aktywne oferty i wygrane aukcje
                </p>
                <Button onClick={() => router.push('/aukcje')}>
                  <Gavel className="mr-2 h-4 w-4" />
                  Przeglądaj aukcje
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="billing">
              <div className="space-y-6">
                {/* Current Package */}
                <Card>
                  <CardHeader>
                    <CardTitle>Aktualny pakiet</CardTitle>
                    <CardDescription>
                      Zarządzaj swoim planem subskrypcji
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {user?.user_metadata?.package_name || 'Private Seller'}
                        </h3>
                        <p className="text-muted-foreground">
                          {stats.packageUsed} z {stats.packageLimit} ogłoszeń wykorzystanych
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {user?.user_metadata?.package_price || 0} CHF
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user?.user_metadata?.package_price > 0 ? '/miesiąc' : 'za darmo'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button onClick={() => router.push('/cennik')}>
                        <Package className="mr-2 h-4 w-4" />
                        Zmień pakiet
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historia płatności</CardTitle>
                    <CardDescription>
                      Twoje ostatnie transakcje
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-4" />
                      <p>Brak historii płatności</p>
                      <p className="text-sm">
                        Płatności będą wyświetlane tutaj po dokonaniu pierwszej transakcji
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  )
}
