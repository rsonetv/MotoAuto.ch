'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Download, 
  Receipt, 
  ArrowRight,
  CreditCard,
  Calendar,
  Package
} from 'lucide-react'
import { formatSwissAmount } from '@/lib/stripe'
import type { Payment, Package as PackageType } from '@/lib/database.types'

interface PaymentStatusProps {
  payment: Payment & {
    packages?: PackageType
    listings?: {
      id: string
      title: string
    }
  }
  onDownloadInvoice?: () => void
  onContinue?: () => void
  language?: 'de' | 'fr' | 'en' | 'pl'
}

const getTranslations = (language: string = 'de') => {
  const translations = {
    de: {
      paymentSuccessful: 'Zahlung erfolgreich',
      paymentFailed: 'Zahlung fehlgeschlagen',
      paymentPending: 'Zahlung ausstehend',
      paymentProcessing: 'Zahlung wird verarbeitet',
      paymentCancelled: 'Zahlung abgebrochen',
      paymentRefunded: 'Zahlung erstattet',
      successMessage: 'Ihre Zahlung wurde erfolgreich verarbeitet. Sie erhalten in Kürze eine Bestätigungs-E-Mail.',
      failedMessage: 'Ihre Zahlung konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.',
      pendingMessage: 'Ihre Zahlung wird noch verarbeitet. Dies kann einige Minuten dauern.',
      processingMessage: 'Ihre Zahlung wird gerade verarbeitet. Bitte warten Sie.',
      cancelledMessage: 'Die Zahlung wurde abgebrochen. Sie können es erneut versuchen.',
      refundedMessage: 'Ihre Zahlung wurde erfolgreich erstattet.',
      paymentDetails: 'Zahlungsdetails',
      orderDetails: 'Bestelldetails',
      paymentId: 'Zahlungs-ID',
      amount: 'Betrag',
      currency: 'Währung',
      paymentMethod: 'Zahlungsmethode',
      paymentDate: 'Zahlungsdatum',
      package: 'Paket',
      listing: 'Inserat',
      status: 'Status',
      downloadInvoice: 'Rechnung herunterladen',
      backToDashboard: 'Zurück zum Dashboard',
      tryAgain: 'Erneut versuchen',
      continue: 'Weiter',
      contactSupport: 'Support kontaktieren',
      failureReason: 'Grund des Fehlers',
      nextSteps: 'Nächste Schritte',
      activationInfo: 'Ihr Service wurde aktiviert und ist sofort verfügbar.',
      refundInfo: 'Die Erstattung wird in 3-5 Werktagen auf Ihrem Konto erscheinen.'
    },
    fr: {
      paymentSuccessful: 'Paiement réussi',
      paymentFailed: 'Paiement échoué',
      paymentPending: 'Paiement en attente',
      paymentProcessing: 'Paiement en cours',
      paymentCancelled: 'Paiement annulé',
      paymentRefunded: 'Paiement remboursé',
      successMessage: 'Votre paiement a été traité avec succès. Vous recevrez un e-mail de confirmation sous peu.',
      failedMessage: 'Votre paiement n\'a pas pu être traité. Veuillez réessayer.',
      pendingMessage: 'Votre paiement est en cours de traitement. Cela peut prendre quelques minutes.',
      processingMessage: 'Votre paiement est en cours de traitement. Veuillez patienter.',
      cancelledMessage: 'Le paiement a été annulé. Vous pouvez réessayer.',
      refundedMessage: 'Votre paiement a été remboursé avec succès.',
      paymentDetails: 'Détails du paiement',
      orderDetails: 'Détails de la commande',
      paymentId: 'ID de paiement',
      amount: 'Montant',
      currency: 'Devise',
      paymentMethod: 'Méthode de paiement',
      paymentDate: 'Date de paiement',
      package: 'Package',
      listing: 'Annonce',
      status: 'Statut',
      downloadInvoice: 'Télécharger la facture',
      backToDashboard: 'Retour au tableau de bord',
      tryAgain: 'Réessayer',
      continue: 'Continuer',
      contactSupport: 'Contacter le support',
      failureReason: 'Raison de l\'échec',
      nextSteps: 'Prochaines étapes',
      activationInfo: 'Votre service a été activé et est immédiatement disponible.',
      refundInfo: 'Le remboursement apparaîtra sur votre compte dans 3-5 jours ouvrables.'
    },
    en: {
      paymentSuccessful: 'Payment Successful',
      paymentFailed: 'Payment Failed',
      paymentPending: 'Payment Pending',
      paymentProcessing: 'Payment Processing',
      paymentCancelled: 'Payment Cancelled',
      paymentRefunded: 'Payment Refunded',
      successMessage: 'Your payment has been processed successfully. You will receive a confirmation email shortly.',
      failedMessage: 'Your payment could not be processed. Please try again.',
      pendingMessage: 'Your payment is still being processed. This may take a few minutes.',
      processingMessage: 'Your payment is being processed. Please wait.',
      cancelledMessage: 'The payment was cancelled. You can try again.',
      refundedMessage: 'Your payment has been successfully refunded.',
      paymentDetails: 'Payment Details',
      orderDetails: 'Order Details',
      paymentId: 'Payment ID',
      amount: 'Amount',
      currency: 'Currency',
      paymentMethod: 'Payment Method',
      paymentDate: 'Payment Date',
      package: 'Package',
      listing: 'Listing',
      status: 'Status',
      downloadInvoice: 'Download Invoice',
      backToDashboard: 'Back to Dashboard',
      tryAgain: 'Try Again',
      continue: 'Continue',
      contactSupport: 'Contact Support',
      failureReason: 'Failure Reason',
      nextSteps: 'Next Steps',
      activationInfo: 'Your service has been activated and is immediately available.',
      refundInfo: 'The refund will appear on your account within 3-5 business days.'
    },
    pl: {
      paymentSuccessful: 'Płatność zakończona sukcesem',
      paymentFailed: 'Płatność nieudana',
      paymentPending: 'Płatność oczekująca',
      paymentProcessing: 'Przetwarzanie płatności',
      paymentCancelled: 'Płatność anulowana',
      paymentRefunded: 'Płatność zwrócona',
      successMessage: 'Twoja płatność została pomyślnie przetworzona. Wkrótce otrzymasz e-mail z potwierdzeniem.',
      failedMessage: 'Twoja płatność nie mogła zostać przetworzona. Spróbuj ponownie.',
      pendingMessage: 'Twoja płatność jest nadal przetwarzana. To może potrwać kilka minut.',
      processingMessage: 'Twoja płatność jest przetwarzana. Proszę czekać.',
      cancelledMessage: 'Płatność została anulowana. Możesz spróbować ponownie.',
      refundedMessage: 'Twoja płatność została pomyślnie zwrócona.',
      paymentDetails: 'Szczegóły płatności',
      orderDetails: 'Szczegóły zamówienia',
      paymentId: 'ID płatności',
      amount: 'Kwota',
      currency: 'Waluta',
      paymentMethod: 'Metoda płatności',
      paymentDate: 'Data płatności',
      package: 'Pakiet',
      listing: 'Ogłoszenie',
      status: 'Status',
      downloadInvoice: 'Pobierz fakturę',
      backToDashboard: 'Powrót do panelu',
      tryAgain: 'Spróbuj ponownie',
      continue: 'Kontynuuj',
      contactSupport: 'Skontaktuj się z pomocą',
      failureReason: 'Przyczyna błędu',
      nextSteps: 'Następne kroki',
      activationInfo: 'Twoja usługa została aktywowana i jest natychmiast dostępna.',
      refundInfo: 'Zwrot pojawi się na Twoim koncie w ciągu 3-5 dni roboczych.'
    }
  }
  return translations[language as keyof typeof translations] || translations.de
}

