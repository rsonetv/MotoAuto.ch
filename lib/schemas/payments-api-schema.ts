import { z } from "zod"
import { Currency, PaymentType, PaymentStatus } from "@/lib/database.types"

// Create payment intent schema
export const createPaymentIntentSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000, "Amount cannot exceed 1,000,000 CHF"),
  currency: z
    .enum([Currency.CHF, Currency.EUR, Currency.USD])
    .default(Currency.CHF),
  payment_type: z.enum([
    PaymentType.LISTING_FEE,
    PaymentType.COMMISSION,
    PaymentType.PREMIUM_PACKAGE,
    PaymentType.FEATURED_LISTING
  ]),
  listing_id: z
    .string()
    .uuid("Invalid listing ID format")
    .optional(),
  package_id: z
    .string()
    .uuid("Invalid package ID format")
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  metadata: z.record(z.any()).optional(),
  // Swiss payment methods
  payment_methods: z
    .array(z.enum([
      "card",
      "twint", 
      "postfinance",
      "sepa_debit",
      "bancontact",
      "eps",
      "giropay",
      "ideal",
      "p24",
      "sofort"
    ]))
    .default(["card", "twint", "postfinance"]),
  // Swiss market specific
  automatic_payment_methods: z.object({
    enabled: z.boolean().default(true),
    allow_redirects: z.enum(["always", "never"]).default("always")
  }).optional(),
  // Invoice details for Swiss compliance
  invoice_data: z.object({
    customer_name: z.string().min(1, "Customer name is required"),
    customer_email: z.string().email("Invalid email format"),
    customer_address: z.object({
      line1: z.string().min(1, "Address line 1 is required"),
      line2: z.string().optional(),
      city: z.string().min(1, "City is required"),
      postal_code: z.string().min(1, "Postal code is required"),
      country: z.string().min(2, "Country code is required").default("CH"),
      canton: z.string().optional()
    }),
    vat_number: z.string().optional()
  }).optional()
})
.refine(
  (data) => {
    // If payment type is for listing or commission, listing_id is required
    const listingPaymentTypes = [PaymentType.LISTING_FEE, PaymentType.COMMISSION] as const;
    if (listingPaymentTypes.includes(data.payment_type as any) && !data.listing_id) {
      return false
    }
    return true
  },
  {
    message: "Listing ID is required for listing fees and commissions",
    path: ["listing_id"]
  }
)
.refine(
  (data) => {
    // If payment type is for package, package_id is required
    const packagePaymentTypes = [PaymentType.PREMIUM_PACKAGE, PaymentType.FEATURED_LISTING] as const;
    if (packagePaymentTypes.includes(data.payment_type as any) && !data.package_id) {
      return false
    }
    return true
  },
  {
    message: "Package ID is required for package payments",
    path: ["package_id"]
  }
)

// Confirm payment schema
export const confirmPaymentSchema = z.object({
  payment_intent_id: z
    .string()
    .min(1, "Payment intent ID is required"),
  payment_method_id: z
    .string()
    .min(1, "Payment method ID is required")
    .optional(),
  return_url: z
    .string()
    .url("Invalid return URL")
    .optional(),
  // Swiss 3D Secure handling
  use_stripe_sdk: z.boolean().default(true),
  // Additional confirmation data
  receipt_email: z
    .string()
    .email("Invalid email format")
    .optional(),
  setup_future_usage: z
    .enum(["on_session", "off_session"])
    .optional(),
  shipping: z.object({
    name: z.string().min(1, "Shipping name is required"),
    address: z.object({
      line1: z.string().min(1, "Address line 1 is required"),
      line2: z.string().optional(),
      city: z.string().min(1, "City is required"),
      postal_code: z.string().min(1, "Postal code is required"),
      country: z.string().min(2, "Country code is required").default("CH"),
      state: z.string().optional()
    })
  }).optional()
})

// Payment history query schema
export const paymentHistoryQuerySchema = z.object({
  // Pagination
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a number")
    .transform(Number)
    .refine((n: number) => n >= 1, "Page must be at least 1")
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform(Number)
    .refine((n: number) => n >= 1 && n <= 100, "Limit must be between 1 and 100")
    .default("20"),
  
  // Filters
  status: z
    .enum([
      PaymentStatus.PENDING,
      PaymentStatus.PROCESSING,
      PaymentStatus.COMPLETED,
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
      PaymentStatus.REFUNDED
    ])
    .optional(),
  payment_type: z
    .enum([
      PaymentType.LISTING_FEE,
      PaymentType.COMMISSION,
      PaymentType.PREMIUM_PACKAGE,
      PaymentType.FEATURED_LISTING,
      PaymentType.REFUND
    ])
    .optional(),
  currency: z
    .enum([Currency.CHF, Currency.EUR, Currency.USD])
    .optional(),
  
  // Date range
  date_from: z
    .string()
    .datetime("Invalid date format")
    .optional(),
  date_to: z
    .string()
    .datetime("Invalid date format")
    .optional(),
  
  // Amount range
  amount_min: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
    .transform(Number)
    .refine((n: number) => n >= 0, "Minimum amount cannot be negative")
    .optional(),
  amount_max: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
    .transform(Number)
    .refine((n: number) => n >= 0, "Maximum amount cannot be negative")
    .optional(),
  
  // Sorting
  sort_by: z
    .enum(["created_at", "amount", "status", "completed_at"])
    .default("created_at"),
  sort_order: z
    .enum(["asc", "desc"])
    .default("desc")
})
.refine(
  (data) => {
    // Validate date range
    if (data.date_from && data.date_to && new Date(data.date_from) > new Date(data.date_to)) {
      return false
    }
    return true
  },
  {
    message: "Start date cannot be after end date",
    path: ["date_from"]
  }
)
.refine(
  (data) => {
    // Validate amount range
    if (data.amount_min && data.amount_max && data.amount_min > data.amount_max) {
      return false
    }
    return true
  },
  {
    message: "Minimum amount cannot be greater than maximum amount",
    path: ["amount_min"]
  }
)

