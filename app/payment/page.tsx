'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Shield,
  Info,
  Package as PackageIcon,
  Clock,
  Euro,
  Banknote,
  Smartphone
} from 'lucide-react'
import { PaymentProvider } from '@/lib/providers/payment-provider'
import { PaymentFlow } from '@/components/payments/payment-flow'
import { formatSwissAmount, calculateSwissVAT } from '@/lib/stripe'
import type { Package } from '@/lib/database.types'

// Payment step types
type PaymentStep = 'package-selection' | 'payment-details' | 'payment-processing' | 'payment-complete'

// Language detection and translations
const getLanguageFromPath = (): 'de' | 'fr' | 'en' | 'pl' => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname
    if (path.includes('/fr/')) return 'fr'
    if (path.includes('/en/')) return 'en'
    if (path.includes('/pl/')) return 'pl'
  }
  return 'de' // Default to German for Swiss market
}

const getTranslations = (language: string = 'de') => {
  const translations = {
    de: {
      title: 'Zahlung - MotoAuto.ch',
      subtitle: 'Sichere Zahlung für Ihr Fahrzeuginserat',
      backToPackages: 'Zurück zu Paketen',
      backToPrevious: 'Zurück',
      
      // Payment Summary
      paymentSummary: 'Zahlungsübersicht',
      orderSummary: 'Bestellübersicht',
      selectedPackage: 'Ausgewähltes Paket',
      packageDetails: 'Paketdetails',
      duration: 'Laufzeit',
      days: 'Tage',
      images: 'Bilder',
      features: 'Funktionen',
      
      // Amount Display
      amount: 'Betrag',
      netAmount: 'Nettobetrag',
      vatAmount: 'MwSt. (7.7%)',
      totalAmount: 'Gesamtbetrag',
      currency: 'CHF',
      
      // Payment Methods
      paymentMethods: 'Zahlungsmethoden',
      creditCard: 'Kredit-/Debitkarte',
      creditCardDesc: 'Visa, MasterCard, Maestro',
      bankTransfer: 'Banküberweisung',
      bankTransferDesc: 'Traditionelle Überweisung',
      paypal: 'PayPal',
      paypalDesc: 'Sichere Online-Zahlung',
      twint: 'TWINT',
      twintDesc: 'Schweizer Mobile Payment',
      postfinance: 'PostFinance',
      postfinanceDesc: 'PostFinance Card',
      
      // Form Fields
      cardNumber: 'Kartennummer',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      expiryDate: 'Ablaufdatum',
      expiryPlaceholder: 'MM/JJ',
      cvv: 'CVV',
      cvvPlaceholder: '123',
      cardholderName: 'Karteninhaber',
      cardholderPlaceholder: 'Max Mustermann',
      emailInvoice: 'E-Mail für Rechnung',
      emailPlaceholder: 'max.mustermann@email.com',
      
      // Legal & Terms
      acceptTerms: 'Ich akzeptiere die Allgemeinen Geschäftsbedingungen',
      acceptPrivacy: 'Ich akzeptiere die Datenschutzerklärung',
      securePayment: 'Sichere Zahlung mit SSL-Verschlüsselung',
      pciCompliant: 'PCI-DSS konform',
      
      // Action Buttons
      payAndActivate: 'Bezahlen und aktivieren',
      processing: 'Zahlung wird verarbeitet...',
      back: 'Zurück',
      continue: 'Weiter',
      
      // Status Messages
      paymentSuccessful: 'Zahlung erfolgreich!',
      paymentFailed: 'Zahlung fehlgeschlagen',
      paymentPending: 'Zahlung ausstehend',
      
      // Error Messages
      selectPackageFirst: 'Bitte wählen Sie zuerst ein Paket aus',
      paymentError: 'Zahlungsfehler',
      networkError: 'Netzwerkfehler',
      tryAgain: 'Erneut versuchen',
      
      // Swiss Market Features
      swissMarketTitle: 'Schweizer Markt Features',
      swissVat: 'Schweizer MwSt. (7.7%)',
      swissPayments: 'Schweizer Zahlungsmethoden',
      invoiceGeneration: 'Automatische Rechnungserstellung',
      
      // Progress Steps
      steps: {
        packageSelection: 'Paket auswählen',
        paymentDetails: 'Zahlungsdetails',
        processing: 'Verarbeitung',
        complete: 'Abgeschlossen'
      }
    },
    fr: {
      title: 'Paiement - MotoAuto.ch',
      subtitle: 'Paiement sécurisé pour votre annonce de véhicule',
      backToPackages: 'Retour aux packages',
      backToPrevious: 'Retour',
      
      paymentSummary: 'Résumé du paiement',
      orderSummary: 'Résumé de la commande',
      selectedPackage: 'Package sélectionné',
      packageDetails: 'Détails du package',
      duration: 'Durée',
      days: 'jours',
      images: 'images',
      features: 'Fonctionnalités',
      
      amount: 'Montant',
      netAmount: 'Montant net',
      vatAmount: 'TVA (7.7%)',
      totalAmount: 'Montant total',
      currency: 'CHF',
      
      paymentMethods: 'Méthodes de paiement',
      creditCard: 'Carte de crédit/débit',
      creditCardDesc: 'Visa, MasterCard, Maestro',
      bankTransfer: 'Virement bancaire',
      bankTransferDesc: 'Virement traditionnel',
      paypal: 'PayPal',
      paypalDesc: 'Paiement en ligne sécurisé',
      twint: 'TWINT',
      twintDesc: 'Paiement mobile suisse',
      postfinance: 'PostFinance',
      postfinanceDesc: 'Carte PostFinance',
      
      cardNumber: 'Numéro de carte',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      expiryDate: 'Date d\'expiration',
      expiryPlaceholder: 'MM/AA',
      cvv: 'CVV',
      cvvPlaceholder: '123',
      cardholderName: 'Titulaire de la carte',
      cardholderPlaceholder: 'Jean Dupont',
      emailInvoice: 'E-mail pour facture',
      emailPlaceholder: 'jean.dupont@email.com',
      
      acceptTerms: 'J\'accepte les conditions générales',
      acceptPrivacy: 'J\'accepte la politique de confidentialité',
      securePayment: 'Paiement sécurisé avec chiffrement SSL',
      pciCompliant: 'Conforme PCI-DSS',
      
      payAndActivate: 'Payer et activer',
      processing: 'Traitement du paiement...',
      back: 'Retour',
      continue: 'Continuer',
      
      paymentSuccessful: 'Paiement réussi!',
      paymentFailed: 'Paiement échoué',
      paymentPending: 'Paiement en attente',
      
      selectPackageFirst: 'Veuillez d\'abord sélectionner un package',
      paymentError: 'Erreur de paiement',
      networkError: 'Erreur réseau',
      tryAgain: 'Réessayer',
      
      swissMarketTitle: 'Fonctionnalités du marché suisse',
      swissVat: 'TVA suisse (7.7%)',
      swissPayments: 'Méthodes de paiement suisses',
      invoiceGeneration: 'Génération automatique de factures',
      
      steps: {
        packageSelection: 'Sélectionner le package',
        paymentDetails: 'Détails du paiement',
        processing: 'Traitement',
        complete: 'Terminé'
      }
    },
    en: {
      title: 'Payment - MotoAuto.ch',
      subtitle: 'Secure payment for your vehicle listing',
      backToPackages: 'Back to Packages',
      backToPrevious: 'Back',
      
      paymentSummary: 'Payment Summary',
      orderSummary: 'Order Summary',
      selectedPackage: 'Selected Package',
      packageDetails: 'Package Details',
      duration: 'Duration',
      days: 'days',
      images: 'images',
      features: 'Features',
      
      amount: 'Amount',
      netAmount: 'Net Amount',
      vatAmount: 'VAT (7.7%)',
      totalAmount: 'Total Amount',
      currency: 'CHF',
      
      paymentMethods: 'Payment Methods',
      creditCard: 'Credit/Debit Card',
      creditCardDesc: 'Visa, MasterCard, Maestro',
      bankTransfer: 'Bank Transfer',
      bankTransferDesc: 'Traditional transfer',
      paypal: 'PayPal',
      paypalDesc: 'Secure online payment',
      twint: 'TWINT',
      twintDesc: 'Swiss Mobile Payment',
      postfinance: 'PostFinance',
      postfinanceDesc: 'PostFinance Card',
      
      cardNumber: 'Card Number',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      expiryDate: 'Expiry Date',
      expiryPlaceholder: 'MM/YY',
      cvv: 'CVV',
      cvvPlaceholder: '123',
      cardholderName: 'Cardholder Name',
      cardholderPlaceholder: 'John Smith',
      emailInvoice: 'Email for Invoice',
      emailPlaceholder: 'john.smith@email.com',
      
      acceptTerms: 'I accept the Terms and Conditions',
      acceptPrivacy: 'I accept the Privacy Policy',
      securePayment: 'Secure payment with SSL encryption',
      pciCompliant: 'PCI-DSS compliant',
      
      payAndActivate: 'Pay and Activate',
      processing: 'Processing payment...',
      back: 'Back',
      continue: 'Continue',
      
      paymentSuccessful: 'Payment Successful!',
      paymentFailed: 'Payment Failed',
      paymentPending: 'Payment Pending',
      
      selectPackageFirst: 'Please select a package first',
      paymentError: 'Payment Error',
      networkError: 'Network Error',
      tryAgain: 'Try Again',
      
      swissMarketTitle: 'Swiss Market Features',
      swissVat: 'Swiss VAT (7.7%)',
      swissPayments: 'Swiss Payment Methods',
      invoiceGeneration: 'Automatic Invoice Generation',
      
      steps: {
        packageSelection: 'Select Package',
        paymentDetails: 'Payment Details',
        processing: 'Processing',
        complete: 'Complete'
      }
    },
    pl: {
      title: 'Płatność - MotoAuto.ch',
      subtitle: 'Bezpieczna płatność za ogłoszenie pojazdu',
      backToPackages: 'Powrót do pakietów',
      backToPrevious: 'Powrót',
      
      paymentSummary: 'Podsumowanie płatności',
      orderSummary: 'Podsumowanie zamówienia',
      selectedPackage: 'Wybrany pakiet',
      packageDetails: 'Szczegóły pakietu',
      duration: 'Czas trwania',
      days: 'dni',
      images: 'zdjęcia',
      features: 'Funkcje',
      
      amount: 'Kwota',
      netAmount: 'Kwota netto',
      vatAmount: 'VAT (7.7%)',
      totalAmount: 'Kwota całkowita',
      currency: 'CHF',
      
      paymentMethods: 'Metody płatności',
      creditCard: 'Karta kredytowa/debetowa',
      creditCardDesc: 'Visa, MasterCard, Maestro',
      bankTransfer: 'Przelew bankowy',
      bankTransferDesc: 'Tradycyjny przelew',
      paypal: 'PayPal',
      paypalDesc: 'Bezpieczna płatność online',
      twint: 'TWINT',
      twintDesc: 'Szwajcarska płatność mobilna',
      postfinance: 'PostFinance',
      postfinanceDesc: 'Karta PostFinance',
      
      cardNumber: 'Numer karty',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      expiryDate: 'Data ważności',
      expiryPlaceholder: 'MM/RR',
      cvv: 'CVV',
      cvvPlaceholder: '123',
      cardholderName: 'Imię i nazwisko posiadacza karty',
      cardholderPlaceholder: 'Jan Kowalski',
      emailInvoice: 'E-mail do faktury',
      emailPlaceholder: 'jan.kowalski@email.com',
      
      acceptTerms: 'Akceptuję Regulamin',
      acceptPrivacy: 'Akceptuję Politykę Prywatności',
      securePayment: 'Bezpieczna płatność z szyfrowaniem SSL',
      pciCompliant: 'Zgodne z PCI-DSS',
      
      payAndActivate: 'Zapłać i aktywuj',
      processing: 'Przetwarzanie płatności...',
      back: 'Powrót',
      continue: 'Kontynuuj',
      
      paymentSuccessful: 'Płatność zakończona sukcesem!',
      paymentFailed: 'Płatność nieudana',
      paymentPending: 'Płatność oczekująca',
      
      selectPackageFirst: 'Proszę najpierw wybrać pakiet',
      paymentError: 'Błąd płatności',
      networkError: 'Błąd sieci',
      tryAgain: 'Spróbuj ponownie',
      
      swissMarketTitle: 'Funkcje szwajcarskiego rynku',
      swissVat: 'Szwajcarski VAT (7.7%)',
      swissPayments: 'Szwajcarskie metody płatności',
      invoiceGeneration: 'Automatyczne generowanie faktur',
      
      steps: {
        packageSelection: 'Wybierz pakiet',
        paymentDetails: 'Szczegóły płatności',
        processing: 'Przetwarzanie',
        complete: 'Zakończone'
      }
    }
  }
  return translations[language as keyof typeof translations] || translations.de
}

