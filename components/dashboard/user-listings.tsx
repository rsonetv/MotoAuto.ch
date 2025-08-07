"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  Calendar,
  Eye,
  MessageSquare
} from "lucide-react"
import { createClientComponentClient } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"
import { DecisionInterface } from "./decision-interface"
 
 type Listing = Database['public']['Tables']['listings']['Row']
 
 export function UserListings() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    sold: 0,
    draft: 0,
    decision: 0
  })
  
  useEffect(() => {
    fetchListings()
  }, [activeTab])
  
  const fetchListings = async () => {
    try {
      setLoading(true)
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // Get total count for stats
      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      // Get counts by status
      const statusCounts = await Promise.all([
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'expired'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'sold'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'draft'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'ENDED_RESERVE_NOT_MET')
      ])
      
      setStats({
        total: count || 0,
        active: statusCounts[0].count || 0,
        expired: statusCounts[1].count || 0,
        sold: statusCounts[2].count || 0,
        draft: statusCounts[3].count || 0,
        decision: statusCounts[4].count || 0
      })
      
      // Filter by status if needed
      let query = supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setListings(data || [])
    } catch (err: any) {
      console.error('Error fetching listings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return
    
    try {
      setLoading(true)
      const supabase = createClientComponentClient()
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Refresh listings
      fetchListings()
    } catch (err: any) {
      console.error('Error deleting listing:', err)
      alert('Nie udało się usunąć ogłoszenia. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleExtend = async (id: string) => {
    try {
      setLoading(true)
      const supabase = createClientComponentClient()
      // Update expires_at to 30 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)
      
      const { error } = await supabase
        .from('listings')
        .update({ 
          status: 'active',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Refresh listings
      fetchListings()
    } catch (err: any) {
      console.error('Error extending listing:', err)
      alert('Nie udało się przedłużyć ogłoszenia. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAction = async (action: string, listingId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auctions/${listingId}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action}`);
      }

      // Refresh listings
      fetchListings();
    } catch (err: any) {
      console.error(`Error performing action ${action}:`, err);
      alert(`Nie udało się wykonać akcji. Spróbuj ponownie.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-50"><CheckCircle2 className="h-3 w-3" /> Aktywne</Badge>
      case 'expired':
        return <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 hover:bg-amber-50"><Clock className="h-3 w-3" /> Wygasłe</Badge>
      case 'sold':
        return <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-50"><CheckCircle2 className="h-3 w-3" /> Sprzedane</Badge>
      case 'draft':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Szkic</Badge>
      case 'suspended':
        return <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-50"><XCircle className="h-3 w-3" /> Zawieszone</Badge>
      case 'ENDED_RESERVE_NOT_MET':
        return <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-50"><Clock className="h-3 w-3" /> Wymaga decyzji</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Moje ogłoszenia</h2>
          <Button onClick={() => router.push('/ogloszenia/dodaj')}>Dodaj ogłoszenie</Button>
        </div>
        <div className="p-4 border rounded-lg bg-red-50 text-red-700">
          <p>Wystąpił błąd podczas ładowania ogłoszeń. Spróbuj odświeżyć stronę.</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Moje ogłoszenia</h2>
        <Button onClick={() => router.push('/ogloszenia/dodaj')}>Dodaj ogłoszenie</Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setActiveTab('all')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-muted-foreground text-sm">Wszystkie</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 hover:bg-green-100 transition-colors cursor-pointer" onClick={() => setActiveTab('active')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">{stats.active}</div>
            <div className="text-green-700/70 text-sm">Aktywne</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer" onClick={() => setActiveTab('ENDED_RESERVE_NOT_MET')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-700">{stats.decision}</div>
            <div className="text-yellow-700/70 text-sm">Wymaga decyzji</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer" onClick={() => setActiveTab('expired')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-700">{stats.expired}</div>
            <div className="text-amber-700/70 text-sm">Wygasłe</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => setActiveTab('sold')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-700">{stats.sold}</div>
            <div className="text-blue-700/70 text-sm">Sprzedane</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setActiveTab('draft')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.draft}</div>
            <div className="text-muted-foreground text-sm">Szkice</div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">
          {activeTab === 'all' ? 'Wszystkie ogłoszenia' :
           activeTab === 'active' ? 'Aktywne ogłoszenia' :
           activeTab === 'expired' ? 'Wygasłe ogłoszenia' :
           activeTab === 'sold' ? 'Sprzedane ogłoszenia' :
           activeTab === 'ENDED_RESERVE_NOT_MET' ? 'Aukcje wymagające decyzji' : 'Szkice ogłoszeń'}
        </h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-20 w-32 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="border rounded-lg p-8 text-center">
            <h4 className="text-lg font-medium mb-2">Brak ogłoszeń</h4>
            <p className="text-muted-foreground mb-4">
              {activeTab === 'all' ? 'Nie masz jeszcze żadnych ogłoszeń. Dodaj swoje pierwsze ogłoszenie!' : 
               `Nie masz jeszcze ${
                 activeTab === 'active' ? 'aktywnych' :
                 activeTab === 'expired' ? 'wygasłych' :
                 activeTab === 'sold' ? 'sprzedanych' : 'szkiców'
               } ogłoszeń.`}
            </p>
            <Button onClick={() => router.push('/ogloszenia/dodaj')}>Dodaj ogłoszenie</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map(listing => (
              <div key={listing.id}>
                {listing.status === 'ENDED_RESERVE_NOT_MET' ? (
                  <DecisionInterface listing={listing} onAction={handleAction} />
                ) : (
                  <Card className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3 relative">
                        <div className="aspect-video md:aspect-square relative overflow-hidden">
                          <Image
                            src={listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder.jpg'}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-9 p-4 pt-0 md:pt-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium line-clamp-1">{listing.title}</h3>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(listing.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push(`/ogloszenia/${listing.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" /> Podgląd
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/ogloszenia/edytuj/${listing.id}`)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edytuj
                                </DropdownMenuItem>
                                {listing.status === 'expired' && (
                                  <DropdownMenuItem onClick={() => handleExtend(listing.id)}>
                                    <Calendar className="mr-2 h-4 w-4" /> Przedłuż
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleDelete(listing.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" /> Usuń
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4" />
                            {listing.brand} {listing.model}
                          </div>
                          {listing.year && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {listing.year}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {listing.views || 0} wyświetleń
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {listing.contact_count || 0} kontaktów
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold">
                            {listing.price.toLocaleString()} {listing.currency}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Dodano: {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true, locale: pl })}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={() => router.push(`/ogloszenia/${listing.id}`)}>
                            Podgląd
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => router.push(`/ogloszenia/edytuj/${listing.id}`)}>
                            Edytuj
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}