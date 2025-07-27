'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard, Shield } from 'lucide-react'
import { formatSwissAmount } from '@/lib/stripe'

interface PaymentIntegrationProps {
  packageId: string
  packageName: string
  price: number
  language: 'pl' | 'de' | 'fr' | 'en'
  onPaymentInitiate: (packageId: string) => void
}

const translations = {
  pl: {
    selectPayment: 'Wybierz metodę płatności',
    creditCard: 'Karta kredytowa',
    twint: 'TWINT',
    postfinance: 'PostFinance',
    bankTransfer: 'Przelew bankowy',
    securePayment: 'Bezpieczna płatność SSL',
    proceedToPayment: 'Przejdź do płatności',
    paymentMethods: 'Akceptowane metody płatności',
    instantActivation: 'Natychmiastowa aktywacja',
    moneyBackGuarantee: '14-dniowa gwarancja zwrotu',
    swissCompliant: 'Zgodne z prawem szwajcarskim'
  },
  de: {
    selectPayment: 'Zahlungsmethode wählen',
    creditCard: 'Kreditkarte',
    twint: 'TWINT',
    postfinance: 'PostFinance',
    bankTransfer: 'Banküberweisung',
    securePayment: 'Sichere SSL-Zahlung',
    proceedToPayment: 'Zur Zahlung',
    paymentMethods: 'Akzeptierte Zahlungsmethoden',
    instantActivation: 'Sofortige Aktivierung',
    moneyBackGuarantee: '14-Tage Geld-zurück-Garantie',
    swissCompliant: 'Schweizer Recht konform'
  },
  fr: {
    selectPayment: 'Choisir le mode de paiement',
    creditCard: 'Carte de crédit',
    twint: 'TWINT',
    postfinance: 'PostFinance',
    bankTransfer: 'Virement bancaire',
    securePayment: 'Paiement SSL sécurisé',
    proceedToPayment: 'Procéder au paiement',
    paymentMethods: 'Méthodes de paiement acceptées',
    instantActivation: 'Activation instantanée',
    moneyBackGuarantee: 'Garantie de remboursement 14 jours',
    swissCompliant: 'Conforme au droit suisse'
  },
  en: {
    selectPayment: 'Select payment method',
    creditCard: 'Credit card',
    twint: 'TWINT',
    postfinance: 'PostFinance',
    bankTransfer: 'Bank transfer',
    securePayment: 'Secure SSL payment',
    proceedToPayment: 'Proceed to payment',
    paymentMethods: 'Accepted payment methods',
    instantActivation: 'Instant activation',
    moneyBackGuarantee: '14-day money-back guarantee',
    swissCompliant: 'Swiss law compliant'
  }
}

export const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({
  packageId,
  packageName,
  price,
  language,
  onPaymentInitiate
}) => {
  const t = translations[language]

  const paymentMethods = [
    { id: 'card', name: t.creditCard, icon: <CreditCard className="h-5 w-5" /> },
    { id: 'twint', name: t.twint, icon: <div className="h-5 w-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">T</div> },
    { id: 'postfinance', name: t.postfinance, icon: <div className="h-5 w-5 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">P</div> },
    { id: 'bank_transfer', name: t.bankTransfer, icon: <div className="h-5 w-5 bg-gray-600 rounded text-white text-xs flex items-center justify-center">€</div> }
  ]

  const guarantees = [
    t.instantActivation,
    t.moneyBackGuarantee,
    t.swissCompliant
  ]

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {packageName}
        </CardTitle>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {formatSwissAmount(price, 'CHF', language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Methods */}
        <div>
          <h4 className="font-medium mb-3">{t.paymentMethods}</h4>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                {method.icon}
                <span className="text-sm">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantees */}
        <div>
          <ul className="space-y-2">
            {guarantees.map((guarantee, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>{guarantee}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Shield className="h-4 w-4" />
          <span>{t.securePayment}</span>
        </div>

        {/* Payment Button */}
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={() => onPaymentInitiate(packageId)}
        >
          {t.proceedToPayment}
        </Button>
      </CardContent>
    </Card>
  )
}

export default PaymentIntegration