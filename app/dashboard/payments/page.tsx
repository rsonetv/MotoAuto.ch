"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CreditCard,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'

interface Payment {
  id: string
  type: 'package_purchase' | 'commission' | 'refund' | 'penalty'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  description: string
  payment_method: string
  stripe_payment_id?: string
  created_at: string
  processed_at?: string
  listing_id?: string
  package_id?: string
  invoice_url?: string
  
  // Relacje
  listing?: {
    id: string
    title: string
    brand: string
    model: string
  }
  package?: {
    id: string
    name: string
    duration_days: number
  }
}

interface PaymentStats {
  totalSpent: number
  totalEarned: number
  totalCommissions: number
  pendingPayments: number
  monthlySpending: number
  monthlyEarnings: number
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPayments()
  }, [statusFilter, typeFilter, dateRange])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Pobierz płatności z relacjami
      let query = supabase
        .from('payments')
        .select(`
          *,
          listings (id, title, brand, model),
          packages (id, name, duration_days)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Zastosuj filtry
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }

      if (dateRange !== 'all') {
        const now = new Date()
        let startDate = new Date()
        
        switch (dateRange) {
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }
        
        query = query.gte('created_at', startDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error

      setPayments(data || [])

      // Oblicz statystyki
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Błąd podczas ładowania płatności')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (paymentsData: Payment[]) => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const totalSpent = paymentsData
      .filter(p => ['package_purchase', 'penalty'].includes(p.type) && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalEarned = paymentsData
      .filter(p => p.type === 'commission' && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalCommissions = paymentsData
      .filter(p => p.type === 'commission')
      .reduce((sum, p) => sum + p.amount, 0)

    const pendingPayments = paymentsData
      .filter(p => p.status === 'pending').length

    const monthlySpending = paymentsData
      .filter(p => 
        ['package_purchase', 'penalty'].includes(p.type) && 
        p.status === 'completed' &&
        new Date(p.created_at) >= monthStart
      )
      .reduce((sum, p) => sum + p.amount, 0)

    const monthlyEarnings = paymentsData
      .filter(p => 
        p.type === 'commission' && 
        p.status === 'completed' &&
        new Date(p.created_at) >= monthStart
      )
      .reduce((sum, p) => sum + p.amount, 0)

    setStats({
      totalSpent,
      totalEarned,
      totalCommissions,
      pendingPayments,
      monthlySpending,
      monthlyEarnings
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Oczekuje', variant: 'secondary' as const, icon: Clock },
      completed: { label: 'Zakończone', variant: 'default' as const, icon: CheckCircle2 },
      failed: { label: 'Nieudane', variant: 'destructive' as const, icon: X },
      refunded: { label: 'Zwrócone', variant: 'outline' as const, icon: TrendingDown }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      package_purchase: 'Zakup pakietu',
      commission: 'Prowizja',
      refund: 'Zwrot',
      penalty: 'Kara'
    }
    return typeLabels[type as keyof typeof typeLabels] || type
  }

  const getTypeIcon = (type: string) => {
    const iconMap = {
      package_purchase: CreditCard,
      commission: DollarSign,
      refund: TrendingDown,
      penalty: AlertCircle
    }
    return iconMap[type as keyof typeof iconMap] || CreditCard
  }

  const downloadInvoice = async (paymentId: string) => {
    try {
      // Tu powinna być logika pobierania faktury
      toast.info('Pobieranie faktury - funkcja w przygotowaniu')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error('Błąd podczas pobierania faktury')
    }
  }

  const filteredPayments = payments.filter(payment =>
    payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.package?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historia płatności</h1>
          <p className="text-gray-600">Przeglądaj wszystkie swoje transakcje i faktury</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Eksportuj CSV
        </Button>
      </div>

      {/* Statystyki */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.totalSpent.toLocaleString()} CHF
              </div>
              <div className="text-sm text-gray-600">Wydane łącznie</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalEarned.toLocaleString()} CHF
              </div>
              <div className="text-sm text-gray-600">Zarobione łącznie</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalCommissions.toLocaleString()} CHF
              </div>
              <div className="text-sm text-gray-600">Prowizje</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingPayments}
              </div>
              <div className="text-sm text-gray-600">Oczekujące</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.monthlySpending.toLocaleString()} CHF
              </div>
              <div className="text-sm text-gray-600">Ten miesiąc - wydatki</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">
                {stats.monthlyEarnings.toLocaleString()} CHF
              </div>
              <div className="text-sm text-gray-600">Ten miesiąc - zarobki</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtry */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Szukaj płatności..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie statusy</SelectItem>
                <SelectItem value="pending">Oczekujące</SelectItem>
                <SelectItem value="completed">Zakończone</SelectItem>
                <SelectItem value="failed">Nieudane</SelectItem>
                <SelectItem value="refunded">Zwrócone</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie typy</SelectItem>
                <SelectItem value="package_purchase">Zakup pakietu</SelectItem>
                <SelectItem value="commission">Prowizja</SelectItem>
                <SelectItem value="refund">Zwrot</SelectItem>
                <SelectItem value="penalty">Kara</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Okres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="week">Ostatni tydzień</SelectItem>
                <SelectItem value="month">Ostatni miesiąc</SelectItem>
                <SelectItem value="quarter">Ostatni kwartał</SelectItem>
                <SelectItem value="year">Ostatni rok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela płatności */}
      <Card>
        <CardHeader>
          <CardTitle>Lista transakcji</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Brak płatności
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Brak wyników dla podanych kryteriów' : 'Nie masz jeszcze żadnych transakcji'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sposób płatności</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const TypeIcon = getTypeIcon(payment.type)
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {new Date(payment.created_at).toLocaleDateString('pl-PL')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(payment.created_at), { 
                                  addSuffix: true, 
                                  locale: pl 
                                })}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <TypeIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm">{getTypeLabel(payment.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.description}</div>
                            {payment.listing && (
                              <div className="text-sm text-gray-600">
                                {payment.listing.brand} {payment.listing.model}
                              </div>
                            )}
                            {payment.package && (
                              <div className="text-sm text-gray-600">
                                Pakiet: {payment.package.name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${
                            payment.type === 'commission' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {payment.type === 'commission' ? '+' : '-'}
                            {payment.amount.toLocaleString()} {payment.currency}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {payment.payment_method || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {payment.invoice_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadInvoice(payment.id)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {payment.stripe_payment_id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  // Kopiuj ID do schowka
                                  navigator.clipboard.writeText(payment.stripe_payment_id!)
                                  toast.success('ID płatności skopiowane')
                                }}
                              >
                                ID
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informacje o prowizjach */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg text-blue-800 mb-2">
            ℹ️ Informacje o prowizjach
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <strong>Stawka prowizji:</strong> 5% od ceny sprzedaży
            </div>
            <div>
              <strong>Maksymalna prowizja:</strong> 500 CHF za transakcję
            </div>
            <div>
              <strong>Płatność prowizji:</strong> Automatycznie po sprzedaży
            </div>
            <div>
              <strong>Faktury:</strong> Dostępne w PDF do pobrania
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
