'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  PaymentFlow, 
  PaymentHistory, 
  InvoiceViewer,
  PackageSelection 
} from '@/components/payments'
import type { Payment } from '@/lib/database.types'

type TestView = 'payment-flow' | 'payment-history' | 'package-selection' | 'invoice-viewer'

export default function PaymentTestPage() {
  const [currentView, setCurrentView] = useState<TestView>('payment-flow')
  const [language, setLanguage] = useState<'de' | 'fr' | 'en' | 'pl'>('de')
  const [userType, setUserType] = useState<'private' | 'dealer'>('private')
  const [testPaymentId, setTestPaymentId] = useState<string>('')

  const handlePaymentComplete = (payment: Payment) => {
    console.log('Payment completed:', payment)
    setTestPaymentId(payment.id)
    // You could redirect to success page or show success message
  }

  const handlePaymentCancel = () => {
    console.log('Payment cancelled')
    // Handle cancellation
  }

  const handleViewInvoice = (paymentId: string) => {
    setTestPaymentId(paymentId)
    setCurrentView('invoice-viewer')
  }

  const handleViewPayment = (paymentId: string) => {
    console.log('View payment details:', paymentId)
    // Could open a modal or navigate to payment details
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            MotoAuto.ch Payment System Test
          </h1>
          <p className="text-gray-600">
            Test the complete payment system with Stripe integration, Swiss payment methods, and multilingual support.
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View
                </label>
                <Select value={currentView} onValueChange={(value: TestView) => setCurrentView(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment-flow">Complete Payment Flow</SelectItem>
                    <SelectItem value="package-selection">Package Selection Only</SelectItem>
                    <SelectItem value="payment-history">Payment History</SelectItem>
                    <SelectItem value="invoice-viewer">Invoice Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <Select value={language} onValueChange={(value: 'de' | 'fr' | 'en' | 'pl') => setLanguage(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch (DE)</SelectItem>
                    <SelectItem value="fr">Français (FR)</SelectItem>
                    <SelectItem value="en">English (EN)</SelectItem>
                    <SelectItem value="pl">Polski (PL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type
                </label>
                <Select value={userType} onValueChange={(value: 'private' | 'dealer') => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private User</SelectItem>
                    <SelectItem value="dealer">Dealer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Payment ID
                </label>
                <input
                  type="text"
                  value={testPaymentId}
                  onChange={(e) => setTestPaymentId(e.target.value)}
                  placeholder="Enter payment ID for testing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Swiss Market Features</h4>
                <div className="space-y-1">
                  <Badge variant="outline">CHF Primary Currency</Badge>
                  <Badge variant="outline">7.7% Swiss VAT</Badge>
                  <Badge variant="outline">TWINT Support</Badge>
                  <Badge variant="outline">PostFinance Support</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Payment Methods</h4>
                <div className="space-y-1">
                  <Badge variant="outline">Credit/Debit Cards</Badge>
                  <Badge variant="outline">3D Secure</Badge>
                  <Badge variant="outline">SEPA Direct Debit</Badge>
                  <Badge variant="outline">Multiple Currencies</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Packages</h4>
                <div className="space-y-1">
                  <Badge variant="outline">Free Package (0 CHF)</Badge>
                  <Badge variant="outline">Premium (29.90 CHF)</Badge>
                  <Badge variant="outline">Dealer (99.90 CHF)</Badge>
                  <Badge variant="outline">Commission (5% max 500 CHF)</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current View */}
        <div className="space-y-6">
          {currentView === 'payment-flow' && (
            <PaymentFlow
              listingId="test-listing-id"
              userType={userType}
              language={language}
              onComplete={handlePaymentComplete}
              onCancel={handlePaymentCancel}
            />
          )}

          {currentView === 'package-selection' && (
            <PackageSelection
              onPackageSelect={(packageId, packageData) => {
                console.log('Package selected:', packageId, packageData)
              }}
              language={language}
              userType={userType}
              showFreeOption={userType === 'private'}
            />
          )}

          {currentView === 'payment-history' && (
            <PaymentHistory
              onViewInvoice={handleViewInvoice}
              onViewPayment={handleViewPayment}
              language={language}
            />
          )}

          {currentView === 'invoice-viewer' && testPaymentId && (
            <InvoiceViewer
              paymentId={testPaymentId}
              language={language}
              onClose={() => setCurrentView('payment-history')}
            />
          )}

          {currentView === 'invoice-viewer' && !testPaymentId && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">
                  Please enter a payment ID in the test controls to view an invoice.
                </p>
                <Button onClick={() => setCurrentView('payment-history')}>
                  Go to Payment History
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Development Notes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Development Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Environment Setup</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Stripe test keys are configured in .env.local</li>
                  <li>Use test card numbers: 4242424242424242 (Visa), 4000002500003155 (3D Secure)</li>
                  <li>TWINT and PostFinance are available in test mode</li>
                  <li>All payments are processed in test mode</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">API Integration</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Payment intents are created via /api/payments/create-intent</li>
                  <li>Payment confirmation via /api/payments/confirm</li>
                  <li>Invoice generation via /api/payments/invoice/[id]</li>
                  <li>Payment history via /api/payments/history</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Security Features</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>PCI compliance through Stripe Elements</li>
                  <li>No card data stored locally</li>
                  <li>Webhook signature verification</li>
                  <li>Authentication required for all payment operations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}