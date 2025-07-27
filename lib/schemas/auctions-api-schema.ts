import { z } from "zod"
import { FuelType, TransmissionType, VehicleCondition, Currency } from "@/lib/database.types"

// Auction states enum
export const AuctionState = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  EXTENDED: 'extended',
  ENDED: 'ended',
  CANCELLED: 'cancelled'
} as const

// Query parameters for GET /api/auctions
export const auctionsQuerySchema = z.object({
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

  // Search
  search: z
    .string()
    .min(2, "Search term must be at least 2 characters")
    .max(100, "Search term cannot exceed 100 characters")
    .optional(),

  // Filters
  category_id: z
    .string()
    .uuid("Invalid category ID format")
    .optional(),
  brand: z
    .string()
    .max(50, "Brand filter cannot exceed 50 characters")
    .optional(),
  model: z
    .string()
    .max(50, "Model filter cannot exceed 50 characters")
    .optional(),
  fuel_type: z
    .enum([
      FuelType.PETROL,
      FuelType.DIESEL,
      FuelType.ELECTRIC,
      FuelType.HYBRID,
      FuelType.GAS,
      FuelType.OTHER
    ])
    .optional(),
  transmission: z
    .enum([
      TransmissionType.MANUAL,
      TransmissionType.AUTOMATIC,
      TransmissionType.SEMI_AUTOMATIC
    ])
    .optional(),
  condition: z
    .enum([VehicleCondition.NEW, VehicleCondition.USED, VehicleCondition.DAMAGED])
    .optional(),

  // Auction-specific filters
  auction_state: z
    .enum([
      AuctionState.DRAFT,
      AuctionState.ACTIVE,
      AuctionState.EXTENDED,
      AuctionState.ENDED,
      AuctionState.CANCELLED
    ])
    .default(AuctionState.ACTIVE),
  has_reserve: z
    .string()
    .regex(/^(true|false)$/, "has_reserve must be 'true' or 'false'")
    .transform((s: string) => s === "true")
    .optional(),
  reserve_met: z
    .string()
    .regex(/^(true|false)$/, "reserve_met must be 'true' or 'false'")
    .transform((s: string) => s === "true")
    .optional(),
  ending_within_hours: z
    .string()
    .regex(/^\d+$/, "ending_within_hours must be a number")
    .transform(Number)
    .refine((n: number) => n >= 1 && n <= 168, "ending_within_hours must be between 1 and 168 (7 days)")
    .optional(),

  // Price range (current bid)
  bid_min: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid bid format")
    .transform(Number)
    .refine((n: number) => n >= 0, "Minimum bid cannot be negative")
    .optional(),
  bid_max: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid bid format")
    .transform(Number)
    .refine((n: number) => n >= 0, "Maximum bid cannot be negative")
    .optional(),

  // Year range
  year_min: z
    .string()
    .regex(/^\d{4}$/, "Year must be 4 digits")
    .transform(Number)
    .refine((n: number) => n >= 1900, "Minimum year must be after 1900")
    .optional(),
  year_max: z
    .string()
    .regex(/^\d{4}$/, "Year must be 4 digits")
    .transform(Number)
    .refine((n: number) => n <= new Date().getFullYear() + 1, "Maximum year cannot be in the future")
    .optional(),

  // Mileage range
  mileage_min: z
    .string()
    .regex(/^\d+$/, "Mileage must be a number")
    .transform(Number)
    .refine((n: number) => n >= 0, "Minimum mileage cannot be negative")
    .optional(),
  mileage_max: z
    .string()
    .regex(/^\d+$/, "Mileage must be a number")
    .transform(Number)
    .refine((n: number) => n >= 0, "Maximum mileage cannot be negative")
    .optional(),

  // Location
  location: z
    .string()
    .max(100, "Location filter cannot exceed 100 characters")
    .optional(),
  canton: z
    .string()
    .max(20, "Canton filter cannot exceed 20 characters")
    .optional(),
  postal_code: z
    .string()
    .max(10, "Postal code filter cannot exceed 10 characters")
    .optional(),

  // Sorting
  sort_by: z
    .enum([
      "auction_end_time",
      "current_bid",
      "bid_count",
      "created_at",
      "price",
      "year",
      "mileage",
      "views"
    ])
    .default("auction_end_time"),
  sort_order: z
    .enum(["asc", "desc"])
    .default("asc"), // Default to ascending for auction end time (ending soonest first)
})
.refine(
  (data: any) => {
    // Validate bid range
    if (data.bid_min && data.bid_max && data.bid_min > data.bid_max) {
      return false
    }
    return true
  },
  {
    message: "Minimum bid cannot be greater than maximum bid",
    path: ["bid_min"],
  }
)
.refine(
  (data: any) => {
    // Validate year range
    if (data.year_min && data.year_max && data.year_min > data.year_max) {
      return false
    }
    return true
  },
  {
    message: "Minimum year cannot be greater than maximum year",
    path: ["year_min"],
  }
)
.refine(
  (data: any) => {
    // Validate mileage range
    if (data.mileage_min && data.mileage_max && data.mileage_min > data.mileage_max) {
      return false
    }
    return true
  },
  {
    message: "Minimum mileage cannot be greater than maximum mileage",
    path: ["mileage_min"],
  }
)