const getStatusConfig = (status: string, t: any) => {
  switch (status) {
    case 'completed':
      return {
        icon: <CheckCircle className="h-12 w-12 text-green-500" />,
        title: t.paymentSuccessful,
        message: t.successMessage,
        variant: 'default' as const,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    case 'failed':
      return {
        icon: <XCircle className="h-12 w-12 text-red-500" />,
        title: t.paymentFailed,
        message: t.failedMessage,
        variant: 'destructive' as const,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    case 'pending':
      return {
        icon: <Clock className="h-12 w-12 text-yellow-500" />,
        title: t.paymentPending,
        message: t.pendingMessage,
        variant: 'default' as const,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      }
    case 'processing':
      return {
        icon: <Clock className="h-12 w-12 text-blue-500 animate-pulse" />,
        title: t.paymentProcessing,
        message: t.processingMessage,
        variant: 'default' as const,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    case 'cancelled':
      return {
        icon: <AlertTriangle className="h-12 w-12 text-gray-500" />,
        title: t.paymentCancelled,
        message: t.cancelledMessage,
        variant: 'secondary' as const,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      }
    case 'refunded':
      return {
        icon: <CheckCircle className="h-12 w-12 text-blue-500" />,
        title: t.paymentRefunded,
        message: t.refundedMessage,
        variant: 'default' as const,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    default:
      return {
        icon: <Clock className="h-12 w-12 text-gray-500" />,
        title: status,
        message: '',
        variant: 'default' as const,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      }
  }
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  payment,
  onDownloadInvoice,
  onContinue,
  language = 'de'
}) => {
  const t = getTranslations(language)
  const statusConfig = getStatusConfig(payment.status, t)

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Header */}
      <Card className={`${statusConfig.bgColor} ${statusConfig.borderColor}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {statusConfig.icon}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {statusConfig.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {statusConfig.message}
              </p>
            </div>
            
            {/* Status Badge */}
            <Badge variant={statusConfig.variant} className="text-sm px-3 py-1">
              {payment.status.toUpperCase()}
            </Badge>
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
                <span>{formatDate(payment.completed_at || payment.created_at)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t.status}:</span>
                <Badge variant={statusConfig.variant}>
                  {payment.status}
                </Badge>
              </div>
            </div>

            {/* Failure reason */}
            {payment.failure_reason && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">{t.failureReason}:</h4>
                  <p className="text-sm text-gray-600">{payment.failure_reason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{t.orderDetails}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Package Info */}
            {payment.packages && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.package}:</span>
                  <span className="font-medium">{payment.packages.name_de}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span>{payment.packages.duration_days} days</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Images:</span>
                  <span>{payment.packages.max_images}</span>
                </div>
              </div>
            )}

            {/* Listing Info */}
            {payment.listings && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.listing}:</span>
                    <span className="font-medium">{payment.listings.title}</span>
                  </div>
                </div>
              </>
            )}

            {/* Commission Info */}
            {payment.payment_type === 'commission' && payment.commission_amount > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Commission Rate:</span>
                    <span>{(payment.commission_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Commission:</span>
                    <span>{formatSwissAmount(payment.max_commission, payment.currency, language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      {payment.status === 'completed' && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">{t.nextSteps}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">{t.activationInfo}</p>
            <div className="flex flex-wrap gap-3">
              {onDownloadInvoice && (
                <Button onClick={onDownloadInvoice} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t.downloadInvoice}
                </Button>
              )}
              {onContinue && (
                <Button onClick={onContinue} size="sm">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t.continue}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refund Info */}
      {payment.status === 'refunded' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Refund Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">{t.refundInfo}</p>
            {payment.refunded_at && (
              <p className="text-sm text-blue-600 mt-2">
                Refunded on: {formatDate(payment.refunded_at)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {payment.status === 'failed' && (
          <Button onClick={() => window.location.reload()} variant="outline">
            {t.tryAgain}
          </Button>
        )}
        
        <Button 
          onClick={() => window.location.href = '/dashboard'}
          variant={payment.status === 'completed' ? 'default' : 'outline'}
        >
          {t.backToDashboard}
        </Button>
        
        {(payment.status === 'failed' || payment.status === 'cancelled') && (
          <Button onClick={() => window.location.href = '/contact'} variant="outline">
            {t.contactSupport}
          </Button>
        )}
      </div>
    </div>
  )
}

export default PaymentStatus