// Payment method icons
const PaymentMethodIcon = ({ method }: { method: string }) => {
  switch (method) {
    case 'card':
      return <CreditCard className="h-5 w-5" />
    case 'twint':
      return <Smartphone className="h-5 w-5" />
    case 'postfinance':
      return <Banknote className="h-5 w-5" />
    case 'bank_transfer':
      return <Euro className="h-5 w-5" />
    default:
      return <CreditCard className="h-5 w-5" />
  }
}

// Main Payment Page Component
function PaymentPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [language] = useState<'de' | 'fr' | 'en' | 'pl'>(getLanguageFromPath())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  const t = getTranslations(language)

  // Get URL parameters
  const packageId = searchParams.get('package')
  const listingId = searchParams.get('listing')
  const userType = (searchParams.get('type') as 'private' | 'dealer') || 'private'
  const returnUrl = searchParams.get('return') || '/dashboard'

  // Load package data if package ID is provided
  useEffect(() => {
    if (packageId) {
      loadPackageData(packageId)
    }
  }, [packageId])

  const loadPackageData = async (pkgId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/packages/${pkgId}`)
      if (!response.ok) {
        throw new Error('Failed to load package')
      }

      const data = await response.json()
      if (data.success) {
        setSelectedPackage(data.data)
      } else {
        throw new Error(data.error || 'Package not found')
      }
    } catch (err) {
      console.error('Error loading package:', err)
      setError(err instanceof Error ? err.message : 'Failed to load package')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentComplete = (payment: any) => {
    // Redirect to success page or dashboard
    const successUrl = new URL('/payment/success', window.location.origin)
    successUrl.searchParams.set('payment_id', payment.id)
    if (returnUrl) {
      successUrl.searchParams.set('return', returnUrl)
    }
    window.location.href = successUrl.toString()
  }

  const handlePaymentCancel = () => {
    // Go back to package selection or previous page
    if (returnUrl && returnUrl !== '/dashboard') {
      router.push(returnUrl)
    } else {
      router.push('/cennik')
    }
  }

  // Calculate VAT for display
  const getVATCalculation = (amount: number) => {
    return calculateSwissVAT(amount, 0.077)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading payment page...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            <Button variant="outline" onClick={handlePaymentCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Swiss Market Features Banner */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">{t.swissMarketTitle}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{t.swissVat}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{t.swissPayments}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{t.invoiceGeneration}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Flow */}
        <PaymentProvider options={{ locale: language }}>
          <PaymentFlow
            listingId={listingId || undefined}
            initialPackageId={packageId || undefined}
            userType={userType}
            language={language}
            onComplete={handlePaymentComplete}
            onCancel={handlePaymentCancel}
          />
        </PaymentProvider>

        {/* Payment Methods Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>{t.paymentMethods}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <PaymentMethodIcon method="card" />
                <div>
                  <div className="font-medium text-sm">{t.creditCard}</div>
                  <div className="text-xs text-gray-500">{t.creditCardDesc}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <PaymentMethodIcon method="twint" />
                <div>
                  <div className="font-medium text-sm">{t.twint}</div>
                  <div className="text-xs text-gray-500">{t.twintDesc}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <PaymentMethodIcon method="postfinance" />
                <div>
                  <div className="font-medium text-sm">{t.postfinance}</div>
                  <div className="text-xs text-gray-500">{t.postfinanceDesc}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <PaymentMethodIcon method="bank_transfer" />
                <div>
                  <div className="font-medium text-sm">{t.bankTransfer}</div>
                  <div className="text-xs text-gray-500">{t.bankTransferDesc}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance Info */}
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-6 text-sm text-green-700">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>{t.securePayment}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{t.pciCompliant}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>256-bit SSL</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function PaymentPage() {
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
      <PaymentPageContent />
    </Suspense>
  )
}