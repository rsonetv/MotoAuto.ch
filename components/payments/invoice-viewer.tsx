'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  FileText, 
  Loader2, 
  AlertCircle, 
  Eye, 
  Mail,
  Calendar,
  CreditCard,
  Building,
  User
} from 'lucide-react'
import { formatSwissAmount } from '@/lib/stripe'
import type { Payment, Package as PackageType } from '@/lib/database.types'

interface InvoiceViewerProps {
  paymentId: string
  payment?: Payment & {
    packages?: PackageType
    listings?: {
      id: string
      title: string
    }
  }
  language?: 'de' | 'fr' | 'en' | 'pl'
  onClose?: () => void
}

interface InvoiceData {
  invoice_id: string
  payment_id: string
  invoice_number: string
  invoice_html?: string
  language: string
  format: string
  generated_at: string
  download_url?: string
}

const getTranslations = (language: string = 'de') => {
  const translations = {
    de: {
      title: 'Rechnung anzeigen',
      invoiceNumber: 'Rechnungsnummer',
      paymentId: 'Zahlungs-ID',
      generatedAt: 'Erstellt am',
      downloadPdf: 'PDF herunterladen',
      viewHtml: 'HTML anzeigen',
      sendByEmail: 'Per E-Mail senden',
      loading: 'Rechnung wird geladen...',
      generating: 'Rechnung wird erstellt...',
      error: 'Fehler beim Laden der Rechnung',
      notAvailable: 'Rechnung nicht verfügbar',
      onlyForCompleted: 'Rechnungen sind nur für abgeschlossene Zahlungen verfügbar',
      close: 'Schließen',
      retry: 'Erneut versuchen',
      invoice: 'Rechnung',
      amount: 'Betrag',
      date: 'Datum',
      status: 'Status',
      paymentMethod: 'Zahlungsmethode',
      billingAddress: 'Rechnungsadresse',
      company: 'Unternehmen',
      vatNumber: 'MwSt-Nummer',
      downloadSuccess: 'Rechnung erfolgreich heruntergeladen',
      emailSent: 'Rechnung per E-Mail gesendet'
    },
    fr: {
      title: 'Voir la facture',
      invoiceNumber: 'Numéro de facture',
      paymentId: 'ID de paiement',
      generatedAt: 'Généré le',
      downloadPdf: 'Télécharger PDF',
      viewHtml: 'Voir HTML',
      sendByEmail: 'Envoyer par e-mail',
      loading: 'Chargement de la facture...',
      generating: 'Génération de la facture...',
      error: 'Erreur lors du chargement de la facture',
      notAvailable: 'Facture non disponible',
      onlyForCompleted: 'Les factures ne sont disponibles que pour les paiements terminés',
      close: 'Fermer',
      retry: 'Réessayer',
      invoice: 'Facture',
      amount: 'Montant',
      date: 'Date',
      status: 'Statut',
      paymentMethod: 'Méthode de paiement',
      billingAddress: 'Adresse de facturation',
      company: 'Entreprise',
      vatNumber: 'Numéro TVA',
      downloadSuccess: 'Facture téléchargée avec succès',
      emailSent: 'Facture envoyée par e-mail'
    },
    en: {
      title: 'View Invoice',
      invoiceNumber: 'Invoice Number',
      paymentId: 'Payment ID',
      generatedAt: 'Generated at',
      downloadPdf: 'Download PDF',
      viewHtml: 'View HTML',
      sendByEmail: 'Send by Email',
      loading: 'Loading invoice...',
      generating: 'Generating invoice...',
      error: 'Error loading invoice',
      notAvailable: 'Invoice not available',
      onlyForCompleted: 'Invoices are only available for completed payments',
      close: 'Close',
      retry: 'Retry',
      invoice: 'Invoice',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      paymentMethod: 'Payment Method',
      billingAddress: 'Billing Address',
      company: 'Company',
      vatNumber: 'VAT Number',
      downloadSuccess: 'Invoice downloaded successfully',
      emailSent: 'Invoice sent by email'
    },
    pl: {
      title: 'Zobacz fakturę',
      invoiceNumber: 'Numer faktury',
      paymentId: 'ID płatności',
      generatedAt: 'Wygenerowano',
      downloadPdf: 'Pobierz PDF',
      viewHtml: 'Zobacz HTML',
      sendByEmail: 'Wyślij e-mailem',
      loading: 'Ładowanie faktury...',
      generating: 'Generowanie faktury...',
      error: 'Błąd podczas ładowania faktury',
      notAvailable: 'Faktura niedostępna',
      onlyForCompleted: 'Faktury są dostępne tylko dla zakończonych płatności',
      close: 'Zamknij',
      retry: 'Spróbuj ponownie',
      invoice: 'Faktura',
      amount: 'Kwota',
      date: 'Data',
      status: 'Status',
      paymentMethod: 'Metoda płatności',
      billingAddress: 'Adres rozliczeniowy',
      company: 'Firma',
      vatNumber: 'Numer VAT',
      downloadSuccess: 'Faktura pobrana pomyślnie',
      emailSent: 'Faktura wysłana e-mailem'
    }
  }
  return translations[language as keyof typeof translations] || translations.de
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({
  paymentId,
  payment,
  language = 'de',
  onClose
}) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHtml, setShowHtml] = useState(false)

  const t = getTranslations(language)

  // Fetch or generate invoice
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!payment || payment.status !== 'completed') {
        setError(t.onlyForCompleted)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // First try to get existing invoice
        const response = await fetch(`/api/payments/invoice/${paymentId}?format=html&language=${language}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setInvoiceData(data.data)
          } else {
            throw new Error(data.error || 'Failed to load invoice')
          }
        } else if (response.status === 404) {
          // Invoice doesn't exist, generate it
          await generateInvoice()
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (err) {
        console.error('Error fetching invoice:', err)
        setError(err instanceof Error ? err.message : 'Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [paymentId, payment, language])

  // Generate new invoice
  const generateInvoice = async () => {
    try {
      setGenerating(true)
      setError(null)

      const response = await fetch(`/api/payments/invoice/${paymentId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language,
          format: 'html',
          include_vat: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setInvoiceData(data.data)
      } else {
        throw new Error(data.error || 'Failed to generate invoice')
      }
    } catch (err) {
      console.error('Error generating invoice:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate invoice')
    } finally {
      setGenerating(false)
    }
  }

  // Download PDF invoice
  const downloadPdf = async () => {
    try {
      const response = await fetch(`/api/payments/invoice/${paymentId}?format=pdf&language=${language}`)
      
      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceData?.invoice_number || paymentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Show success message (you could use a toast here)
      console.log(t.downloadSuccess)
    } catch (err) {
      console.error('Error downloading PDF:', err)
      setError(err instanceof Error ? err.message : 'Failed to download PDF')
    }
  }

  // Send invoice by email
  const sendByEmail = async () => {
    try {
      const response = await fetch(`/api/payments/invoice/${paymentId}/email`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language,
          format: 'pdf'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      const data = await response.json()
      if (data.success) {
        console.log(t.emailSent)
      } else {
        throw new Error(data.error || 'Failed to send email')
      }
    } catch (err) {
      console.error('Error sending email:', err)
      setError(err instanceof Error ? err.message : 'Failed to send email')
    }
  }

  const formatDate = (dateString: string) => {
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

  if (loading || generating) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">
              {generating ? t.generating : t.loading}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                >
                  {t.retry}
                </Button>
                {onClose && (
                  <Button variant="outline" size="sm" onClick={onClose}>
                    {t.close}
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!invoiceData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="py-12 text-center">
          <div className="text-gray-500">{t.notAvailable}</div>
          {onClose && (
            <Button variant="outline" className="mt-4" onClick={onClose}>
              {t.close}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{t.title}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {invoiceData.format.toUpperCase()}
              </Badge>
              {payment && (
                <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                  {payment.status}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <span className="text-gray-600">{t.invoiceNumber}:</span>
              <div className="font-mono text-sm">{invoiceData.invoice_number}</div>
            </div>
            <div>
              <span className="text-gray-600">{t.paymentId}:</span>
              <div className="font-mono text-sm">{invoiceData.payment_id}</div>
            </div>
            <div>
              <span className="text-gray-600">{t.generatedAt}:</span>
              <div className="text-sm">{formatDate(invoiceData.generated_at)}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={downloadPdf} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>{t.downloadPdf}</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowHtml(!showHtml)}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{showHtml ? t.close : t.viewHtml}</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={sendByEmail}
              className="flex items-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>{t.sendByEmail}</span>
            </Button>

            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                {t.close}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      {payment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-600">{t.amount}:</span>
                <div className="font-medium">
                  {formatSwissAmount(payment.amount, payment.currency, language === 'fr' ? 'fr-CH' : language === 'de' ? 'de-CH' : 'en-US')}
                </div>
              </div>
              <div>
                <span className="text-gray-600">{t.date}:</span>
                <div className="text-sm">
                  {formatDate(payment.completed_at || payment.created_at)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">{t.paymentMethod}:</span>
                <div className="text-sm capitalize">
                  {payment.payment_method?.replace('_', ' ') || '-'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">{t.status}:</span>
                <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                  {payment.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* HTML Invoice Preview */}
      {showHtml && invoiceData.invoice_html && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="border rounded-lg p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: invoiceData.invoice_html }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default InvoiceViewer