'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Shield } from 'lucide-react'
import { PaymentProvider } from '@/lib/providers/payment-provider'
import { PaymentFlow } from '@/components/payments/payment-flow'

// Hardcoded Polish translations
const t = {
  title: 'Płatność',
  subtitle: 'Bezpieczna płatność za ogłoszenie pojazdu',
  back: 'Powrót',
  swissMarketTitle: 'Funkcje szwajcarskiego rynku',
  swissVat: 'Szwajcarski VAT (7.7%)',
  swissPayments: 'Szwajcarskie metody płatności',
  invoiceGeneration: 'Automatyczne generowanie faktur',
  paymentMethods: 'Metody płatności',
  creditCard: 'Karta kredytowa/debetowa',
  creditCardDesc: 'Visa, MasterCard, Maestro',
  twint: 'TWINT',
  twintDesc: 'Szwajcarska płatność mobilna',
  postfinance: 'PostFinance',
  postfinanceDesc: 'Karta PostFinance',
  bankTransfer: 'Przelew bankowy',
  bankTransferDesc: 'Tradycyjny przelew',
  securePayment: 'Bezpieczna płatność z szyfrowaniem SSL',
  pciCompliant: 'Zgodne z PCI-DSS',
};

export default function PaymentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract parameters from URL
  const packageId = searchParams.get('packageId') // Corrected from 'package'
  const listingId = searchParams.get('listing')
  const userType = (searchParams.get('type') as 'private' | 'dealer') || 'private'
  const returnUrl = searchParams.get('return') || '/dashboard/packages'
  const locale = 'pl'; // Hardcode locale

  const handlePaymentComplete = (payment: any) => {
    const successUrl = new URL(returnUrl, window.location.origin)
    successUrl.searchParams.set('payment_status', 'success')
    successUrl.searchParams.set('payment_id', payment.id)
    router.push(successUrl.toString())
  }

  const handlePaymentCancel = () => {
    router.push(returnUrl)
  }

  return (
    <div className="space-y-8">
      {/* Swiss Market Features Banner */}
      <Card className="bg-blue-50 border-blue-200">
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
      <PaymentProvider options={{ locale: locale }}>
        <PaymentFlow
          listingId={listingId || undefined}
          initialPackageId={packageId || undefined}
          userType={userType}
          language={locale}
          onComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
        />
      </PaymentProvider>
    </div>
  )
}