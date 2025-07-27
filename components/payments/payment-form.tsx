'use client'

import React, { useState, useEffect } from 'react'
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Loader2, AlertCircle, CreditCard, Shield, Info } from 'lucide-react'
import { formatSwissAmount } from '@/lib/stripe'
import type { Package } from '@/lib/database.types'

interface PaymentFormProps {
  clientSecret: string
  packageData: Package
  amount: number
  currency: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  language?: 'de' | 'fr' | 'en' | 'pl'
  returnUrl?: string
}

const getTranslations = (language: string = 'de') => {
  const translations = {
    de: {
      title: 'Zahlungsinformationen',
      paymentMethod: 'Zahlungsmethode',
      billingAddress: 'Rechnungsadresse',
      orderSummary: 'Bestellübersicht',
      package: 'Paket',
      amount: 'Betrag',
      vat: 'MwSt. (7.7%)',
      total: 'Gesamt',
      processing: 'Zahlung wird verarbeitet...',
      payNow: 'Jetzt bezahlen',
      securePayment: 'Sichere Zahlung mit SSL-Verschlüsselung',
      acceptTerms: 'Ich akzeptiere die Allgemeinen Geschäftsbedingungen',
      acceptPrivacy: 'Ich akzeptiere die Datenschutzerklärung',
      paymentError: 'Zahlungsfehler',
      invalidForm: 'Bitte füllen Sie alle erforderlichen Felder aus',
      termsRequired: 'Sie müssen die AGB akzeptieren',
      privacyRequired: 'Sie müssen die Datenschutzerklärung akzeptieren',
      swissPayments: 'Unterstützte Zahlungsmethoden: Kreditkarte, TWINT, PostFinance',
      duration: 'Laufzeit',
      days: 'Tage',
      images: 'Bilder'
    },
    fr: {
      title: 'Informations de paiement',
      paymentMethod: 'Méthode de paiement',
      billingAddress: 'Adresse de facturation',
      orderSummary: 'Résumé de la commande',
      package: 'Package',
      amount: 'Montant',
      vat: 'TVA (7.7%)',
      total: 'Total',
      processing: 'Traitement du paiement...',
      payNow: 'Payer maintenant',
      securePayment: 'Paiement sécurisé avec chiffrement SSL',
      acceptTerms: 'J\'accepte les conditions générales',
      acceptPrivacy: 'J\'accepte la politique de confidentialité',
      paymentError: 'Erreur de paiement',
      invalidForm: 'Veuillez remplir tous les champs requis',
      termsRequired: 'Vous devez accepter les CGV',
      privacyRequired: 'Vous devez accepter la politique de confidentialité',
      swissPayments: 'Méthodes de paiement supportées: Carte de crédit, TWINT, PostFinance',
      duration: 'Durée',
      days: 'jours',
      images: 'images'
    },
    en: {
      title: 'Payment Information',
      paymentMethod: 'Payment Method',
      billingAddress: 'Billing Address',
      orderSummary: 'Order Summary',
      package: 'Package',
      amount: 'Amount',
      vat: 'VAT (7.7%)',
      total: 'Total',
      processing: 'Processing payment...',
      payNow: 'Pay Now',
      securePayment: 'Secure payment with SSL encryption',
      acceptTerms: 'I accept the Terms and Conditions',
      acceptPrivacy: 'I accept the Privacy Policy',
      paymentError: 'Payment Error',
      invalidForm: 'Please fill in all required fields',
      termsRequired: 'You must accept the Terms and Conditions',
      privacyRequired: 'You must accept the Privacy Policy',
      swissPayments: 'Supported payment methods: Credit Card, TWINT, PostFinance',
      duration: 'Duration',
      days: 'days',
      images: 'images'
    },
    pl: {
      title: 'Informacje o płatności',
      paymentMethod: 'Metoda płatności',
      billingAddress: 'Adres rozliczeniowy',
      orderSummary: 'Podsumowanie zamówienia',
      package: 'Pakiet',
      amount: 'Kwota',
      vat: 'VAT (7.7%)',
      total: 'Razem',
      processing: 'Przetwarzanie płatności...',
      payNow: 'Zapłać teraz',
      securePayment: 'Bezpieczna płatność z szyfrowaniem SSL',
      acceptTerms: 'Akceptuję Regulamin',
      acceptPrivacy: 'Akceptuję Politykę Prywatności',
      paymentError: 'Błąd płatności',
      invalidForm: 'Proszę wypełnić wszystkie wymagane pola',
      termsRequired: 'Musisz zaakceptować Regulamin',
      privacyRequired: 'Musisz zaakceptować Politykę Prywatności',
      swissPayments: 'Obsługiwane metody płatności: Karta kredytowa, TWINT, PostFinance',
      duration: 'Czas trwania',
      days: 'dni',
      images: 'zdjęcia'
    }
  }
  return translations[language as keyof typeof translations] || translations.de
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  packageData,
  amount,
  currency,
  onSuccess,
  onError,
  language = 'de',
  returnUrl
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

  const t = getTranslations(language)

  // Calculate VAT (7.7% Swiss VAT)
  const vatRate = 0.077
  const netAmount = amount / (1 + vatRate)
  const vatAmount = amount - netAmount

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setError('Payment system not ready')
      return
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      setError(t.termsRequired)
      return
    }

    if (!acceptPrivacy) {
      setError(t.privacyRequired)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Confirm payment with Stripe
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/payment/success`,
          receipt_email: undefined // Will be handled by the payment element
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent)
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // 3D Secure or other authentication required
        // Stripe will handle this automatically
      } else {
        throw new Error('Payment was not completed')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  // Payment element options
  const paymentElementOptions = {
    layout: 'tabs' as const,
    paymentMethodOrder: ['card', 'twint', 'postfinance_card'],
    fields: {
      billingDetails: 'auto' as const
    },
    terms: {
      card: 'auto' as const
    }
  }

  const addressElementOptions = {
    mode: 'billing' as const,
    allowedCountries: ['CH', 'DE', 'AT', 'FR', 'IT'],
    fields: {
      phone: 'always' as const
    },
    validation: {
      phone: {
        required: 'always' as const
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Payment Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>{t.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">{t.paymentMethod}</h3>
                <div className="p-4 border rounded-lg">
                  <PaymentElement options={paymentElementOptions} />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Info className="h-4 w-4" />
                  <span>{t.swissPayments}</span>
                </div>
              </div>

              <Separator />

              {/* Billing Address */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">{t.billingAddress}</h3>
                <div className="p-4 border rounded-lg">
                  <AddressElement options={addressElementOptions} />
                </div>
              </div>

              <Separator />

              {/* Terms and Privacy */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                    {t.acceptTerms}
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={acceptPrivacy}
                    onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-700 cursor-pointer">
                    {t.acceptPrivacy}
                  </label>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!stripe || !elements || isProcessing || !acceptTerms || !acceptPrivacy}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    {t.payNow} {formatSwissAmount(amount, currency, language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}
                  </>
                )}
              </Button>

              {/* Security Notice */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>{t.securePayment}</span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>{t.orderSummary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Package Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.package}:</span>
                <span className="font-medium">{packageData.name_de}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.duration}:</span>
                <span>{packageData.duration_days} {t.days}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.images}:</span>
                <span>{packageData.max_images} max</span>
              </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.amount}:</span>
                <span>{formatSwissAmount(netAmount, currency, language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t.vat}:</span>
                <span>{formatSwissAmount(vatAmount, currency, language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>{t.total}:</span>
                <span>{formatSwissAmount(amount, currency, language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}</span>
              </div>
            </div>

            {/* Package Features */}
            {packageData.features && Array.isArray(packageData.features) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Package Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {packageData.features
                      .filter((f): f is string => typeof f === 'string')
                      .slice(0, 3)
                      .map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PaymentForm