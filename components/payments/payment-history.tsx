'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  CreditCard, 
  Package, 
  Loader2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { formatSwissAmount } from '@/lib/stripe'
import type { Payment, Package as PackageType } from '@/lib/database.types'

interface PaymentHistoryProps {
  onViewInvoice?: (paymentId: string) => void
  onViewPayment?: (paymentId: string) => void
  language?: 'de' | 'fr' | 'en' | 'pl'
  userId?: string
}

interface PaymentWithDetails extends Payment {
  packages?: PackageType
  listings?: {
    id: string
    title: string
    brand: string
    model: string
  }
}

interface PaymentHistoryResponse {
  data: PaymentWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: {
    total_payments: number
    total_amount: number
    completed_payments: number
    completed_amount: number
    success_rate: number
    by_currency: Record<string, { total: number; completed: number; count: number }>
    by_type: Record<string, { total: number; count: number }>
    by_status: Record<string, { count: number; amount: number }>
  }
}

const getTranslations = (language: string = 'de') => {
  const translations = {
    de: {
      title: 'Zahlungshistorie',
      searchPlaceholder: 'Nach Zahlungen suchen...',
      filterByStatus: 'Nach Status filtern',
      filterByType: 'Nach Typ filtern',
      filterByCurrency: 'Nach Währung filtern',
      allStatuses: 'Alle Status',
      allTypes: 'Alle Typen',
      allCurrencies: 'Alle Währungen',
      completed: 'Abgeschlossen',
      pending: 'Ausstehend',
      failed: 'Fehlgeschlagen',
      cancelled: 'Abgebrochen',
      refunded: 'Erstattet',
      processing: 'Verarbeitung',
      listingFee: 'Inseratsgebühr',
      commission: 'Provision',
      premiumPackage: 'Premium-Paket',
      featuredListing: 'Hervorgehobenes Inserat',
      refund: 'Erstattung',
      amount: 'Betrag',
      date: 'Datum',
      status: 'Status',
      type: 'Typ',
      paymentMethod: 'Zahlungsmethode',
      actions: 'Aktionen',
      viewInvoice: 'Rechnung anzeigen',
      viewDetails: 'Details anzeigen',
      downloadInvoice: 'Rechnung herunterladen',
      noPayments: 'Keine Zahlungen gefunden',
      loading: 'Zahlungen werden geladen...',
      error: 'Fehler beim Laden der Zahlungen',
      retry: 'Erneut versuchen',
      summary: 'Zusammenfassung',
      totalPayments: 'Gesamtzahlungen',
      totalAmount: 'Gesamtbetrag',
      successRate: 'Erfolgsrate',
      page: 'Seite',
      of: 'von',
      previous: 'Vorherige',
      next: 'Nächste',
      showingResults: 'Zeige Ergebnisse',
      to: 'bis',
      exportData: 'Daten exportieren'
    },
    fr: {
      title: 'Historique des paiements',
      searchPlaceholder: 'Rechercher des paiements...',
      filterByStatus: 'Filtrer par statut',
      filterByType: 'Filtrer par type',
      filterByCurrency: 'Filtrer par devise',
      allStatuses: 'Tous les statuts',
      allTypes: 'Tous les types',
      allCurrencies: 'Toutes les devises',
      completed: 'Terminé',
      pending: 'En attente',
      failed: 'Échoué',
      cancelled: 'Annulé',
      refunded: 'Remboursé',
      processing: 'En cours',
      listingFee: 'Frais d\'annonce',
      commission: 'Commission',
      premiumPackage: 'Package Premium',
      featuredListing: 'Annonce en vedette',
      refund: 'Remboursement',
      amount: 'Montant',
      date: 'Date',
      status: 'Statut',
      type: 'Type',
      paymentMethod: 'Méthode de paiement',
      actions: 'Actions',
      viewInvoice: 'Voir la facture',
      viewDetails: 'Voir les détails',
      downloadInvoice: 'Télécharger la facture',
      noPayments: 'Aucun paiement trouvé',
      loading: 'Chargement des paiements...',
      error: 'Erreur lors du chargement des paiements',
      retry: 'Réessayer',
      summary: 'Résumé',
      totalPayments: 'Total des paiements',
      totalAmount: 'Montant total',
      successRate: 'Taux de réussite',
      page: 'Page',
      of: 'de',
      previous: 'Précédent',
      next: 'Suivant',
      showingResults: 'Affichage des résultats',
      to: 'à',
      exportData: 'Exporter les données'
    },
    en: {
      title: 'Payment History',
      searchPlaceholder: 'Search payments...',
      filterByStatus: 'Filter by status',
      filterByType: 'Filter by type',
      filterByCurrency: 'Filter by currency',
      allStatuses: 'All Statuses',
      allTypes: 'All Types',
      allCurrencies: 'All Currencies',
      completed: 'Completed',
      pending: 'Pending',
      failed: 'Failed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      processing: 'Processing',
      listingFee: 'Listing Fee',
      commission: 'Commission',
      premiumPackage: 'Premium Package',
      featuredListing: 'Featured Listing',
      refund: 'Refund',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      type: 'Type',
      paymentMethod: 'Payment Method',
      actions: 'Actions',
      viewInvoice: 'View Invoice',
      viewDetails: 'View Details',
      downloadInvoice: 'Download Invoice',
      noPayments: 'No payments found',
      loading: 'Loading payments...',
      error: 'Error loading payments',
      retry: 'Retry',
      summary: 'Summary',
      totalPayments: 'Total Payments',
      totalAmount: 'Total Amount',
      successRate: 'Success Rate',
      page: 'Page',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      showingResults: 'Showing results',
      to: 'to',
      exportData: 'Export Data'
    },
    pl: {
      title: 'Historia płatności',
      searchPlaceholder: 'Szukaj płatności...',
      filterByStatus: 'Filtruj według statusu',
      filterByType: 'Filtruj według typu',
      filterByCurrency: 'Filtruj według waluty',
      allStatuses: 'Wszystkie statusy',
      allTypes: 'Wszystkie typy',
      allCurrencies: 'Wszystkie waluty',
      completed: 'Zakończone',
      pending: 'Oczekujące',
      failed: 'Nieudane',
      cancelled: 'Anulowane',
      refunded: 'Zwrócone',
      processing: 'Przetwarzane',
      listingFee: 'Opłata za ogłoszenie',
      commission: 'Prowizja',
      premiumPackage: 'Pakiet Premium',
      featuredListing: 'Wyróżnione ogłoszenie',
      refund: 'Zwrot',
      amount: 'Kwota',
      date: 'Data',
      status: 'Status',
      type: 'Typ',
      paymentMethod: 'Metoda płatności',
      actions: 'Akcje',
      viewInvoice: 'Zobacz fakturę',
      viewDetails: 'Zobacz szczegóły',
      downloadInvoice: 'Pobierz fakturę',
      noPayments: 'Nie znaleziono płatności',
      loading: 'Ładowanie płatności...',
      error: 'Błąd podczas ładowania płatności',
      retry: 'Spróbuj ponownie',
      summary: 'Podsumowanie',
      totalPayments: 'Łączne płatności',
      totalAmount: 'Łączna kwota',
      successRate: 'Wskaźnik sukcesu',
      page: 'Strona',
      of: 'z',
      previous: 'Poprzednia',
      next: 'Następna',
      showingResults: 'Pokazuje wyniki',
      to: 'do',
      exportData: 'Eksportuj dane'
    }
  }
  return translations[language as keyof typeof translations] || translations.de
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  onViewInvoice,
  onViewPayment,
  language = 'de',
  userId
}) => {
  const [payments, setPayments] = useState<PaymentHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [currencyFilter, setCurrencyFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const t = getTranslations(language)

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString(),
          ...(statusFilter && { status: statusFilter }),
          ...(typeFilter && { payment_type: typeFilter }),
          ...(currencyFilter && { currency: currencyFilter }),
          ...(searchTerm && { search: searchTerm })
        })

        const response = await fetch(`/api/payments/history?${params}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (data.success) {
          setPayments(data.data)
        } else {
          throw new Error(data.error || 'Failed to load payments')
        }
      } catch (err) {
        console.error('Error fetching payments:', err)
        setError(err instanceof Error ? err.message : 'Failed to load payments')
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [currentPage, pageSize, statusFilter, typeFilter, currencyFilter, searchTerm])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    )
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'pending':
      case 'processing':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Get payment type display name
  const getPaymentTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      listing_fee: t.listingFee,
      commission: t.commission,
      premium_package: t.premiumPackage,
      featured_listing: t.featuredListing,
      refund: t.refund
    }
    return typeMap[type] || type
  }

  // Get status display name
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: t.completed,
      pending: t.pending,
      failed: t.failed,
      cancelled: t.cancelled,
      refunded: t.refunded,
      processing: t.processing
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{t.error}: {error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                {t.retry}
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!payments || payments.data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="text-gray-500">{t.noPayments}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>{t.title}</span>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t.exportData}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t.filterByStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
                <SelectItem value="completed">{t.completed}</SelectItem>
                <SelectItem value="pending">{t.pending}</SelectItem>
                <SelectItem value="failed">{t.failed}</SelectItem>
                <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                <SelectItem value="refunded">{t.refunded}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter || "all"} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t.filterByType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allTypes}</SelectItem>
                <SelectItem value="listing_fee">{t.listingFee}</SelectItem>
                <SelectItem value="commission">{t.commission}</SelectItem>
                <SelectItem value="premium_package">{t.premiumPackage}</SelectItem>
                <SelectItem value="featured_listing">{t.featuredListing}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currencyFilter || "all"} onValueChange={setCurrencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t.filterByCurrency} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCurrencies}</SelectItem>
                <SelectItem value="CHF">CHF</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          {payments.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">{t.totalPayments}</p>
                    <p className="text-2xl font-bold text-blue-900">{payments.summary.total_payments}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">{t.totalAmount}</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatSwissAmount(payments.summary.total_amount, 'CHF', language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">{t.successRate}</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {payments.summary.success_rate.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Completed</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {formatSwissAmount(payments.summary.completed_amount, 'CHF', language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">{t.date}</th>
                  <th className="text-left p-4 font-medium text-gray-900">{t.amount}</th>
                  <th className="text-left p-4 font-medium text-gray-900">{t.type}</th>
                  <th className="text-left p-4 font-medium text-gray-900">{t.status}</th>
                  <th className="text-left p-4 font-medium text-gray-900">{t.paymentMethod}</th>
                  <th className="text-left p-4 font-medium text-gray-900">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {payments.data.map((payment, index) => (
                  <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4">
                      <div className="text-sm">
                        {formatDate(payment.completed_at || payment.created_at)}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {payment.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {formatSwissAmount(payment.amount, payment.currency, language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}
                      </div>
                      {payment.commission_amount > 0 && (
                        <div className="text-xs text-gray-500">
                          Commission: {formatSwissAmount(payment.commission_amount, payment.currency, language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {getPaymentTypeDisplay(payment.payment_type)}
                      </div>
                      {payment.packages && (
                        <div className="text-xs text-gray-500">
                          {payment.packages.name_de}
                        </div>
                      )}
                      {payment.listings && (
                        <div className="text-xs text-gray-500">
                          {payment.listings.title}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(payment.status)}>
                        {getStatusDisplay(payment.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm capitalize">
                        {payment.payment_method?.replace('_', ' ') || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {payment.status === 'completed' && onViewInvoice && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewInvoice(payment.id)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {t.viewInvoice}
                          </Button>
                        )}
                        {onViewPayment && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewPayment(payment.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {t.viewDetails}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {payments.pagination.totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="text-sm text-gray-600">
              {t.showingResults} {((currentPage - 1) * pageSize) + 1} {t.to} {Math.min(currentPage * pageSize, payments.pagination.total)} {t.of} {payments.pagination.total}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!payments.pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t.previous}
              </Button>
              
              <span className="text-sm">
                {t.page} {currentPage} {t.of} {payments.pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!payments.pagination.hasNext}
              >
                {t.next}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PaymentHistory