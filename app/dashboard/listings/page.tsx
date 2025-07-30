"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MoreHorizontal,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  Search,
  Filter,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface Listing {
  id: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  currency: string
  status: 'active' | 'expired' | 'sold' | 'draft' | 'suspended'
  views: number
  contact_count: number
  images: string[]
  created_at: string
  expires_at: string
  is_featured: boolean
  package_id: string
  category_id: string
}

export default function ListingsManagementPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    sold: 0,
    draft: 0
  })
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchListings()
  }, [statusFilter, sortBy])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Pobierz statystyki
      const { data: allListings } = await supabase
        .from('listings')
        .select('status')
        .eq('user_id', user.id)

      const statsCounts = {
        total: allListings?.length || 0,
        active: allListings?.filter(l => l.status === 'active').length || 0,
        expired: allListings?.filter(l => l.status === 'expired').length || 0,
        sold: allListings?.filter(l => l.status === 'sold').length || 0,
        draft: allListings?.filter(l => l.status === 'draft').length || 0
      }
      setStats(statsCounts)

      // Pobierz ogłoszenia z filtrowaniem
      let query = supabase
        .from('listings')
        .select(`
          *,
          categories(name),
          packages(name, features)
        `)
        .eq('user_id', user.id)

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      query = query.order(sortBy, { ascending: false })

      const { data, error } = await query

      if (error) throw error

      setListings(data || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
      toast.error('Błąd podczas ładowania ogłoszeń')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Ogłoszenie zostało usunięte')
      fetchListings()
    } catch (error) {
      console.error('Error deleting listing:', error)
      toast.error('Błąd podczas usuwania ogłoszenia')
    }
  }

  const handleExtend = async (id: string) => {
    try {
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

      toast.success('Ogłoszenie zostało przedłużone')
      fetchListings()
    } catch (error) {
      console.error('Error extending listing:', error)
      toast.error('Błąd podczas przedłużania ogłoszenia')
    }
  }

  const handleFeature = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          is_featured: featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success(featured ? 'Ogłoszenie zostało wyróżnione' : 'Wyróżnienie zostało usunięte')
      fetchListings()
    } catch (error) {
      console.error('Error featuring listing:', error)
      toast.error('Błąd podczas zmiany wyróżnienia')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktywne', variant: 'default' as const, icon: CheckCircle2 },
      expired: { label: 'Wygasłe', variant: 'secondary' as const, icon: Clock },
      sold: { label: 'Sprzedane', variant: 'default' as const, icon: CheckCircle2 },
      draft: { label: 'Szkic', variant: 'outline' as const, icon: Edit3 },
      suspended: { label: 'Zawieszone', variant: 'destructive' as const, icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moje ogłoszenia</h1>
          <p className="text-gray-600">Zarządzaj wszystkimi swoimi ogłoszeniami</p>
        </div>
        <Link href="/ogloszenia/dodaj">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj ogłoszenie
          </Button>
        </Link>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Wszystkie</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Aktywne</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
            <div className="text-sm text-gray-600">Wygasłe</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
            <div className="text-sm text-gray-600">Sprzedane</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            <div className="text-sm text-gray-600">Szkice</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtry i wyszukiwanie */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Szukaj ogłoszeń..."
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
                <SelectItem value="expired">Wygasłe</SelectItem>
                <SelectItem value="sold">Sprzedane</SelectItem>
                <SelectItem value="draft">Szkice</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sortuj" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Data dodania</SelectItem>
                <SelectItem value="views">Wyświetlenia</SelectItem>
                <SelectItem value="price">Cena</SelectItem>
                <SelectItem value="title">Tytuł</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista ogłoszeń */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Brak wyników wyszukiwania' : 'Brak ogłoszeń'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Spróbuj zmienić kryteria wyszukiwania'
                : 'Nie masz jeszcze żadnych ogłoszeń. Dodaj swoje pierwsze ogłoszenie!'
              }
            </p>
            {!searchTerm && (
              <Link href="/ogloszenia/dodaj">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj pierwsze ogłoszenie
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Zdjęcie */}
              <div className="relative h-48">
                <Image
                  src={listing.images?.[0] || '/placeholder.jpg'}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
                {listing.is_featured && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500">
                    <Star className="w-3 h-3 mr-1" />
                    Wyróżnione
                  </Badge>
                )}
                {getStatusBadge(listing.status)}
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg truncate">{listing.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/ogloszenia/${listing.id}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Podgląd
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/listings/${listing.id}/edit`)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edytuj
                      </DropdownMenuItem>
                      {listing.status === 'expired' && (
                        <DropdownMenuItem onClick={() => handleExtend(listing.id)}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Przedłuż
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleFeature(listing.id, !listing.is_featured)}>
                        <Star className="w-4 h-4 mr-2" />
                        {listing.is_featured ? 'Usuń wyróżnienie' : 'Wyróżnij'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(listing.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Usuń
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-gray-600 text-sm mb-2">
                  {listing.brand} {listing.model} {listing.year}
                </p>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold text-blue-600">
                    {listing.price.toLocaleString()} {listing.currency}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {listing.views || 0} wyświetleń
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {listing.contact_count || 0} kontaktów
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Dodano: {formatDistanceToNow(new Date(listing.created_at), { 
                    addSuffix: true, 
                    locale: pl 
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
