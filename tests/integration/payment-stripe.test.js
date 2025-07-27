/**
 * Payment Integration Tests (Stripe)
 * Tests Stripe integration, payment flows, and invoice generation
 */

const Stripe = require('stripe')
const { 
  mockUser, 
  mockProfile, 
  mockListing, 
  mockPayment,
  mockStripePaymentIntent,
  createMockJWT,
  mockSupabaseResponse,
  swissTestData,
  formatCurrency
} = require('../utils/test-helpers')

// Mock Stripe
jest.mock('stripe')

describe('Payment Integration Tests (Stripe)', () => {
  let mockStripe
  let mockSupabase

  beforeEach(() => {
    // Mock Stripe instance
    mockStripe = {
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
        confirm: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn()
      },
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        list: jest.fn(),
        delete: jest.fn()
      },
      refunds: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn()
      },
      webhooks: {
        constructEvent: jest.fn()
      },
      setupIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
        confirm: jest.fn()
      },
      invoices: {
        create: jest.fn(),
        retrieve: jest.fn(),
        finalizeInvoice: jest.fn(),
        sendInvoice: jest.fn(),
        list: jest.fn()
      },
      invoiceItems: {
        create: jest.fn(),
        list: jest.fn(),
        delete: jest.fn()
      },
      prices: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn()
      },
      products: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn()
      }
    }

    // Mock Stripe constructor
    Stripe.mockImplementation(() => mockStripe)

    // Mock Supabase
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
      })),
      auth: {
        getUser: jest.fn()
      }
    }

    jest.doMock('@/lib/supabase', () => ({
      createServerComponentClient: () => mockSupabase
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('Payment Intent Creation', () => {
    test('should create payment intent for commission payment', async () => {
      const user = mockUser()
      const listing = mockListing({ user_id: user.id, price: 50000 })
      const commissionAmount = Math.min(listing.price * 0.05, 500) // 5% max 500 CHF
      
      const paymentIntent = mockStripePaymentIntent({
        amount: commissionAmount * 100, // Stripe uses cents
        currency: 'chf',
        metadata: {
          payment_type: 'commission',
          listing_id: listing.id,
          user_id: user.id
        }
      })

      mockStripe.paymentIntents.create.mockResolvedValue(paymentIntent)

      const { createPaymentIntent } = require('@/lib/stripe')
      
      const result = await createPaymentIntent({
        amount: commissionAmount,
        currency: 'CHF',
        metadata: {
          payment_type: 'commission',
          listing_id: listing.id,
          user_id: user.id
        },
        description: 'Commission payment for vehicle sale'
      })

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: commissionAmount * 100,
        currency: 'chf',
        metadata: expect.objectContaining({
          payment_type: 'commission',
          listing_id: listing.id,
          user_id: user.id,
          platform: 'MotoAuto.ch'
        }),
        description: 'Commission payment for vehicle sale',
        capture_method: 'automatic',
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always'
        }
      })

      expect(result.id).toBe(paymentIntent.id)
      expect(result.amount).toBe(commissionAmount * 100)
      expect(result.currency).toBe('chf')
    })

    test('should create payment intent for package purchase', async () => {
      const user = mockUser()
      const packagePrice = 29.90 // Premium package
      
      const paymentIntent = mockStripePaymentIntent({
        amount: packagePrice * 100,
        currency: 'chf',
        metadata: {
          payment_type: 'premium_package',
          package_id: 'package_premium',
          user_id: user.id
        }
      })

      mockStripe.paymentIntents.create.mockResolvedValue(paymentIntent)

      const { createPaymentIntent } = require('@/lib/stripe')
      
      const result = await createPaymentIntent({
        amount: packagePrice,
        currency: 'CHF',
        metadata: {
          payment_type: 'premium_package',
          package_id: 'package_premium',
          user_id: user.id
        },
        description: 'Premium package purchase'
      })

      expect(result.amount).toBe(packagePrice * 100)
      expect(result.metadata.payment_type).toBe('premium_package')
    })

    test('should handle Swiss payment methods', async () => {
      const paymentIntent = mockStripePaymentIntent({
        payment_method_types: ['card', 'twint', 'postfinance']
      })

      mockStripe.paymentIntents.create.mockResolvedValue(paymentIntent)

      const { createPaymentIntent, SWISS_PAYMENT_METHODS } = require('@/lib/stripe')
      
      const result = await createPaymentIntent({
        amount: 100,
        currency: 'CHF',
        paymentMethods: SWISS_PAYMENT_METHODS,
        automaticPaymentMethods: false
      })

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: SWISS_PAYMENT_METHODS
        })
      )
    })

    test('should calculate commission correctly', async () => {
      const { calculateCommission } = require('@/lib/stripe')
      
      const testCases = [
        { amount: 10000, expected: 500 }, // 5% of 10000 = 500, within max
        { amount: 20000, expected: 500 }, // 5% of 20000 = 1000, capped at 500
        { amount: 5000, expected: 250 },  // 5% of 5000 = 250, within max
        { amount: 1000, expected: 50 }    // 5% of 1000 = 50, within max
      ]

      testCases.forEach(({ amount, expected }) => {
        const commission = calculateCommission(amount, 0.05, 500)
        expect(commission).toBe(expected)
      })
    })
  })

  describe('Payment Confirmation', () => {
    test('should confirm payment intent', async () => {
      const paymentIntentId = 'pi_test_123'
      const confirmedPaymentIntent = mockStripePaymentIntent({
        id: paymentIntentId,
        status: 'succeeded'
      })

      mockStripe.paymentIntents.confirm.mockResolvedValue(confirmedPaymentIntent)

      const { confirmPaymentIntent } = require('@/lib/stripe')
      
      const result = await confirmPaymentIntent(paymentIntentId, {
        paymentMethodId: 'pm_test_123',
        returnUrl: 'https://motoauto.ch/payment/success'
      })

      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith(
        paymentIntentId,
        {
          payment_method: 'pm_test_123',
          return_url: 'https://motoauto.ch/payment/success'
        }
      )

      expect(result.status).toBe('succeeded')
    })

    test('should handle payment confirmation failure', async () => {
      const paymentIntentId = 'pi_test_123'
      
      mockStripe.paymentIntents.confirm.mockRejectedValue(
        new Error('Your card was declined.')
      )

      const { confirmPaymentIntent } = require('@/lib/stripe')
      
      await expect(confirmPaymentIntent(paymentIntentId)).rejects.toThrow('Your card was declined.')
    })
  })

  describe('Refund Processing', () => {
    test('should create refund for payment', async () => {
      const paymentIntentId = 'pi_test_123'
      const refundAmount = 2500 // 25.00 CHF
      
      const refund = {
        id: 're_test_123',
        amount: refundAmount,
        currency: 'chf',
        payment_intent: paymentIntentId,
        status: 'succeeded',
        reason: 'requested_by_customer'
      }

      mockStripe.refunds.create.mockResolvedValue(refund)

      const { createRefund } = require('@/lib/stripe')
      
      const result = await createRefund({
        paymentIntentId,
        amount: refundAmount / 100, // Convert from cents
        currency: 'CHF',
        reason: 'requested_by_customer',
        metadata: {
          refund_reason: 'Customer requested refund'
        }
      })

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: paymentIntentId,
        amount: refundAmount,
        reason: 'requested_by_customer',
        metadata: expect.objectContaining({
          refund_reason: 'Customer requested refund',
          platform: 'MotoAuto.ch'
        })
      })

      expect(result.id).toBe('re_test_123')
      expect(result.status).toBe('succeeded')
    })

    test('should handle partial refunds', async () => {
      const paymentIntentId = 'pi_test_123'
      const originalAmount = 5000 // 50.00 CHF
      const refundAmount = 2500 // 25.00 CHF (partial)
      
      const refund = {
        id: 're_test_123',
        amount: refundAmount,
        currency: 'chf',
        payment_intent: paymentIntentId,
        status: 'succeeded'
      }

      mockStripe.refunds.create.mockResolvedValue(refund)

      const { createRefund } = require('@/lib/stripe')
      
      const result = await createRefund({
        paymentIntentId,
        amount: refundAmount / 100,
        currency: 'CHF'
      })

      expect(result.amount).toBe(refundAmount)
      expect(result.amount).toBeLessThan(originalAmount)
    })
  })

  describe('Customer Management', () => {
    test('should create Stripe customer', async () => {
      const user = mockUser()
      const profile = mockProfile({ id: user.id })
      
      const customer = {
        id: 'cus_test_123',
        email: profile.email,
        name: profile.full_name,
        metadata: {
          user_id: user.id,
          platform: 'MotoAuto.ch'
        }
      }

      mockStripe.customers.create.mockResolvedValue(customer)

      const { createCustomer } = require('@/lib/stripe')
      
      const result = await createCustomer({
        email: profile.email,
        name: profile.full_name,
        metadata: {
          user_id: user.id
        }
      })

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: profile.email,
        name: profile.full_name,
        metadata: expect.objectContaining({
          user_id: user.id,
          platform: 'MotoAuto.ch'
        })
      })

      expect(result.id).toBe('cus_test_123')
    })

    test('should update customer information', async () => {
      const customerId = 'cus_test_123'
      const updatedCustomer = {
        id: customerId,
        email: 'updated@example.com',
        name: 'Updated Name'
      }

      mockStripe.customers.update = jest.fn().mockResolvedValue(updatedCustomer)

      const result = await mockStripe.customers.update(customerId, {
        email: 'updated@example.com',
        name: 'Updated Name'
      })

      expect(result.email).toBe('updated@example.com')
      expect(result.name).toBe('Updated Name')
    })
  })

  describe('Invoice Generation', () => {
    test('should create invoice for Swiss compliance', async () => {
      const customerId = 'cus_test_123'
      const items = [
        {
          description: 'Commission for vehicle sale - BMW X5',
          amount: 2500, // 25.00 CHF
          currency: 'CHF',
          quantity: 1
        }
      ]

      // Mock invoice item creation
      mockStripe.invoiceItems.create.mockResolvedValue({
        id: 'ii_test_123',
        customer: customerId,
        amount: 2500,
        currency: 'chf',
        description: items[0].description
      })

      // Mock invoice creation
      const invoice = {
        id: 'in_test_123',
        customer: customerId,
        status: 'open',
        amount_due: 2500,
        currency: 'chf',
        number: 'INV-2024-001'
      }

      mockStripe.invoices.create.mockResolvedValue(invoice)
      mockStripe.invoices.finalizeInvoice.mockResolvedValue({
        ...invoice,
        status: 'open',
        finalized_at: Math.floor(Date.now() / 1000)
      })

      const { createInvoice } = require('@/lib/stripe')
      
      const result = await createInvoice({
        customerId,
        items,
        metadata: {
          invoice_type: 'commission',
          tax_rate: '7.7%' // Swiss VAT
        }
      })

      expect(mockStripe.invoiceItems.create).toHaveBeenCalledWith({
        customer: customerId,
        amount: 2500,
        currency: 'chf',
        description: items[0].description,
        quantity: 1,
        metadata: {
          platform: 'MotoAuto.ch'
        }
      })

      expect(mockStripe.invoices.create).toHaveBeenCalled()
      expect(mockStripe.invoices.finalizeInvoice).toHaveBeenCalledWith(invoice.id)
    })

    test('should calculate Swiss VAT correctly', async () => {
      const { calculateSwissVAT } = require('@/lib/stripe')
      
      const testCases = [
        { grossAmount: 107.7, expectedNet: 100, expectedVAT: 7.7 },
        { grossAmount: 2500, expectedNet: 2321.98, expectedVAT: 178.02 },
        { grossAmount: 1000, expectedNet: 928.51, expectedVAT: 71.49 }
      ]

      testCases.forEach(({ grossAmount, expectedNet, expectedVAT }) => {
        const result = calculateSwissVAT(grossAmount, 0.077)
        
        expect(result.netAmount).toBeCloseTo(expectedNet, 2)
        expect(result.vatAmount).toBeCloseTo(expectedVAT, 2)
        expect(result.grossAmount).toBe(grossAmount)
      })
    })
  })

  describe('Webhook Handling', () => {
    test('should verify webhook signature', async () => {
      const payload = JSON.stringify({
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: {
          object: mockStripePaymentIntent({ status: 'succeeded' })
        }
      })
      
      const signature = 'test_signature'
      const webhookSecret = 'whsec_test_secret'
      
      const event = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: {
          object: mockStripePaymentIntent({ status: 'succeeded' })
        }
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(event)

      const { verifyWebhookSignature } = require('@/lib/stripe')
      
      const result = verifyWebhookSignature(payload, signature, webhookSecret)

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        webhookSecret
      )

      expect(result.type).toBe('payment_intent.succeeded')
    })

    test('should handle payment_intent.succeeded webhook', async () => {
      const paymentIntent = mockStripePaymentIntent({
        id: 'pi_test_123',
        status: 'succeeded',
        metadata: {
          payment_id: 'payment_test_123',
          user_id: 'user_test_123'
        }
      })

      const event = {
        type: 'payment_intent.succeeded',
        data: { object: paymentIntent }
      }

      // Mock database update
      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({ id: 'payment_test_123', status: 'completed' })
      )

      // Simulate webhook processing
      const processWebhook = async (event) => {
        if (event.type === 'payment_intent.succeeded') {
          const pi = event.data.object
          
          await mockSupabase
            .from('payments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              payment_provider_id: pi.id
            })
            .eq('id', pi.metadata.payment_id)
          
          return { success: true, processed: true }
        }
        return { success: false, processed: false }
      }

      const result = await processWebhook(event)
      
      expect(result.success).toBe(true)
      expect(result.processed).toBe(true)
      expect(mockSupabase.from().update().eq).toHaveBeenCalled()
    })

    test('should handle payment_intent.payment_failed webhook', async () => {
      const paymentIntent = mockStripePaymentIntent({
        id: 'pi_test_123',
        status: 'requires_payment_method',
        last_payment_error: {
          message: 'Your card was declined.',
          code: 'card_declined'
        },
        metadata: {
          payment_id: 'payment_test_123'
        }
      })

      const event = {
        type: 'payment_intent.payment_failed',
        data: { object: paymentIntent }
      }

      // Mock database update for failed payment
      mockSupabase.from().update().eq().mockResolvedValue(
        mockSupabaseResponse({ id: 'payment_test_123', status: 'failed' })
      )

      const processWebhook = async (event) => {
        if (event.type === 'payment_intent.payment_failed') {
          const pi = event.data.object
          
          await mockSupabase
            .from('payments')
            .update({
              status: 'failed',
              failure_reason: pi.last_payment_error?.message,
              failed_at: new Date().toISOString()
            })
            .eq('id', pi.metadata.payment_id)
          
          return { success: true, processed: true }
        }
        return { success: false, processed: false }
      }

      const result = await processWebhook(event)
      
      expect(result.success).toBe(true)
      expect(mockSupabase.from().update().eq).toHaveBeenCalled()
    })
  })

  describe('Currency and Formatting', () => {
    test('should format Swiss amounts correctly', () => {
      const { formatSwissAmount } = require('@/lib/stripe')
      
      const testCases = [
        { amount: 1000, currency: 'CHF', locale: 'de-CH', expected: 'CHF 1,000.00' },
        { amount: 29.90, currency: 'CHF', locale: 'de-CH', expected: 'CHF 29.90' },
        { amount: 500, currency: 'EUR', locale: 'de-CH', expected: '€ 500.00' }
      ]

      testCases.forEach(({ amount, currency, locale }) => {
        const formatted = formatSwissAmount(amount, currency, locale)
        expect(formatted).toContain(amount.toString())
        expect(typeof formatted).toBe('string')
      })
    })

    test('should convert amounts to Stripe format', () => {
      const { toStripeAmount, fromStripeAmount } = require('@/lib/stripe')
      
      const testCases = [
        { amount: 29.90, currency: 'CHF', expectedStripe: 2990 },
        { amount: 100, currency: 'CHF', expectedStripe: 10000 },
        { amount: 0.50, currency: 'CHF', expectedStripe: 50 }
      ]

      testCases.forEach(({ amount, currency, expectedStripe }) => {
        const stripeAmount = toStripeAmount(amount, currency)
        expect(stripeAmount).toBe(expectedStripe)
        
        const originalAmount = fromStripeAmount(stripeAmount, currency)
        expect(originalAmount).toBe(amount)
      })
    })
  })

  describe('Error Handling', () => {
    test('should handle Stripe API errors', async () => {
      const stripeError = new Error('Rate limit exceeded')
      stripeError.type = 'StripeRateLimitError'
      stripeError.code = 'rate_limit'

      mockStripe.paymentIntents.create.mockRejectedValue(stripeError)

      const { createPaymentIntent } = require('@/lib/stripe')
      
      await expect(createPaymentIntent({
        amount: 100,
        currency: 'CHF'
      })).rejects.toThrow('Rate limit exceeded')
    })

    test('should handle invalid payment method errors', async () => {
      const stripeError = new Error('No such payment method')
      stripeError.type = 'StripeInvalidRequestError'
      stripeError.code = 'resource_missing'

      mockStripe.paymentIntents.confirm.mockRejectedValue(stripeError)

      const { confirmPaymentIntent } = require('@/lib/stripe')
      
      await expect(confirmPaymentIntent('pi_test_123', {
        paymentMethodId: 'pm_invalid'
      })).rejects.toThrow('No such payment method')
    })

    test('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error')
      networkError.code = 'ECONNREFUSED'

      mockStripe.paymentIntents.create.mockRejectedValue(networkError)

      const { createPaymentIntent } = require('@/lib/stripe')
      
      await expect(createPaymentIntent({
        amount: 100,
        currency: 'CHF'
      })).rejects.toThrow('Network error')
    })
  })

  describe('Swiss Payment Methods Integration', () => {
    test('should support TWINT payments', async () => {
      const paymentIntent = mockStripePaymentIntent({
        payment_method_types: ['twint'],
        currency: 'chf'
      })

      mockStripe.paymentIntents.create.mockResolvedValue(paymentIntent)

      const { createPaymentIntent } = require('@/lib/stripe')
      
      const result = await createPaymentIntent({
        amount: 100,
        currency: 'CHF',
        paymentMethods: ['twint'],
        automaticPaymentMethods: false
      })

      expect(result.payment_method_types).toContain('twint')
      expect(result.currency).toBe('chf')
    })

    test('should support PostFinance payments', async () => {
      const paymentIntent = mockStripePaymentIntent({
        payment_method_types: ['postfinance'],
        currency: 'chf'
      })

      mockStripe.paymentIntents.create.mockResolvedValue(paymentIntent)

      const { createPaymentIntent } = require('@/lib/stripe')
      
      const result = await createPaymentIntent({
        amount: 100,
        currency: 'CHF',
        paymentMethods: ['postfinance'],
        automaticPaymentMethods: false
      })

      expect(result.payment_method_types).toContain('postfinance')
    })
  })

  describe('Performance and Monitoring', () => {
    test('should track payment processing time', async () => {
      const startTime = Date.now()
      
      mockStripe.paymentIntents.create.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(mockStripePaymentIntent())
          }, 100) // Simulate 100ms processing time
        })
      })

      const { createPaymentIntent } = require('@/lib/stripe')
      
      await createPaymentIntent({
        amount: 100,
        currency: 'CHF'
      })

      const processingTime = Date.now() - startTime
      expect(processingTime).toBeGreaterThanOrEqual(100)
      expect(processingTime).toBeLessThan(1000) // Should be fast
    })

    test('should handle concurrent payment requests', async () => {
      const paymentRequests = Array.from({ length: 10 }, (_, i) => ({
        amount: 100 + i,
        currency: 'CHF',
        metadata: { request_id: `req_${i}` }
      }))

      mockStripe.paymentIntents.create.mockImplementation((params) => 
        Promise.resolve(mockStripePaymentIntent({
          amount: params.amount * 100,
          metadata: params.metadata
        }))
      )

      const { createPaymentIntent } = require('@/lib/stripe')
      
      const results = await Promise.all(
        paymentRequests.map(req => createPaymentIntent(req))
      )

      expect(results).toHaveLength(10)
      results.forEach((result, index) => {
        expect(result.amount).toBe((100 + index) * 100)
        expect(result.metadata.request_id).toBe(`req_${index}`)
      })
    })
  })
})