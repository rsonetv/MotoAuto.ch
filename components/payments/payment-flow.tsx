'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { PaymentProvider, StripeElementsWrapper } from '@/lib/providers/payment-provider'
import { PackageSelection } from './package-selection'
import { PaymentForm } from './payment-form'
import { PaymentStatus } from './payment-status'
import { InvoiceViewer } from './invoice-viewer'
import type { Package, Payment } from '@/lib/database.types'

interface PaymentFlowProps {
  listingId?: string
  initialPackageId?: string
  userType?: 'private' | 'dealer'
  language?: 'de' | 'fr' | 'en' | 'pl'
  onComplete?: (payment: Payment) => void
  onCancel?: () => void
}

type PaymentStep = 'package-selection' | 'payment-form' | 'payment-status' | 'invoice'

interface PaymentIntentData {
  payment_id: string
  client_secret: string
  payment_intent_id: string
  amount: number
  currency: string
  status: string
  payment_method_types: string[]
}

const getTranslations = (language: string = 'de') => {
  const translations = {
    de: {
      steps: {
        packageSelection: 'Paket auswählen',
        paymentForm: 'Zahlung',
        paymentStatus: 'Status',
        invoice: 'Rechnung'
      },
      backToPackages: 'Zurück zu Paketen',
      backToPayment: 'Zurück zur Zahlung',
      processing: 'Zahlung wird verarbeitet...',
      error: 'Ein Fehler ist aufgetreten',
      retry: 'Erneut versuchen',
      cancel: 'Abbrechen'
    },
    fr: {
      steps: {
        packageSelection: 'Sélectionner le package',
        paymentForm: 'Paiement',
        paymentStatus: 'Statut',
        invoice: 'Facture'
      },
      backToPackages: 'Retour aux packages',
      backToPayment: 'Retour au paiement',
      processing: 'Traitement du paiement...',
      error: 'Une erreur s\'est produite',
      retry: 'Réessayer',
      cancel: 'Annuler'
    },
    en: {
      steps: {
        packageSelection: 'Select Package',
        paymentForm: 'Payment',
        paymentStatus: 'Status',
        invoice: 'Invoice'
      },
      backToPackages: 'Back to Packages',
      backToPayment: 'Back to Payment',
      processing: 'Processing payment...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel'
    },
    pl: {
      steps: {
        packageSelection: 'Wybierz pakiet',
        paymentForm: 'Płatność',
        paymentStatus: 'Status',
        invoice: 'Faktura'
      },
      backToPackages: 'Powrót do pakietów',
      backToPayment: 'Powrót do płatności',
      processing: 'Przetwarzanie płatności...',
      error: 'Wystąpił błąd',
      retry: 'Spróbuj ponownie',
      cancel: 'Anuluj'
    }
  }
  return translations[language as keyof typeof translations] || translations.de
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  listingId,
  initialPackageId,
  userType = 'private',
  language = 'de',
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('package-selection')
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentData | null>(null)
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = getTranslations(language)

  // Initialize with package if provided
  useEffect(() => {
    if (initialPackageId) {
      // Fetch package data and set as selected
      fetchPackageData(initialPackageId)
    }
  }, [initialPackageId])

  const fetchPackageData = async (packageId: string) => {
    try {
      const response = await fetch(`/api/packages/${packageId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSelectedPackage(data.data)
          setCurrentStep('payment-form')
        }
      }
    } catch (err) {
      console.error('Error fetching package:', err)
    }
  }

  // Handle package selection
  const handlePackageSelect = async (packageId: string, packageData: Package) => {
    try {
      setLoading(true)
      setError(null)
      setSelectedPackage(packageData)

      // Skip payment for free packages
      if (packageData.price_chf === 0) {
        // Create a free "payment" record
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: 0,
            currency: 'CHF',
            payment_type: 'listing_fee',
            package_id: packageId,
            listing_id: listingId,
            description: `Free package: ${packageData.name_en}`
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // For free packages, mark as completed immediately
            setCompletedPayment({
              ...data.data,
              status: 'completed',
              completed_at: new Date().toISOString()
            } as Payment)
            setCurrentStep('payment-status')
            if (onComplete) {
              onComplete(data.data)
            }
          }
        }
      } else {
        // Create payment intent for paid packages
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: packageData.price_chf,
            currency: 'CHF',
            payment_type: 'premium_package',
            package_id: packageId,
            listing_id: listingId,
            description: `Package: ${packageData.name_en}`,
            payment_methods: ['card', 'twint', 'postfinance'],
            automatic_payment_methods: {
              enabled: true,
              allow_redirects: 'always'
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setPaymentIntent(data.data)
            setCurrentStep('payment-form')
          } else {
            throw new Error(data.error || 'Failed to create payment intent')
          }
        } else {
          throw new Error('Failed to create payment intent')
        }
      }
    } catch (err) {
      console.error('Error handling package selection:', err)
      setError(err instanceof Error ? err.message : 'Failed to process package selection')
    } finally {
      setLoading(false)
    }
  }

  // Handle payment success
  const handlePaymentSuccess = async (stripePaymentIntent: any) => {
    try {
      setLoading(true)
      
      // Confirm payment with our API
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_intent_id: stripePaymentIntent.id,
          return_url: window.location.origin + '/payment/success'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCompletedPayment(data.data as Payment)
          setCurrentStep('payment-status')
          if (onComplete) {
            onComplete(data.data)
          }
        } else {
          throw new Error(data.error || 'Payment confirmation failed')
        }
      } else {
        throw new Error('Payment confirmation failed')
      }
    } catch (err) {
      console.error('Error confirming payment:', err)
      setError(err instanceof Error ? err.message : 'Payment confirmation failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // Handle invoice view
  const handleViewInvoice = () => {
    setCurrentStep('invoice')
  }

  // Get current step index for progress
  const getStepIndex = (step: PaymentStep): number => {
    const steps: PaymentStep[] = ['package-selection', 'payment-form', 'payment-status', 'invoice']
    return steps.indexOf(step)
  }

  // Get progress percentage
  const getProgressPercentage = (): number => {
    const currentIndex = getStepIndex(currentStep)
    const totalSteps = 4
    return ((currentIndex + 1) / totalSteps) * 100
  }

  // Navigation handlers
  const goBackToPackages = () => {
    setCurrentStep('package-selection')
    setSelectedPackage(null)
    setPaymentIntent(null)
    setError(null)
  }

  const goBackToPayment = () => {
    setCurrentStep('payment-form')
    setError(null)
  }

  const goBackToStatus = () => {
    setCurrentStep('payment-status')
  }

  return (
    <PaymentProvider options={{ locale: language }}>
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className={currentStep === 'package-selection' ? 'font-medium text-blue-600' : 'text-gray-500'}>
                  {t.steps.packageSelection}
                </span>
                <span className={currentStep === 'payment-form' ? 'font-medium text-blue-600' : 'text-gray-500'}>
                  {t.steps.paymentForm}
                </span>
                <span className={currentStep === 'payment-status' ? 'font-medium text-blue-600' : 'text-gray-500'}>
                  {t.steps.paymentStatus}
                </span>
                <span className={currentStep === 'invoice' ? 'font-medium text-blue-600' : 'text-gray-500'}>
                  {t.steps.invoice}
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={() => setError(null)}>
                {t.retry}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        {currentStep === 'package-selection' && (
          <div className="space-y-4">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div></div>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  {t.cancel}
                </Button>
              )}
            </div>

            <PackageSelection
              onPackageSelect={handlePackageSelect}
              selectedPackageId={selectedPackage?.id}
              language={language}
              userType={userType}
              showFreeOption={userType === 'private'}
            />
          </div>
        )}

        {currentStep === 'payment-form' && selectedPackage && paymentIntent && (
          <div className="space-y-4">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={goBackToPackages}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToPackages}
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  {t.cancel}
                </Button>
              )}
            </div>

            <StripeElementsWrapper 
              clientSecret={paymentIntent.client_secret}
              options={{ locale: language }}
            >
              <PaymentForm
                clientSecret={paymentIntent.client_secret}
                packageData={selectedPackage}
                amount={paymentIntent.amount}
                currency={paymentIntent.currency}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                language={language}
                returnUrl={window.location.origin + '/payment/success'}
              />
            </StripeElementsWrapper>
          </div>
        )}

        {currentStep === 'payment-status' && completedPayment && (
          <div className="space-y-4">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              {completedPayment.status === 'failed' && (
                <Button variant="outline" onClick={goBackToPayment}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.backToPayment}
                </Button>
              )}
              <div></div>
            </div>

            <PaymentStatus
              payment={completedPayment}
              onDownloadInvoice={completedPayment.status === 'completed' ? handleViewInvoice : undefined}
              onContinue={onComplete ? () => onComplete(completedPayment) : undefined}
              language={language}
            />
          </div>
        )}

        {currentStep === 'invoice' && completedPayment && (
          <div className="space-y-4">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={goBackToStatus}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Status
              </Button>
              <div></div>
            </div>

            <InvoiceViewer
              paymentId={completedPayment.id}
              payment={completedPayment}
              language={language}
              onClose={goBackToStatus}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6">
              <CardContent className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>{t.processing}</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PaymentProvider>
  )
}

export default PaymentFlow