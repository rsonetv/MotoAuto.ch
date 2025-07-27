'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  Download,
  ArrowRight,
  Receipt,
  CreditCard,
  Calendar,
  Package as PackageIcon,
  Home,
  FileText,
  Mail,
  AlertCircle
} from 'lucide-react'
import { formatSwissAmount } from '@/lib/stripe'
import type { Payment, Package } from '@/lib/database.types'

// Language detection
const getLanguageFromPath = (): 'de' | 'fr' | 'en' | 'pl' => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname
    if (path.includes('/fr/')) return 'fr'
    if (path.includes('/en/')) return 'en'
    if (path.includes('/pl/')) return 'pl'
  }
  return 'de'
}

const getTranslations = (language: string = 'de') => {
  const translations = {
    de: {
      title: 'Zahlung erfolgreich!',
      subtitle: 'Ihre Zahlung wurde erfolgreich verarbeitet',
      thankYou: 'Vielen Dank für Ihren Kauf',
      confirmationMessage: 'Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details.',
      
      // Payment Details
      paymentDetails: 'Zahlungsdetails',
      paymentId: 'Zahlungs-ID',
      amount: 'Betrag',
      paymentMethod: 'Zahlungsmethode',
      paymentDate: 'Zahlungsdatum',
      status: 'Status',
      
      // Package Details
      packageDetails: 'Paketdetails',
      packageName: 'Paket',
      duration: 'Laufzeit',
      days: 'Tage',
      maxImages: 'Max. Bilder',
      features: 'Funktionen',
      
      // Service Activation
      serviceActivation: 'Service-Aktivierung',
      serviceActivated: 'Ihr Service wurde erfolgreich aktiviert',
      activationDetails: 'Ihr Fahrzeuginserat ist jetzt aktiv und für Käufer sichtbar.',
      expiresOn: 'Läuft ab am',
      
      // Next Steps
      nextSteps: 'Nächste Schritte',
      manageListings: 'Inserate verwalten',
      downloadInvoice: 'Rechnung herunterladen',
      backToDashboard: 'Zum Dashboard',
      viewListing: 'Inserat anzeigen',
      
      // Invoice
      invoiceGeneration: 'Rechnung wird erstellt...',
      invoiceReady: 'Rechnung bereit',
      invoiceEmail: 'Die Rechnung wurde an Ihre E-Mail-Adresse gesendet.',
      
      // Status
      completed: 'Abgeschlossen',
      active: 'Aktiv',
      
      // Buttons
      continue: 'Weiter',
      close: 'Schließen'
    },
    fr: {
      title: 'Paiement réussi!',
      subtitle: 'Votre paiement a été traité avec succès',
      thankYou: 'Merci pour votre achat',
      confirmationMessage: 'Vous recevrez sous peu un e-mail de confirmation avec tous les détails.',
      
      paymentDetails: 'Détails du paiement',
      paymentId: 'ID de paiement',
      amount: 'Montant',
      paymentMethod: 'Méthode de paiement',
      paymentDate: 'Date de paiement',
      status: 'Statut',
      
      packageDetails: 'Détails du package',
      packageName: 'Package',
      duration: 'Durée',
      days: 'jours',
      maxImages: 'Max. images',
      features: 'Fonctionnalités',
      
      serviceActivation: 'Activation du service',
      serviceActivated: 'Votre service a été activé avec succès',
      activationDetails: 'Votre annonce de véhicule est maintenant active et visible pour les acheteurs.',
      expiresOn: 'Expire le',
      
      nextSteps: 'Prochaines étapes',
      manageListings: 'Gérer les annonces',
      downloadInvoice: 'Télécharger la facture',
      backToDashboard: 'Retour au tableau de bord',
      viewListing: 'Voir l\'annonce',
      
      invoiceGeneration: 'Génération de la facture...',
      invoiceReady: 'Facture prête',
      invoiceEmail: 'La facture a été envoyée à votre adresse e-mail.',
      
      completed: 'Terminé',
      active: 'Actif',
      
      continue: 'Continuer',
      close: 'Fermer'
    },
    en: {
      title: 'Payment Successful!',
      subtitle: 'Your payment has been processed successfully',
      thankYou: 'Thank you for your purchase',
      confirmationMessage: 'You will receive a confirmation email shortly with all the details.',
      
      paymentDetails: 'Payment Details',
      paymentId: 'Payment ID',
      amount: 'Amount',
      paymentMethod: 'Payment Method',
      paymentDate: 'Payment Date',
      status: 'Status',
      
      packageDetails: 'Package Details',
      packageName: 'Package',
      duration: 'Duration',
      days: 'days',
      maxImages: 'Max. Images',
      features: 'Features',
      
      serviceActivation: 'Service Activation',
      serviceActivated: 'Your service has been successfully activated',
      activationDetails: 'Your vehicle listing is now active and visible to buyers.',
      expiresOn: 'Expires on',
      
      nextSteps: 'Next Steps',
      manageListings: 'Manage Listings',
      downloadInvoice: 'Download Invoice',
      backToDashboard: 'Back to Dashboard',
      viewListing: 'View Listing',
      
      invoiceGeneration: 'Generating invoice...',
      invoiceReady: 'Invoice Ready',
      invoiceEmail: 'The invoice has been sent to your email address.',
      
      completed: 'Completed',
      active: 'Active',
      
      continue: 'Continue',
      close: 'Close'
    },
    pl: {
      title: 'Płatność zakończona sukcesem!',
      subtitle: 'Twoja płatność została pomyślnie przetworzona',
      thankYou: 'Dziękujemy za zakup',
      confirmationMessage: 'Wkrótce otrzymasz e-mail z potwierdzeniem ze wszystkimi szczegółami.',
      
      paymentDetails: 'Szczegóły płatności',
      paymentId: 'ID płatności',
      amount: 'Kwota',
      paymentMethod: 'Metoda płatności',
      paymentDate: 'Data płatności',
      status: 'Status',
      
      packageDetails: 'Szczegóły pakietu',
      packageName: 'Pakiet',
      duration: 'Czas trwania',
      days: 'dni',
      maxImages: 'Maks. zdjęcia',
      features: 'Funkcje',
      
      serviceActivation: 'Aktywacja usługi',
      serviceActivated: 'Twoja usługa została pomyślnie aktywowana',
      activationDetails: 'Twoje ogłoszenie pojazdu jest teraz aktywne i widoczne dla kupujących.',
      expiresOn: 'Wygasa',
      
      nextSteps: 'Następne kroki',
      manageListings: 'Zarządzaj ogłoszeniami',
      downloadInvoice: 'Pobierz fakturę',
      backToDashboard: 'Powrót do panelu',
      viewListing: 'Zobacz ogłoszenie',
      
      invoiceGeneration: 'Generowanie faktury...',
      invoiceReady: 'Faktura gotowa',
      invoiceEmail: 'Faktura została wysłana na Twój adres e-mail.',
      
      completed: 'Zakończone',
      active: 'Aktywne',
      
      continue: 'Kontynuuj',
      close: 'Zamknij'
    }
  }
  return translations[language as keyof typeof translations] || translations.de
}

