import { z } from "zod"
import { ContactCategory, ContactStatus, ContactPriority, ResponseType, EmailDeliveryStatus, Language } from "@/lib/database.types"

// Contact form submission schema
export const createContactMessageSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Name contains invalid characters"),
  
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email cannot exceed 255 characters"),
  
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject cannot exceed 200 characters"),
  
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(5000, "Message cannot exceed 5000 characters"),
  
  category: z
    .enum([
      ContactCategory.GENERAL_INQUIRY,
      ContactCategory.LISTING_INQUIRY,
      ContactCategory.TECHNICAL_SUPPORT,
      ContactCategory.BILLING_SUPPORT,
      ContactCategory.ACCOUNT_ISSUES,
      ContactCategory.PARTNERSHIP,
      ContactCategory.LEGAL_COMPLIANCE
    ]),
  
  // Optional fields
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, "Invalid phone number format")
    .optional(),
  
  listing_id: z
    .string()
    .uuid("Invalid listing ID format")
    .optional(),
  
  language: z
    .enum([Language.DE, Language.FR, Language.PL, Language.EN])
    .default(Language.DE),
  
  // reCAPTCHA token (required for spam prevention)
  recaptcha_token: z
    .string()
    .min(1, "reCAPTCHA verification is required"),
  
  // Optional user context (if authenticated)
  user_id: z
    .string()
    .uuid("Invalid user ID format")
    .optional(),
})

// Listing-specific contact schema
export const createListingContactSchema = createContactMessageSchema
  .omit({ category: true, listing_id: true })
  .extend({
    category: z.literal(ContactCategory.LISTING_INQUIRY),
    // Additional listing-specific fields
    inquiry_type: z
      .enum(['price_negotiation', 'viewing_request', 'technical_question', 'general_interest'])
      .optional(),
    preferred_contact_method: z
      .enum(['email', 'phone', 'both'])
      .default('email'),
    preferred_contact_time: z
      .string()
      .max(100, "Preferred contact time cannot exceed 100 characters")
      .optional(),
  })

// Update contact message schema (admin only)
export const updateContactMessageSchema = z.object({
  status: z
    .enum([
      ContactStatus.NEW,
      ContactStatus.READ,
      ContactStatus.RESPONDED,
      ContactStatus.CLOSED
    ])
    .optional(),
  
  priority: z
    .enum([
      ContactPriority.LOW,
      ContactPriority.NORMAL,
      ContactPriority.HIGH,
      ContactPriority.URGENT
    ])
    .optional(),
  
  assigned_to: z
    .string()
    .uuid("Invalid user ID format")
    .nullable()
    .optional(),
  
  metadata: z
    .record(z.any())
    .optional(),
})

// Contact response schema (admin only)
export const createContactResponseSchema = z.object({
  response_text: z
    .string()
    .min(10, "Response must be at least 10 characters")
    .max(5000, "Response cannot exceed 5000 characters"),
  
  response_type: z
    .enum([
      ResponseType.EMAIL,
      ResponseType.PHONE,
      ResponseType.INTERNAL_NOTE
    ])
    .default(ResponseType.EMAIL),
  
  send_email: z
    .boolean()
    .default(true),
})

// Query parameters for GET /api/contact/messages
export const contactMessagesQuerySchema = z.object({
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
      ContactStatus.NEW,
      ContactStatus.READ,
      ContactStatus.RESPONDED,
      ContactStatus.CLOSED
    ])
    .optional(),
  
  category: z
    .enum([
      ContactCategory.GENERAL_INQUIRY,
      ContactCategory.LISTING_INQUIRY,
      ContactCategory.TECHNICAL_SUPPORT,
      ContactCategory.BILLING_SUPPORT,
      ContactCategory.ACCOUNT_ISSUES,
      ContactCategory.PARTNERSHIP,
      ContactCategory.LEGAL_COMPLIANCE
    ])
    .optional(),
  
  priority: z
    .enum([
      ContactPriority.LOW,
      ContactPriority.NORMAL,
      ContactPriority.HIGH,
      ContactPriority.URGENT
    ])
    .optional(),
  
  language: z
    .enum([Language.DE, Language.FR, Language.PL, Language.EN])
    .optional(),
  
  assigned_to: z
    .string()
    .uuid("Invalid user ID format")
    .optional(),
  
  listing_id: z
    .string()
    .uuid("Invalid listing ID format")
    .optional(),
  
  // Search
  search: z
    .string()
    .min(2, "Search term must be at least 2 characters")
    .max(100, "Search term cannot exceed 100 characters")
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
  
  // Sorting
  sort_by: z
    .enum([
      "created_at",
      "updated_at",
      "priority",
      "status",
      "response_count"
    ])
    .default("created_at"),
  
  sort_order: z
    .enum(["asc", "desc"])
    .default("desc"),
})
.refine(
  (data: any) => {
    // Validate date range
    if (data.date_from && data.date_to) {
      const from = new Date(data.date_from)
      const to = new Date(data.date_to)
      return from <= to
    }
    return true
  },
  {
    message: "Date from cannot be later than date to",
    path: ["date_from"],
  }
)

