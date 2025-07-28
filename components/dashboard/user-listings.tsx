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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Eye, 
  MessageCircle, 
  MoreVertical, 
  Pencil, 
  Trash, 
  AlertTriangle,
  ArrowUpRight,
  Star,
  RefreshCw,
  Ban,
  Clock,
  CheckCircle2,
  ImageOff
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Listing {
  id: string
  title: string
  price: number
  status: 'active' | 'pending' | 'expired' | 'draft' | 'rejected'
  created_at: string
  expires_at: string
  images: string[]
  is_promoted: boolean
  views_count: number
  messages_count: number
  category_id: string
  categories?: { name: string }
}

export function UserListings() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [counts, setCounts] = useState({
    active: 0,
    pending: 0,
    expired: 0,
    draft: 0
  })

  useEffect(() => {
    loadListings()
  }, [activeTab])

  const loadListings = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all counts first
      const getCount = async (status: string) => {
        const { count } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', status)
        return count || 0
      }

      const activeCnt = await getCount('active')
      const pendingCnt = await getCount('pending')
      const expiredCnt = await getCount('expired')
      const draftCnt = await getCount('draft')

      setCounts({
        active: activeCnt,
        pending: pendingCnt,
        expired: expiredCnt,
        draft: draftCnt
      })

      // Get listings for current tab
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('status', activeTab)
        .order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (error) {
      console.error('Error loading listings:', error)
      toast.error('Błąd podczas ładowania ogłoszeń')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  const handleDelete = async () => {
    if (!selectedListingId) return

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', selectedListingId)

      if (error) throw error

      setListings(listings.filter(listing => listing.id !== selectedListingId))
      toast.success('Ogłoszenie zostało usunięte')
    } catch (error) {
      console.error('Error deleting listing:', error)
      toast.error('Błąd podczas usuwania ogłoszenia')
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedListingId(null)
    }
  }

  const handlePromote = async (id: string) => {
    router.push(`/ogloszenia/promuj?id=${id}`)
  }

  const handleRenew = async (id: string) => {
    try {
      // Set new expiration date to 30 days from now
      const newExpiresAt = new Date()
      newExpiresAt.setDate(newExpiresAt.getDate() + 30)

      const { error } = await supabase
        .from('listings')
        .update({ 
          status: 'active',
          expires_at: newExpiresAt.toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      toast.success('Ogłoszenie zostało odnowione')
      loadListings()
    } catch (error) {
      console.error('Error renewing listing:', error)
      toast.error('Błąd podczas odnawiania ogłoszenia')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Aktywne</Badge>
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Oczekujące</Badge>
      case 'expired':
        return <Badge variant="destructive" className="flex items-center gap-1"><Ban className="h-3 w-3" /> Wygasło</Badge>
      case 'draft':
        return <Badge variant="secondary" className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Szkic</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Odrzucone</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3 aspect-[4/3] relative bg-muted">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-8 w-1/3" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </Card>
    ))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {renderSkeletons()}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="active" className="flex items-center justify-center gap-2">
            <span>Aktywne</span>
            <Badge variant="secondary">{counts.active}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center justify-center gap-2">
            <span>Oczekujące</span>
            <Badge variant="secondary">{counts.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center justify-center gap-2">
            <span>Wygasłe</span>
            <Badge variant="secondary">{counts.expired}</Badge>
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex items-center justify-center gap-2">
            <span>Szkice</span>
            <Badge variant="secondary">{counts.draft}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-muted rounded-full p-3 inline-flex mx-auto mb-4">
            {activeTab === 'active' && <CheckCircle2 className="h-8 w-8 text-muted-foreground" />}
            {activeTab === 'pending' && <Clock className="h-8 w-8 text-muted-foreground" />}
            {activeTab === 'expired' && <Ban className="h-8 w-8 text-muted-foreground" />}
            {activeTab === 'draft' && <Pencil className="h-8 w-8 text-muted-foreground" />}
          </div>
          <h3 className="text-xl font-semibold mb-2">Brak ogłoszeń</h3>
          <p className="text-muted-foreground mb-6">
            {activeTab === 'active' && "Nie masz żadnych aktywnych ogłoszeń"}
            {activeTab === 'pending' && "Nie masz żadnych oczekujących ogłoszeń"}
            {activeTab === 'expired' && "Nie masz żadnych wygasłych ogłoszeń"}
            {activeTab === 'draft' && "Nie masz żadnych szkiców ogłoszeń"}
          </p>
          <Button onClick={() => router.push('/ogloszenia/dodaj')}>
            Dodaj nowe ogłoszenie
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const imageUrl = listing.images && listing.images.length > 0
              ? listing.images[0]
              : null;
            
            const created = new Date(listing.created_at);
            const timeAgo = formatDistanceToNow(created, { 
              addSuffix: true, 
              locale: pl 
            });

            const isExpired = listing.status === 'expired';
            const isPending = listing.status === 'pending';
            const isDraft = listing.status === 'draft';

            return (
              <Card key={listing.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/3 aspect-[4/3] relative bg-muted">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageOff className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    {listing.is_promoted && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          Wyróżnione
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="flex-1 flex flex-col p-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium line-clamp-2">{listing.title}</h3>
                          <p className="text-2xl font-bold text-primary mt-1">
                            {formatPrice(listing.price)} CHF
                          </p>
                        </div>
                        {getStatusBadge(listing.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {listing.views_count || 0} wyświetleń
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {listing.messages_count || 0} wiadomości
                        </div>
                        <div>
                          Dodano {timeAgo}
                        </div>
                      </div>

                      {isExpired && (
                        <div className="mt-4">
                          <p className="text-sm text-destructive flex items-center mb-2">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            To ogłoszenie wygasło i nie jest widoczne dla kupujących
                          </p>
                        </div>
                      )}

                      {isPending && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground flex items-center mb-2">
                            <Clock className="h-4 w-4 mr-1" />
                            Ogłoszenie oczekuje na zatwierdzenie przez moderatora
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <CardFooter className="flex justify-between items-center px-0 pt-4 pb-0 mt-auto">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/ogloszenia/${listing.id}`)}
                        >
                          Podgląd
                          <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Button>

                        {isExpired && (
                          <Button 
                            size="sm" 
                            onClick={() => handleRenew(listing.id)}
                          >
                            <RefreshCw className="mr-1 h-4 w-4" />
                            Odnów
                          </Button>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Opcje</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/ogloszenia/edytuj/${listing.id}`)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edytuj
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePromote(listing.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            Promuj
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedListingId(listing.id)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Usuń
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć to ogłoszenie?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Ogłoszenie zostanie trwale usunięte z naszego systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}