// Refund request schema
export const refundRequestSchema = z.object({
  payment_id: z
    .string()
    .uuid("Invalid payment ID format"),
  amount: z
    .number()
    .positive("Refund amount must be positive")
    .optional(), // If not provided, full refund
  reason: z
    .enum([
      "duplicate",
      "fraudulent", 
      "requested_by_customer",
      "expired_uncaptured_charge",
      "other"
    ])
    .default("requested_by_customer"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  metadata: z.record(z.any()).optional(),
  // Swiss compliance
  refund_application_fee: z.boolean().default(false),
  reverse_transfer: z.boolean().default(false)
})

// Commission calculation schema
export const commissionCalculationSchema = z.object({
  auction_id: z
    .string()
    .uuid("Invalid auction ID format"),
  sale_amount: z
    .number()
    .positive("Sale amount must be positive"),
  commission_rate: z
    .number()
    .min(0, "Commission rate cannot be negative")
    .max(1, "Commission rate cannot exceed 100%")
    .default(0.05), // 5% default
  max_commission: z
    .number()
    .positive("Maximum commission must be positive")
    .default(500), // 500 CHF max
  currency: z
    .enum([Currency.CHF, Currency.EUR, Currency.USD])
    .default(Currency.CHF)
})

// Webhook event schema
export const webhookEventSchema = z.object({
  id: z.string(),
  object: z.literal("event"),
  api_version: z.string(),
  created: z.number(),
  data: z.object({
    object: z.any(),
    previous_attributes: z.any().optional()
  }),
  livemode: z.boolean(),
  pending_webhooks: z.number(),
  request: z.object({
    id: z.string().nullable(),
    idempotency_key: z.string().nullable()
  }),
  type: z.string()
})

// Invoice generation schema
export const invoiceGenerationSchema = z.object({
  payment_id: z
    .string()
    .uuid("Invalid payment ID format"),
  language: z
    .enum(["de", "fr", "en", "pl"])
    .default("de"),
  format: z
    .enum(["pdf", "html"])
    .default("pdf"),
  // Swiss invoice requirements
  include_vat: z.boolean().default(true),
  vat_rate: z
    .number()
    .min(0, "VAT rate cannot be negative")
    .max(1, "VAT rate cannot exceed 100%")
    .default(0.077), // 7.7% Swiss VAT
  invoice_number: z
    .string()
    .optional(), // Auto-generated if not provided
  due_date: z
    .string()
    .datetime("Invalid due date format")
    .optional(),
  // Company details for Swiss compliance
  company_details: z.object({
    name: z.string().default("MotoAuto.ch"),
    address: z.string().default("Musterstrasse 1, 8000 Zürich, Switzerland"),
    vat_number: z.string().default("CHE-123.456.789 MWST"),
    contact: z.string().default("info@motoauto.ch")
  }).optional()
})

// Response schemas for type safety
export const paymentIntentResponseSchema = z.object({
  id: z.string(),
  client_secret: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  payment_method_types: z.array(z.string()),
  created: z.number(),
  metadata: z.record(z.any())
})

export const paymentResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  listing_id: z.string().uuid().nullable(),
  package_id: z.string().uuid().nullable(),
  amount: z.number(),
  currency: z.string(),
  commission_rate: z.number(),
  commission_amount: z.number(),
  max_commission: z.number(),
  payment_method: z.string().nullable(),
  payment_provider: z.string().nullable(),
  payment_provider_id: z.string().nullable(),
  payment_type: z.string(),
  status: z.string(),
  description: z.string().nullable(),
  metadata: z.record(z.any()),
  failure_reason: z.string().nullable(),
  processed_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  failed_at: z.string().nullable(),
  refunded_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
})

export const paginatedPaymentsResponseSchema = z.object({
  data: z.array(paymentResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  filters: z.record(z.any()).optional()
})

export const commissionCalculationResponseSchema = z.object({
  auction_id: z.string().uuid(),
  sale_amount: z.number(),
  commission_rate: z.number(),
  commission_amount: z.number(),
  max_commission: z.number(),
  currency: z.string(),
  calculated_at: z.string()
})

export const invoiceResponseSchema = z.object({
  invoice_id: z.string(),
  payment_id: z.string().uuid(),
  invoice_number: z.string(),
  invoice_url: z.string().optional(),
  invoice_data: z.string().optional(), // Base64 encoded PDF or HTML
  language: z.string(),
  format: z.string(),
  generated_at: z.string()
})

// Type exports
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>
export type PaymentHistoryQuery = z.infer<typeof paymentHistoryQuerySchema>
export type RefundRequestInput = z.infer<typeof refundRequestSchema>
export type CommissionCalculationInput = z.infer<typeof commissionCalculationSchema>
export type WebhookEventInput = z.infer<typeof webhookEventSchema>
export type InvoiceGenerationInput = z.infer<typeof invoiceGenerationSchema>
export type PaymentIntentResponse = z.infer<typeof paymentIntentResponseSchema>
export type PaymentResponse = z.infer<typeof paymentResponseSchema>
export type PaginatedPaymentsResponse = z.infer<typeof paginatedPaymentsResponseSchema>
export type CommissionCalculationResponse = z.infer<typeof commissionCalculationResponseSchema>
export type InvoiceResponse = z.infer<typeof invoiceResponseSchema>