// Watchlist action schema
export const watchlistActionSchema = z.object({
  action: z.enum(["add", "remove"]),
})

// Auction extension schema
export const auctionExtensionSchema = z.object({
  reason: z
    .string()
    .min(10, "Extension reason must be at least 10 characters")
    .max(500, "Extension reason cannot exceed 500 characters")
    .optional(),
  minutes: z
    .number()
    .int()
    .min(1, "Extension must be at least 1 minute")
    .max(60, "Extension cannot exceed 60 minutes")
    .default(5),
})

// Ending soon query schema
export const endingSoonQuerySchema = z.object({
  hours: z
    .string()
    .regex(/^\d+$/, "Hours must be a number")
    .transform(Number)
    .refine((n: number) => n >= 1 && n <= 168, "Hours must be between 1 and 168 (7 days)")
    .default("24"),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform(Number)
    .refine((n: number) => n >= 1 && n <= 100, "Limit must be between 1 and 100")
    .default("50"),
  include_extended: z
    .string()
    .regex(/^(true|false)$/, "include_extended must be 'true' or 'false'")
    .transform((s: string) => s === "true")
    .default("true"),
})

// My auctions query schema
export const myAuctionsQuerySchema = z.object({
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

  // Status filter
  status: z
    .enum([
      AuctionState.DRAFT,
      AuctionState.ACTIVE,
      AuctionState.EXTENDED,
      AuctionState.ENDED,
      AuctionState.CANCELLED
    ])
    .optional(),

  // Date range
  created_after: z
    .string()
    .datetime("Invalid date format")
    .optional(),
  created_before: z
    .string()
    .datetime("Invalid date format")
    .optional(),
  ended_after: z
    .string()
    .datetime("Invalid date format")
    .optional(),
  ended_before: z
    .string()
    .datetime("Invalid date format")
    .optional(),

  // Sorting
  sort_by: z
    .enum([
      "created_at",
      "auction_end_time",
      "current_bid",
      "bid_count",
      "views"
    ])
    .default("created_at"),
  sort_order: z
    .enum(["asc", "desc"])
    .default("desc"),
})

// Response schemas for type safety
export const auctionResponseSchema = z.object({
  id: z.string().uuid(),
  listing_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  brand: z.string(),
  model: z.string(),
  year: z.number().nullable(),
  price: z.number(), // Starting price
  currency: z.string(),
  location: z.string(),
  postal_code: z.string(),
  canton: z.string().nullable(),
  images: z.array(z.string()),
  
  // Auction-specific fields
  auction_end_time: z.string(),
  current_bid: z.number(),
  bid_count: z.number(),
  min_bid_increment: z.number(),
  reserve_price: z.number().nullable(),
  reserve_met: z.boolean(),
  auto_extend_minutes: z.number(),
  extended_count: z.number(),
  max_extensions: z.number(),
  
  // Auction state
  auction_state: z.enum([
    AuctionState.DRAFT,
    AuctionState.ACTIVE,
    AuctionState.EXTENDED,
    AuctionState.ENDED,
    AuctionState.CANCELLED
  ]),
  
  // Statistics
  views: z.number(),
  favorites_count: z.number(),
  unique_bidders: z.number(),
  
  // Timestamps
  created_at: z.string(),
  updated_at: z.string(),
  ended_at: z.string().nullable(),
  
  // Relations
  profiles: z.object({
    full_name: z.string().nullable(),
    avatar_url: z.string().nullable(),
    is_dealer: z.boolean(),
    dealer_name: z.string().nullable(),
  }),
  categories: z.object({
    name_en: z.string(),
    name_de: z.string(),
    name_fr: z.string(),
    name_pl: z.string(),
    slug: z.string(),
  }),
  
  // Optional fields for detailed view
  bids: z.array(z.object({
    id: z.string().uuid(),
    amount: z.number(),
    is_auto_bid: z.boolean(),
    status: z.string(),
    placed_at: z.string(),
    profiles: z.object({
      full_name: z.string().nullable(),
      avatar_url: z.string().nullable(),
      is_dealer: z.boolean(),
      dealer_name: z.string().nullable(),
    }),
  })).optional(),
})

