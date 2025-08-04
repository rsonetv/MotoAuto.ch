import { NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase-api"
import { 
  invoiceGenerationSchema,
  type InvoiceGenerationInput 
} from "@/lib/schemas/payments-api-schema"
import { 
  withAuth, 
  validateRequestBody,
  createErrorResponse,
  createSuccessResponse,
  type AuthContext
} from "@/lib/auth-middleware"
import { formatSwissAmount, calculateSwissVAT } from "@/lib/stripe"
import type { Database } from "@/lib/database.types"

type Payment = Database['public']['Tables']['payments']['Row']

interface InvoiceParams {
  params: {
    id: string
  }
}

/**
 * GET /api/payments/invoice/[id]
 * Generate and retrieve invoice for a payment
 */
export async function GET(request: NextRequest, { params }: InvoiceParams) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const paymentId = params.id
      const { searchParams } = new URL(req.url)
      
      // Parse query parameters for invoice options
      const language = searchParams.get('language') || 'de'
      const format = searchParams.get('format') || 'pdf'
      const includeVat = searchParams.get('include_vat') !== 'false'

      const supabase = await createServerComponentClient(req)

      // Fetch payment with related data
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          *,
          listings:listing_id (
            id,
            title,
            brand,
            model,
            year,
            price,
            currency,
            location,
            postal_code,
            canton
          ),
          packages:package_id (
            id,
            name_en,
            name_de,
            name_fr,
            name_pl,
            price_chf,
            duration_days,
            features
          ),
          profiles:user_id (
            full_name,
            email,
            phone,
            location,
            postal_code,
            canton,
            country,
            is_dealer,
            dealer_name,
            dealer_vat_number,
            company_address
          )
        `)
        .eq('id', paymentId)
        .eq('user_id', user.id)
        .single()

      if (paymentError || !payment) {
        return createErrorResponse('Payment not found or access denied', 404)
      }

      // Only generate invoices for completed payments
      if (payment.status !== 'completed') {
        return createErrorResponse('Invoice can only be generated for completed payments', 400)
      }

      // Generate invoice number if not exists
      const invoiceNumber = await generateInvoiceNumber(supabase, payment)

      // Generate invoice data
      const invoiceData = await generateInvoiceData(payment, {
        language: language as 'de' | 'fr' | 'en' | 'pl',
        format: format as 'pdf' | 'html',
        includeVat,
        invoiceNumber
      })

      // Store invoice generation record
      await storeInvoiceRecord(supabase, payment.id, invoiceNumber, language, format)

      if (format === 'pdf') {
        // Return PDF as download
        return new NextResponse(invoiceData.pdfBuffer as any, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${invoiceNumber}.pdf"`,
            'Content-Length': (invoiceData.pdfBuffer as any).length.toString()
          }
        })
      } else {
        // Return HTML invoice data
        return createSuccessResponse({
          invoice_id: invoiceData.invoiceId,
          payment_id: payment.id,
          invoice_number: invoiceNumber,
          invoice_html: invoiceData.html,
          language,
          format,
          generated_at: new Date().toISOString(),
          download_url: `/api/payments/invoice/${paymentId}?format=pdf&language=${language}`
        }, 200)
      }

    } catch (error) {
      console.error('Unexpected error in GET /api/payments/invoice/[id]:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * POST /api/payments/invoice/[id]
 * Generate invoice with custom parameters
 */
export async function POST(request: NextRequest, { params }: InvoiceParams) {
  return withAuth(request, async (req, { user, profile }: AuthContext) => {
    try {
      const paymentId = params.id
      const body = await req.json()
      
      // Validate request body
      const validation = validateRequestBody(body, invoiceGenerationSchema)
      if (!validation.success) {
        return createErrorResponse(`Invalid invoice data: ${validation.error}`, 400)
      }

      const invoiceData: InvoiceGenerationInput = validation.data
      const supabase = await createServerComponentClient(req)

      // Fetch payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          *,
          listings:listing_id (
            id,
            title,
            brand,
            model,
            year,
            price,
            currency
          ),
          packages:package_id (
            id,
            name_en,
            name_de,
            name_fr,
            name_pl,
            price_chf,
            duration_days
          ),
          profiles:user_id (
            full_name,
            email,
            phone,
            location,
            postal_code,
            canton,
            country,
            is_dealer,
            dealer_name,
            dealer_vat_number,
            company_address
          )
        `)
        .eq('id', paymentId)
        .eq('user_id', user.id)
        .single()

      if (paymentError || !payment) {
        return createErrorResponse('Payment not found or access denied', 404)
      }

      if (payment.status !== 'completed') {
        return createErrorResponse('Invoice can only be generated for completed payments', 400)
      }

      // Generate custom invoice
      const invoiceNumber = invoiceData.invoice_number || await generateInvoiceNumber(supabase, payment)
      const generatedInvoice = await generateInvoiceData(payment, {
        language: invoiceData.language,
        format: invoiceData.format,
        includeVat: invoiceData.include_vat,
        vatRate: invoiceData.vat_rate,
        invoiceNumber,
        dueDate: invoiceData.due_date,
        companyDetails: invoiceData.company_details
      })

      // Store invoice record
      await storeInvoiceRecord(supabase, payment.id, invoiceNumber, invoiceData.language, invoiceData.format)

      return createSuccessResponse({
        invoice_id: generatedInvoice.invoiceId,
        payment_id: payment.id,
        invoice_number: invoiceNumber,
        invoice_data: invoiceData.format === 'pdf' ? 
          Buffer.from(generatedInvoice.pdfBuffer as any).toString('base64') :
          generatedInvoice.html,
        language: invoiceData.language,
        format: invoiceData.format,
        generated_at: new Date().toISOString()
      }, 201)

    } catch (error) {
      console.error('Unexpected error in POST /api/payments/invoice/[id]:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
}

/**
 * Generate unique invoice number
 */
async function generateInvoiceNumber(supabase: any, payment: Payment): Promise<string> {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  
  // Get the next sequential number for this month
  const { data: lastInvoice } = await supabase
    .from('payments')
    .select('metadata')
    .not('metadata->invoice_number', 'is', null)
    .like('metadata->invoice_number', `${year}${month}%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let sequentialNumber = 1
  if (lastInvoice?.metadata?.invoice_number) {
    const lastNumber = parseInt(lastInvoice.metadata.invoice_number.slice(-4))
    sequentialNumber = lastNumber + 1
  }

  return `${year}${month}${String(sequentialNumber).padStart(4, '0')}`
}

/**
 * Generate invoice data (HTML/PDF)
 */
async function generateInvoiceData(
  payment: Payment & { listings?: any; packages?: any; profiles?: any },
  options: {
    language: 'de' | 'fr' | 'en' | 'pl'
    format: 'pdf' | 'html'
    includeVat: boolean
    vatRate?: number
    invoiceNumber: string
    dueDate?: string
    companyDetails?: any
  }
) {
  const { language, format, includeVat, vatRate = 0.077, invoiceNumber, dueDate, companyDetails } = options

  // Calculate VAT if applicable
  const vatCalculation = includeVat ? calculateSwissVAT(payment.amount, vatRate) : null

  // Get translations
  const translations = getInvoiceTranslations(language)

  // Company details
  const company = companyDetails || {
    name: "MotoAuto.ch",
    address: "Musterstrasse 1, 8000 Zürich, Switzerland",
    vat_number: "CHE-123.456.789 MWST",
    contact: "info@motoauto.ch"
  }

  // Customer details
  const customer = payment.profiles || {}
  const customerAddress = customer.is_dealer && customer.company_address ? 
    customer.company_address : 
    `${customer.location || ''}, ${customer.postal_code || ''} ${customer.canton || ''}, ${customer.country || 'CH'}`

  // Invoice data
  const invoiceData = {
    invoiceNumber,
    date: new Date().toLocaleDateString(getLocaleForLanguage(language)),
    dueDate: dueDate ? new Date(dueDate).toLocaleDateString(getLocaleForLanguage(language)) : 
             new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(getLocaleForLanguage(language)),
    company,
    customer: {
      name: customer.is_dealer ? customer.dealer_name : customer.full_name,
      email: customer.email,
      address: customerAddress,
      vat_number: customer.dealer_vat_number
    },
    items: [{
      description: getPaymentDescription(payment, language),
      quantity: 1,
      unit_price: vatCalculation ? vatCalculation.netAmount : payment.amount,
      total: vatCalculation ? vatCalculation.netAmount : payment.amount
    }],
    subtotal: vatCalculation ? vatCalculation.netAmount : payment.amount,
    vat: vatCalculation ? {
      rate: vatRate * 100,
      amount: vatCalculation.vatAmount
    } : null,
    total: payment.amount,
    currency: payment.currency,
    payment_method: payment.payment_method,
    payment_date: payment.completed_at ? new Date(payment.completed_at).toLocaleDateString(getLocaleForLanguage(language)) : null,
    translations
  }

  // Generate HTML
  const html = generateInvoiceHTML(invoiceData)

  if (format === 'html') {
    return {
      invoiceId: `inv_${invoiceNumber}`,
      html,
      pdfBuffer: null
    }
  }

  // Generate PDF (you would use a library like puppeteer or jsPDF here)
  const pdfBuffer = await generateInvoicePDF(html)

  return {
    invoiceId: `inv_${invoiceNumber}`,
    html,
    pdfBuffer
  }
}

/**
 * Generate invoice HTML
 */
function generateInvoiceHTML(data: any): string {
  return `
<!DOCTYPE html>
<html lang="${data.translations.locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.translations.invoice} ${data.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company-info { text-align: left; }
        .invoice-info { text-align: right; }
        .customer-info { margin-bottom: 30px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .items-table th { background-color: #f5f5f5; }
        .totals { text-align: right; margin-top: 20px; }
        .total-row { font-weight: bold; font-size: 1.2em; }
        .footer { margin-top: 40px; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h2>${data.company.name}</h2>
            <p>${data.company.address}</p>
            <p>${data.translations.vat_number}: ${data.company.vat_number}</p>
            <p>${data.translations.contact}: ${data.company.contact}</p>
        </div>
        <div class="invoice-info">
            <h1>${data.translations.invoice}</h1>
            <p><strong>${data.translations.invoice_number}:</strong> ${data.invoiceNumber}</p>
            <p><strong>${data.translations.date}:</strong> ${data.date}</p>
            <p><strong>${data.translations.due_date}:</strong> ${data.dueDate}</p>
        </div>
    </div>

    <div class="customer-info">
        <h3>${data.translations.bill_to}:</h3>
        <p><strong>${data.customer.name}</strong></p>
        <p>${data.customer.address}</p>
        <p>${data.translations.email}: ${data.customer.email}</p>
        ${data.customer.vat_number ? `<p>${data.translations.vat_number}: ${data.customer.vat_number}</p>` : ''}
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>${data.translations.description}</th>
                <th>${data.translations.quantity}</th>
                <th>${data.translations.unit_price}</th>
                <th>${data.translations.total}</th>
            </tr>
        </thead>
        <tbody>
            ${data.items.map((item: any) => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${formatSwissAmount(item.unit_price, data.currency)}</td>
                    <td>${formatSwissAmount(item.total, data.currency)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <p><strong>${data.translations.subtotal}:</strong> ${formatSwissAmount(data.subtotal, data.currency)}</p>
        ${data.vat ? `
            <p><strong>${data.translations.vat} (${data.vat.rate}%):</strong> ${formatSwissAmount(data.vat.amount, data.currency)}</p>
        ` : ''}
        <p class="total-row"><strong>${data.translations.total}:</strong> ${formatSwissAmount(data.total, data.currency)}</p>
        ${data.payment_date ? `
            <p><strong>${data.translations.payment_date}:</strong> ${data.payment_date}</p>
            <p><strong>${data.translations.payment_method}:</strong> ${data.payment_method}</p>
        ` : ''}
    </div>

    <div class="footer">
        <p>${data.translations.thank_you}</p>
        <p>${data.translations.footer_text}</p>
    </div>
</body>
</html>
  `
}

/**
 * Generate PDF from HTML (placeholder - implement with puppeteer or similar)
 */
async function generateInvoicePDF(html: string): Promise<Buffer> {
  // This is a placeholder - in a real implementation, you would use:
  // - Puppeteer to convert HTML to PDF
  // - jsPDF for client-side PDF generation
  // - A PDF service API
  
  // For now, return the HTML as a buffer
  return Buffer.from(html, 'utf-8')
}

/**
 * Store invoice generation record
 */
async function storeInvoiceRecord(
  supabase: any,
  paymentId: string,
  invoiceNumber: string,
  language: string,
  format: string
) {
  try {
    await supabase
      .from('payments')
      .update({
        metadata: supabase.raw(`
          metadata || jsonb_build_object(
            'invoice_number', '${invoiceNumber}',
            'invoice_generated_at', '${new Date().toISOString()}',
            'invoice_language', '${language}',
            'invoice_format', '${format}'
          )
        `)
      })
      .eq('id', paymentId)
  } catch (error) {
    console.error('Error storing invoice record:', error)
  }
}

/**
 * Get payment description based on type and language
 */
function getPaymentDescription(payment: Payment & { listings?: any; packages?: any }, language: string): string {
  const translations = getInvoiceTranslations(language)
  
  switch (payment.payment_type) {
    case 'listing_fee':
      return `${translations.listing_fee} - ${payment.listings?.title || 'Vehicle Listing'}`
    case 'premium_package':
      return `${translations.premium_package} - ${payment.packages?.name_en || 'Premium Package'}`
    case 'featured_listing':
      return `${translations.featured_listing} - ${payment.listings?.title || 'Featured Listing'}`
    case 'commission':
      return `${translations.commission} - ${payment.listings?.title || 'Auction Sale'}`
    default:
      return payment.description || translations.payment_service
  }
}

/**
 * Get translations for invoice
 */
function getInvoiceTranslations(language: string) {
  const translations: Record<string, any> = {
    de: {
      locale: 'de-CH',
      invoice: 'Rechnung',
      invoice_number: 'Rechnungsnummer',
      date: 'Datum',
      due_date: 'Fälligkeitsdatum',
      bill_to: 'Rechnung an',
      description: 'Beschreibung',
      quantity: 'Menge',
      unit_price: 'Einzelpreis',
      total: 'Gesamt',
      subtotal: 'Zwischensumme',
      vat: 'MwSt',
      vat_number: 'MwSt-Nummer',
      email: 'E-Mail',
      contact: 'Kontakt',
      payment_date: 'Zahlungsdatum',
      payment_method: 'Zahlungsmethode',
      thank_you: 'Vielen Dank für Ihr Vertrauen!',
      footer_text: 'Bei Fragen kontaktieren Sie uns unter info@motoauto.ch',
      listing_fee: 'Inseratsgebühr',
      premium_package: 'Premium-Paket',
      featured_listing: 'Hervorgehobenes Inserat',
      commission: 'Verkaufsprovision',
      payment_service: 'Zahlungsdienstleistung'
    },
    fr: {
      locale: 'fr-CH',
      invoice: 'Facture',
      invoice_number: 'Numéro de facture',
      date: 'Date',
      due_date: 'Date d\'échéance',
      bill_to: 'Facturer à',
      description: 'Description',
      quantity: 'Quantité',
      unit_price: 'Prix unitaire',
      total: 'Total',
      subtotal: 'Sous-total',
      vat: 'TVA',
      vat_number: 'Numéro TVA',
      email: 'E-mail',
      contact: 'Contact',
      payment_date: 'Date de paiement',
      payment_method: 'Méthode de paiement',
      thank_you: 'Merci pour votre confiance!',
      footer_text: 'Pour toute question, contactez-nous à info@motoauto.ch',
      listing_fee: 'Frais d\'annonce',
      premium_package: 'Package Premium',
      featured_listing: 'Annonce en vedette',
      commission: 'Commission de vente',
      payment_service: 'Service de paiement'
    },
    en: {
      locale: 'en-US',
      invoice: 'Invoice',
      invoice_number: 'Invoice Number',
      date: 'Date',
      due_date: 'Due Date',
      bill_to: 'Bill To',
      description: 'Description',
      quantity: 'Quantity',
      unit_price: 'Unit Price',
      total: 'Total',
      subtotal: 'Subtotal',
      vat: 'VAT',
      vat_number: 'VAT Number',
      email: 'Email',
      contact: 'Contact',
      payment_date: 'Payment Date',
      payment_method: 'Payment Method',
      thank_you: 'Thank you for your business!',
      footer_text: 'For questions, contact us at info@motoauto.ch',
      listing_fee: 'Listing Fee',
      premium_package: 'Premium Package',
      featured_listing: 'Featured Listing',
      commission: 'Sales Commission',
      payment_service: 'Payment Service'
    },
    pl: {
      locale: 'pl-PL',
      invoice: 'Faktura',
      invoice_number: 'Numer faktury',
      date: 'Data',
      due_date: 'Termin płatności',
      bill_to: 'Faktura dla',
      description: 'Opis',
      quantity: 'Ilość',
      unit_price: 'Cena jednostkowa',
      total: 'Razem',
      subtotal: 'Suma częściowa',
      vat: 'VAT',
      vat_number: 'Numer VAT',
      email: 'E-mail',
      contact: 'Kontakt',
      payment_date: 'Data płatności',
      payment_method: 'Metoda płatności',
      thank_you: 'Dziękujemy za zaufanie!',
      footer_text: 'W przypadku pytań skontaktuj się z nami: info@motoauto.ch',
      listing_fee: 'Opłata za ogłoszenie',
      premium_package: 'Pakiet Premium',
      featured_listing: 'Wyróżnione ogłoszenie',
      commission: 'Prowizja od sprzedaży',
      payment_service: 'Usługa płatnicza'
    }
  }

  return translations[language] || translations.en
}

/**
 * Get locale for language
 */
function getLocaleForLanguage(language: string): string {
  const locales: Record<string, string> = {
    de: 'de-CH',
    fr: 'fr-CH',
    en: 'en-US',
    pl: 'pl-PL'
  }
  return locales[language] || 'en-US'
}