// Contact categories response schema
export const contactCategoriesResponseSchema = z.array(
  z.object({
    key: z.string(),
    name_en: z.string(),
    name_de: z.string(),
    name_fr: z.string(),
    name_pl: z.string(),
    description_en: z.string().optional(),
    description_de: z.string().optional(),
    description_fr: z.string().optional(),
    description_pl: z.string().optional(),
    icon: z.string().optional(),
  })
)

// Contact message response schema
export const contactMessageResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  subject: z.string(),
  message: z.string(),
  category: z.string(),
  listing_id: z.string().uuid().nullable(),
  language: z.string(),
  status: z.string(),
  priority: z.string(),
  assigned_to: z.string().uuid().nullable(),
  response_count: z.number(),
  last_response_at: z.string().nullable(),
  recaptcha_score: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  read_at: z.string().nullable(),
  responded_at: z.string().nullable(),
  closed_at: z.string().nullable(),
  
  // Related data
  profiles: z.object({
    full_name: z.string().nullable(),
    avatar_url: z.string().nullable(),
    is_dealer: z.boolean(),
    dealer_name: z.string().nullable(),
  }).nullable().optional(),
  
  listings: z.object({
    id: z.string().uuid(),
    title: z.string(),
    brand: z.string(),
    model: z.string(),
    price: z.number(),
    images: z.array(z.string()),
  }).nullable().optional(),
  
  contact_responses: z.array(
    z.object({
      id: z.string().uuid(),
      response_text: z.string(),
      response_type: z.string(),
      email_sent: z.boolean(),
      email_delivery_status: z.string().nullable(),
      created_at: z.string(),
      profiles: z.object({
        full_name: z.string().nullable(),
        avatar_url: z.string().nullable(),
      }).nullable().optional(),
    })
  ).optional(),
})

// Paginated contact messages response schema
export const paginatedContactMessagesResponseSchema = z.object({
  data: z.array(contactMessageResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  filters: z.record(z.any()).optional(),
})

// reCAPTCHA verification schema
export const recaptchaVerificationSchema = z.object({
  token: z.string().min(1, "reCAPTCHA token is required"),
  action: z.string().min(1, "reCAPTCHA action is required"),
  expected_action: z.string().optional(),
  min_score: z.number().min(0).max(1).default(0.5),
})

// Email template schema
export const emailTemplateSchema = z.object({
  template_type: z.enum([
    'contact_confirmation',
    'contact_response',
    'listing_inquiry_notification',
    'admin_notification'
  ]),
  language: z.enum([Language.DE, Language.FR, Language.PL, Language.EN]),
  variables: z.record(z.any()),
})

// Rate limiting schema
export const rateLimitSchema = z.object({
  ip_address: z.string().ip(),
  email: z.string().email().optional(),
  user_id: z.string().uuid().optional(),
  action: z.string(),
  window_minutes: z.number().positive().default(60),
  max_attempts: z.number().positive().default(5),
})

// Type exports
export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>
export type CreateListingContactInput = z.infer<typeof createListingContactSchema>
export type UpdateContactMessageInput = z.infer<typeof updateContactMessageSchema>
export type CreateContactResponseInput = z.infer<typeof createContactResponseSchema>
export type ContactMessagesQuery = z.infer<typeof contactMessagesQuerySchema>
export type ContactCategoriesResponse = z.infer<typeof contactCategoriesResponseSchema>
export type ContactMessageResponse = z.infer<typeof contactMessageResponseSchema>
export type PaginatedContactMessagesResponse = z.infer<typeof paginatedContactMessagesResponseSchema>
export type RecaptchaVerificationInput = z.infer<typeof recaptchaVerificationSchema>
export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>
export type RateLimitInput = z.infer<typeof rateLimitSchema>

// Validation helpers
export const validateContactMessage = (data: any) => createContactMessageSchema.parse(data)
export const validateListingContact = (data: any) => createListingContactSchema.parse(data)
export const validateContactMessagesQuery = (params: URLSearchParams) => {
  const queryParams: Record<string, string> = {}
  params.forEach((value, key) => {
    queryParams[key] = value
  })
  return contactMessagesQuerySchema.parse(queryParams)
}