// Payment Success Page Content
function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [language] = useState<'de' | 'fr' | 'en' | 'pl'>(getLanguageFromPath())
  const [payment, setPayment] = useState<Payment & { packages?: Package } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoiceGenerating, setInvoiceGenerating] = useState(false)

  const t = getTranslations(language)

  // Get URL parameters
  const paymentId = searchParams.get('payment_id')
  const returnUrl = searchParams.get('return') || '/dashboard'

  // Load payment data
  useEffect(() => {
    if (paymentId) {
      loadPaymentData(paymentId)
    } else {
      setError('No payment ID provided')
      setLoading(false)
    }
  }, [paymentId])

  const loadPaymentData = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/payments/history?payment_id=${id}`)
      if (!response.ok) {
        throw new Error('Failed to load payment data')
      }

      const data = await response.json()
      if (data.success && data.data.length > 0) {
        setPayment(data.data[0])
      } else {
        throw new Error('Payment not found')
      }
    } catch (err) {
      console.error('Error loading payment:', err)
      setError(err instanceof Error ? err.message : 'Failed to load payment')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!payment) return

    try {
      setInvoiceGenerating(true)
      const response = await fetch(`/api/payments/invoice/${payment.id}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${payment.id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Failed to download invoice')
      }
    } catch (err) {
      console.error('Error downloading invoice:', err)
      setError('Failed to download invoice')
    } finally {
      setInvoiceGenerating(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString(
      language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    )
  }

  const getExpirationDate = () => {
    if (!payment?.packages?.duration_days || !payment.completed_at) return null
    const completedDate = new Date(payment.completed_at)
    const expirationDate = new Date(completedDate)
    expirationDate.setDate(expirationDate.getDate() + payment.packages.duration_days)
    return expirationDate
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading payment details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-600 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <h2 className="text-lg font-semibold">Error</h2>
            </div>
            <p className="text-gray-600 mb-4">{error || 'Payment not found'}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const expirationDate = getExpirationDate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600 mt-2">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-green-800 mb-2">{t.thankYou}</h2>
              <p className="text-green-700">{t.confirmationMessage}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>{t.paymentDetails}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.paymentId}:</span>
                  <span className="font-mono text-sm">{payment.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.amount}:</span>
                  <span className="font-medium">
                    {formatSwissAmount(payment.amount, payment.currency, language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}
                  </span>
                </div>
                
                {payment.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.paymentMethod}:</span>
                    <span className="capitalize">{payment.payment_method.replace('_', ' ')}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.paymentDate}:</span>
                  <span>{formatDate(payment.completed_at)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.status}:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {t.completed}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Details */}
          {payment.packages && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PackageIcon className="h-5 w-5" />
                  <span>{t.packageDetails}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.packageName}:</span>
                    <span className="font-medium">{payment.packages.name_de}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.duration}:</span>
                    <span>{payment.packages.duration_days} {t.days}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.maxImages}:</span>
                    <span>{payment.packages.max_images}</span>
                  </div>

                  {expirationDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.expiresOn}:</span>
                      <span>{formatDate(expirationDate.toISOString())}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Service Activation */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <CheckCircle className="h-5 w-5" />
              <span>{t.serviceActivation}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-blue-700 font-medium">{t.serviceActivated}</p>
              <p className="text-blue-600">{t.activationDetails}</p>
              {expirationDate && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Calendar className="h-4 w-4" />
                  <span>{t.expiresOn}: {formatDate(expirationDate.toISOString())}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t.nextSteps}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center justify-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>{t.backToDashboard}</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleDownloadInvoice}
                disabled={invoiceGenerating}
                className="flex items-center justify-center space-x-2"
              >
                {invoiceGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>{t.invoiceGeneration}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>{t.downloadInvoice}</span>
                  </>
                )}
              </Button>
              
              {payment.listing_id && (
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/ogloszenia/${payment.listing_id}`)}
                  className="flex items-center justify-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>{t.viewListing}</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Info */}
        <Card className="mt-6 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{t.invoiceEmail}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}