export const auctionStatusResponseSchema = z.object({
  id: z.string().uuid(),
  auction_state: z.enum([
    AuctionState.DRAFT,
    AuctionState.ACTIVE,
    AuctionState.EXTENDED,
    AuctionState.ENDED,
    AuctionState.CANCELLED
  ]),
  auction_end_time: z.string(),
  current_bid: z.number(),
  bid_count: z.number(),
  reserve_met: z.boolean(),
  extended_count: z.number(),
  time_remaining_seconds: z.number(),
  next_min_bid: z.number(),
  can_extend: z.boolean(),
  last_bid_time: z.string().nullable(),
  updated_at: z.string(),
})

export const paginatedAuctionsResponseSchema = z.object({
  data: z.array(auctionResponseSchema),
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

export const watchlistResponseSchema = z.object({
  success: z.boolean(),
  action: z.enum(["added", "removed"]),
  auction_id: z.string().uuid(),
  total_watched: z.number(),
})

export const extensionResponseSchema = z.object({
  success: z.boolean(),
  extended: z.boolean(),
  new_end_time: z.string().optional(),
  extension_count: z.number(),
  reason: z.string().optional(),
})

// Type exports
export type AuctionsQuery = z.infer<typeof auctionsQuerySchema>
export type WatchlistAction = z.infer<typeof watchlistActionSchema>
export type AuctionExtension = z.infer<typeof auctionExtensionSchema>
export type EndingSoonQuery = z.infer<typeof endingSoonQuerySchema>
export type MyAuctionsQuery = z.infer<typeof myAuctionsQuerySchema>
export type AuctionResponse = z.infer<typeof auctionResponseSchema>
export type AuctionStatusResponse = z.infer<typeof auctionStatusResponseSchema>
export type PaginatedAuctionsResponse = z.infer<typeof paginatedAuctionsResponseSchema>
export type WatchlistResponse = z.infer<typeof watchlistResponseSchema>
export type ExtensionResponse = z.infer<typeof extensionResponseSchema>

// Helper functions for auction state calculation
export function calculateAuctionState(
  auctionEndTime: string,
  extendedCount: number,
  status: string
): typeof AuctionState[keyof typeof AuctionState] {
  const now = new Date()
  const endTime = new Date(auctionEndTime)
  
  if (status === 'draft') return AuctionState.DRAFT
  if (status === 'suspended') return AuctionState.CANCELLED
  if (status === 'sold' || status === 'expired') return AuctionState.ENDED
  
  if (endTime <= now) {
    return AuctionState.ENDED
  }
  
  if (extendedCount > 0) {
    return AuctionState.EXTENDED
  }
  
  return AuctionState.ACTIVE
}

export function calculateTimeRemaining(auctionEndTime: string): number {
  const now = new Date()
  const endTime = new Date(auctionEndTime)
  const diffMs = endTime.getTime() - now.getTime()
  return Math.max(0, Math.floor(diffMs / 1000)) // Return seconds
}

export function calculateNextMinBid(currentBid: number, minBidIncrement: number): number {
  return currentBid + minBidIncrement
}

export function canExtendAuction(
  auctionEndTime: string,
  extendedCount: number,
  maxExtensions: number,
  lastBidTime?: string
): boolean {
  const now = new Date()
  const endTime = new Date(auctionEndTime)
  
  // Can't extend if auction has ended
  if (endTime <= now) return false
  
  // Can't extend if max extensions reached
  if (extendedCount >= maxExtensions) return false
  
  // Can extend if there's a recent bid within the last 5 minutes
  if (lastBidTime) {
    const lastBid = new Date(lastBidTime)
    const timeSinceLastBid = endTime.getTime() - lastBid.getTime()
    return timeSinceLastBid <= 5 * 60 * 1000 // 5 minutes in milliseconds
  }
  
  return false
}

// Swiss market specific helpers
export const SwissCantons = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
] as const

export function calculateCommission(saleAmount: number): number {
  const rate = 0.05 // 5%
  const maxCommission = 500 // CHF
  return Math.min(saleAmount * rate, maxCommission)
}