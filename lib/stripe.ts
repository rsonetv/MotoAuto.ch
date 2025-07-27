import Stripe from 'stripe'

// Lazy initialization of Stripe client
let stripeInstance: Stripe | null = null

// Get or create Stripe instance
function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    })
  }
  
  return stripeInstance
}

// Swiss payment methods configuration
export const SWISS_PAYMENT_METHODS = [
  'card',
  'twint',
  'postfinance',
  'sepa_debit',
  'bancontact',
  'eps',
  'giropay',
  'ideal',
  'p24',
  'sofort'
] as const

// Swiss currency configuration
export const SWISS_CURRENCIES = ['chf', 'eur', 'usd'] as const

// Commission calculation
export function calculateCommission(
  amount: number, 
  rate: number = 0.05, 
  maxCommission: number = 500
): number {
  return Math.min(amount * rate, maxCommission)
}

// Convert amount to Stripe's smallest currency unit (cents/rappen)
export function toStripeAmount(amount: number, currency: string): number {
  // CHF, EUR, USD use cents/rappen (multiply by 100)
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount)
  }
  
  return Math.round(amount * 100)
}

// Convert from Stripe's smallest currency unit to decimal
export function fromStripeAmount(amount: number, currency: string): number {
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount
  }
  
  return amount / 100
}

// Create payment intent with Swiss market configuration
export async function createPaymentIntent(params: {
  amount: number
  currency: string
  paymentMethods?: string[]
  metadata?: Record<string, string>
  description?: string
  customerEmail?: string
  automaticPaymentMethods?: boolean
  captureMethod?: 'automatic' | 'manual'
}): Promise<Stripe.PaymentIntent> {
  const {
    amount,
    currency,
    paymentMethods = SWISS_PAYMENT_METHODS,
    metadata = {},
    description,
    customerEmail,
    automaticPaymentMethods = true,
    captureMethod = 'automatic'
  } = params

  const stripeAmount = toStripeAmount(amount, currency)

  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: stripeAmount,
    currency: currency.toLowerCase(),
    metadata: {
      ...metadata,
      platform: 'MotoAuto.ch',
      created_at: new Date().toISOString()
    },
    capture_method: captureMethod,
    ...(description && { description }),
    ...(customerEmail && { receipt_email: customerEmail })
  }

  // Configure payment methods
  if (automaticPaymentMethods) {
    paymentIntentParams.automatic_payment_methods = {
      enabled: true,
      allow_redirects: 'always'
    }
  } else {
    paymentIntentParams.payment_method_types = paymentMethods as any[]
  }

  return await getStripeInstance().paymentIntents.create(paymentIntentParams)
}

// Confirm payment intent
export async function confirmPaymentIntent(
  paymentIntentId: string,
  params?: {
    paymentMethodId?: string
    returnUrl?: string
    receiptEmail?: string
  }
): Promise<Stripe.PaymentIntent> {
  const confirmParams: Stripe.PaymentIntentConfirmParams = {}

  if (params?.paymentMethodId) {
    confirmParams.payment_method = params.paymentMethodId
  }

  if (params?.returnUrl) {
    confirmParams.return_url = params.returnUrl
  }

  if (params?.receiptEmail) {
    confirmParams.receipt_email = params.receiptEmail
  }

  return await getStripeInstance().paymentIntents.confirm(paymentIntentId, confirmParams)
}

// Create refund
export async function createRefund(params: {
  paymentIntentId: string
  amount?: number
  currency?: string
  reason?: Stripe.RefundCreateParams.Reason
  metadata?: Record<string, string>
}): Promise<Stripe.Refund> {
  const {
    paymentIntentId,
    amount,
    currency,
    reason = 'requested_by_customer',
    metadata = {}
  } = params

  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason,
    metadata: {
      ...metadata,
      refunded_at: new Date().toISOString(),
      platform: 'MotoAuto.ch'
    }
  }

  if (amount && currency) {
    refundParams.amount = toStripeAmount(amount, currency)
  }

  return await getStripeInstance().refunds.create(refundParams)
}

// Retrieve payment intent
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await getStripeInstance().paymentIntents.retrieve(paymentIntentId)
}

// List payment intents for a customer
export async function listPaymentIntents(params: {
  customer?: string
  limit?: number
  startingAfter?: string
  endingBefore?: string
}): Promise<Stripe.ApiList<Stripe.PaymentIntent>> {
  return await getStripeInstance().paymentIntents.list(params)
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return getStripeInstance().webhooks.constructEvent(payload, signature, secret)
}

// Create customer for recurring payments
export async function createCustomer(params: {
  email: string
  name?: string
  phone?: string
  address?: Stripe.AddressParam
  metadata?: Record<string, string>
}): Promise<Stripe.Customer> {
  return await getStripeInstance().customers.create({
    ...params,
    metadata: {
      ...params.metadata,
      platform: 'MotoAuto.ch',
      created_at: new Date().toISOString()
    }
  })
}

// Create setup intent for future payments
export async function createSetupIntent(params: {
  customerId: string
  paymentMethodTypes?: string[]
  usage?: 'on_session' | 'off_session'
}): Promise<Stripe.SetupIntent> {
  const {
    customerId,
    paymentMethodTypes = ['card'],
    usage = 'off_session'
  } = params

  return await getStripeInstance().setupIntents.create({
    customer: customerId,
    payment_method_types: paymentMethodTypes as any[],
    usage,
    metadata: {
      platform: 'MotoAuto.ch',
      created_at: new Date().toISOString()
    }
  })
}

// Generate invoice for Swiss compliance
export async function createInvoice(params: {
  customerId: string
  items: Array<{
    description: string
    amount: number
    currency: string
    quantity?: number
  }>
  dueDate?: number
  metadata?: Record<string, string>
}): Promise<Stripe.Invoice> {
  const { customerId, items, dueDate, metadata = {} } = params

  // Create invoice items
  for (const item of items) {
    await getStripeInstance().invoiceItems.create({
      customer: customerId,
      amount: toStripeAmount(item.amount, item.currency),
      currency: item.currency.toLowerCase(),
      description: item.description,
      quantity: item.quantity || 1,
      metadata: {
        platform: 'MotoAuto.ch'
      }
    })
  }

  // Create invoice
  const invoice = await getStripeInstance().invoices.create({
    customer: customerId,
    auto_advance: false, // Manual finalization for Swiss compliance
    collection_method: 'send_invoice',
    days_until_due: dueDate ? Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24)) : 30,
    metadata: {
      ...metadata,
      platform: 'MotoAuto.ch',
      created_at: new Date().toISOString()
    }
  })

  // Finalize invoice
  return await getStripeInstance().invoices.finalizeInvoice(invoice.id!)
}

// Handle Swiss VAT calculation
export function calculateSwissVAT(amount: number, vatRate: number = 0.077): {
  netAmount: number
  vatAmount: number
  grossAmount: number
} {
  const netAmount = amount / (1 + vatRate)
  const vatAmount = amount - netAmount
  
  return {
    netAmount: Math.round(netAmount * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    grossAmount: amount
  }
}

// Format amount for Swiss display
export function formatSwissAmount(
  amount: number, 
  currency: string = 'CHF',
  locale: string = 'de-CH'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Export a getter function instead of the instance directly
export function getStripe(): Stripe {
  return getStripeInstance()
}

// For backward compatibility, export default as a getter
export default {
  get stripe() {
    return getStripeInstance()
  }
}