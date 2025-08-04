# Payment Page Refactoring Plan

This document outlines the plan to merge the functionality of `app/payment/page.tsx` into `app/dashboard/payments/page.tsx`, deprecating the former.

## 1. New `app/dashboard/payments/page.tsx` Implementation

The existing `app/dashboard/payments/page.tsx` will be completely replaced. The new implementation will adapt the code from `app/payment/page.tsx` to fit within the dashboard layout and context.

The key changes are:
-   The page will no longer render its own header, as it will be part of the dashboard layout which already provides one.
-   It will use `<Suspense>` to provide a better loading experience while fetching URL parameters.
-   It will use the `PaymentProvider` and `PaymentFlow` components, preserving the robust payment logic.
-   It will correctly handle `package`, `listing`, and `return` URL search parameters.

### Proposed Code for `app/dashboard/payments/page.tsx`

```tsx
'use client'

import React, { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Shield,
  Info,
  Smartphone,
  Banknote,
  Euro
} from 'lucide-react'
import { PaymentProvider } from '@/lib/providers/payment-provider'
import { PaymentFlow } from '@/components/payments/payment-flow'

// NOTE: The extensive translation functions (getLanguageFromPath, getTranslations)
// from the original app/payment/page.tsx should be copied here verbatim.
// They are omitted for brevity in this plan.

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
  // Abridged translations for planning purposes.
  // The full translation object from app/payment/page.tsx should be used.
  const translations = {
    de: {
      title: 'Zahlung',
      subtitle: 'Sichere Zahlung für Ihr Paket',
      back: 'Zurück',
      swissMarketTitle: 'Schweizer Markt Features',
      swissVat: 'Schweizer MwSt. (7.7%)',
      swissPayments: 'Schweizer Zahlungsmethoden',
      invoiceGeneration: 'Automatische Rechnungserstellung',
      paymentMethods: 'Zahlungsmethoden',
      creditCard: 'Kredit-/Debitkarte',
      creditCardDesc: 'Visa, MasterCard, Maestro',
      twint: 'TWINT',
      twintDesc: 'Schweizer Mobile Payment',
      postfinance: 'PostFinance',
      postfinanceDesc: 'PostFinance Card',
      bankTransfer: 'Banküberweisung',
      bankTransferDesc: 'Traditionelle Überweisung',
      securePayment: 'Sichere Zahlung mit SSL-Verschlüsselung',
      pciCompliant: 'PCI-DSS konform',
    },
    // fr, en, pl translations should be included here...
  };
  return translations[language as keyof typeof translations] || translations.de
}


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

function PaymentsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const language = getLanguageFromPath()
  const t = getTranslations(language)

  // Extract parameters from URL
  const packageId = searchParams.get('package')
  const listingId = searchParams.get('listing')
  const userType = (searchParams.get('type') as 'private' | 'dealer') || 'private'
  const returnUrl = searchParams.get('return') || '/dashboard/packages'

  const handlePaymentComplete = (payment: any) => {
    // On successful payment, redirect to the specified return URL.
    // A success status could also be added to the URL.
    const successUrl = new URL(returnUrl, window.location.origin)
    successUrl.searchParams.set('payment_status', 'success')
    successUrl.searchParams.set('payment_id', payment.id)
    router.push(successUrl.toString())
  }

  const handlePaymentCancel = () => {
    // Return to the previous page or a default dashboard page
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
      <Card>
        <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Icons and descriptions for payment methods */}
            </div>
        </CardContent>
      </Card>

      {/* Security & Compliance Info */}
      <Card className="bg-green-50 border-green-200">
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPaymentsPage() {
  return (
    <Suspense fallback={<div>Loading Payment Details...</div>}>
      <PaymentsPageContent />
    </Suspense>
  )
}
```

## 2. Update `components/dashboard/package-selection.tsx`

The `package-selection.tsx` component already redirects to the correct path (`/dashboard/payments`). To improve user experience, we should add a `return` URL parameter so the user can easily navigate back to the package selection page if they cancel the payment process.

### Required Change

Modify the `handleSelectPackage` function in `components/dashboard/package-selection.tsx`:

**From:**
```typescript
const handleSelectPackage = (packageId: string) => {
  router.push(`/dashboard/payments?package=${packageId}`);
};
```

**To:**
```typescript
const handleSelectPackage = (packageId: string) => {
  const returnUrl = '/dashboard/packages';
  router.push(`/dashboard/payments?package=${packageId}&return=${encodeURIComponent(returnUrl)}`);
};
```

## 3. Cleanup Plan

After the new payments page is implemented and verified, the old `/payment` route and its associated files should be removed.

### Files and Directories to Delete:

1.  **Directory:** `app/payment/`
    -   This will remove `app/payment/page.tsx`.
    -   This will remove `app/payment/success/page.tsx`.
    -   This will remove any other files within the `/payment` directory.

This cleanup ensures that all traffic goes through the new, unified payment flow within the user dashboard.