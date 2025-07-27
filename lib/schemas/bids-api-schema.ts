import { z } from "zod"
import { BidStatus, Currency } from "@/lib/database.types"

// Swiss bid increment rules based on current bid amount
export const SwissBidIncrements = {
  0: 50,      // 0-999 CHF: 50 CHF increment
  1000: 100,  // 1000-4999 CHF: 100 CHF increment
  5000: 250,  // 5000-9999 CHF: 250 CHF increment
  10000: 500, // 10000+ CHF: 500 CHF increment
} as const

// Calculate minimum bid increment based on current bid
export function calculateMinBidIncrement(currentBid: number): number {
  if (currentBid >= 10000) return SwissBidIncrements[10000]
  if (currentBid >= 5000) return SwissBidIncrements[5000]
  if (currentBid >= 1000) return SwissBidIncrements[1000]
  return SwissBidIncrements[0]
}

// Place bid schema - POST /api/bids
export const placeBidSchema = z.object({
  listing_id: z
    .string()
    .uuid("Invalid listing ID format"),
  auction_id: z
    .string()
    .uuid("Invalid auction ID format"),
  amount: z
    .number()
    .positive("Bid amount must be positive")
    .multipleOf(0.01, "Bid amount must be in valid currency format")
    .max(10000000, "Bid amount cannot exceed 10,000,000 CHF"),
  is_auto_bid: z
    .boolean()
    .default(false),
  max_auto_bid: z
    .number()
    .positive("Maximum auto-bid must be positive")
    .multipleOf(0.01, "Maximum auto-bid must be in valid currency format")
    .max(10000000, "Maximum auto-bid cannot exceed 10,000,000 CHF")
    .optional(),
})
.refine(
  (data: any) => {
    // If auto-bid is enabled, max_auto_bid must be provided and greater than amount
    if (data.is_auto_bid) {
      return data.max_auto_bid && data.max_auto_bid >= data.amount
    }
    return true
  },
  {
    message: "Maximum auto-bid must be provided and greater than or equal to bid amount when auto-bidding is enabled",
    path: ["max_auto_bid"],
  }
)

// Auto-bid setup schema - POST /api/bids/auto-bid
export const autoBidSetupSchema = z.object({
  listing_id: z
    .string()
    .uuid("Invalid listing ID format"),
  auction_id: z
    .string()
    .uuid("Invalid auction ID format"),
  max_amount: z
    .number()
    .positive("Maximum auto-bid amount must be positive")
    .multipleOf(0.01, "Maximum auto-bid amount must be in valid currency format")
    .max(10000000, "Maximum auto-bid amount cannot exceed 10,000,000 CHF"),
  initial_bid: z
    .number()
    .positive("Initial bid amount must be positive")
    .multipleOf(0.01, "Initial bid amount must be in valid currency format")
    .optional(),
})
.refine(
  (data: any) => {
    // If initial_bid is provided, it must be less than or equal to max_amount
    if (data.initial_bid) {
      return data.initial_bid <= data.max_amount
    }
    return true
  },
  {
    message: "Initial bid must be less than or equal to maximum auto-bid amount",
    path: ["initial_bid"],
  }
)

// Bid retraction schema - PUT /api/bids/[id]/retract
export const bidRetractionSchema = z.object({
  reason: z
    .string()
    .min(10, "Retraction reason must be at least 10 characters")
    .max(500, "Retraction reason cannot exceed 500 characters")
    .optional(),
})

// Query schema for GET /api/bids/auction/[auctionId]
export const auctionBidsQuerySchema = z.object({
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
    .default("50"),
  include_retracted: z
    .string()
    .regex(/^(true|false)$/, "include_retracted must be 'true' or 'false'")
    .transform((s: string) => s === "true")
    .default("false"),
  sort_order: z
    .enum(["asc", "desc"])
    .default("desc"), // Most recent bids first
})

// Query schema for GET /api/bids/my-bids
export const myBidsQuerySchema = z.object({
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
  status: z
    .enum([
      BidStatus.ACTIVE,
      BidStatus.OUTBID,
      BidStatus.WINNING,
      BidStatus.WON,
      BidStatus.LOST,
      BidStatus.RETRACTED
    ])
    .optional(),
  auction_status: z
    .enum(["active", "ended", "all"])
    .default("all"),
  include_auto_bids: z
    .string()
    .regex(/^(true|false)$/, "include_auto_bids must be 'true' or 'false'")
    .transform((s: string) => s === "true")
    .default("true"),
  sort_by: z
    .enum(["placed_at", "amount", "auction_end_time"])
    .default("placed_at"),
  sort_order: z
    .enum(["asc", "desc"])
    .default("desc"),
})

// Response schemas for type safety
export const bidResponseSchema = z.object({
  id: z.string().uuid(),
  listing_id: z.string().uuid(),
  auction_id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number(),
  is_auto_bid: z.boolean(),
  max_auto_bid: z.number().nullable(),
  auto_bid_active: z.boolean(),
  status: z.enum([
    BidStatus.ACTIVE,
    BidStatus.OUTBID,
    BidStatus.WINNING,
    BidStatus.WON,
    BidStatus.LOST,
    BidStatus.RETRACTED
  ]),
  placed_at: z.string(),
  created_at: z.string(),
  
  // Relations
  profiles: z.object({
    full_name: z.string().nullable(),
    avatar_url: z.string().nullable(),
    is_dealer: z.boolean(),
    dealer_name: z.string().nullable(),
  }).optional(),
  listings: z.object({
    id: z.string().uuid(),
    title: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.number().nullable(),
    images: z.array(z.string()),
    auction_end_time: z.string().nullable(),
    current_bid: z.number(),
    status: z.string(),
  }).optional(),
})

export const bidWithDetailsResponseSchema = bidResponseSchema.extend({
  profiles: z.object({
    full_name: z.string().nullable(),
    avatar_url: z.string().nullable(),
    is_dealer: z.boolean(),
    dealer_name: z.string().nullable(),
    rating: z.number(),
    rating_count: z.number(),
  }),
  listings: z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    brand: z.string(),
    model: z.string(),
    year: z.number().nullable(),
    images: z.array(z.string()),
    auction_end_time: z.string().nullable(),
    current_bid: z.number(),
    bid_count: z.number(),
    min_bid_increment: z.number(),
    reserve_price: z.number().nullable(),
    status: z.string(),
    location: z.string(),
    postal_code: z.string(),
    canton: z.string().nullable(),
  }),
})

export const autoBidResponseSchema = z.object({
  id: z.string().uuid(),
  listing_id: z.string().uuid(),
  auction_id: z.string().uuid(),
  user_id: z.string().uuid(),
  max_auto_bid: z.number(),
  auto_bid_active: z.boolean(),
  current_bid_amount: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const paginatedBidsResponseSchema = z.object({
  data: z.array(bidResponseSchema),
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

export const bidPlacementResponseSchema = z.object({
  success: z.boolean(),
  bid: bidResponseSchema,
  auction_updated: z.object({
    current_bid: z.number(),
    bid_count: z.number(),
    next_min_bid: z.number(),
    auction_extended: z.boolean(),
    new_end_time: z.string().optional(),
  }),
  outbid_notifications: z.array(z.object({
    user_id: z.string().uuid(),
    previous_bid_amount: z.number(),
  })).optional(),
})

export const bidRetractionResponseSchema = z.object({
  success: z.boolean(),
  bid_id: z.string().uuid(),
  retracted_at: z.string(),
  reason: z.string().optional(),
  auction_updated: z.object({
    current_bid: z.number(),
    bid_count: z.number(),
    new_winning_bidder: z.string().uuid().optional(),
  }),
})

// Validation helper functions
export function validateBidAmount(
  bidAmount: number,
  currentBid: number,
  minIncrement: number
): { valid: boolean; error?: string; nextMinBid: number } {
  const nextMinBid = currentBid + minIncrement
  
  if (bidAmount < nextMinBid) {
    return {
      valid: false,
      error: `Bid must be at least ${nextMinBid.toFixed(2)} CHF (minimum increment: ${minIncrement.toFixed(2)} CHF)`,
      nextMinBid
    }
  }
  
  return { valid: true, nextMinBid }
}

export function validateAuctionStatus(
  auctionEndTime: string,
  auctionStatus: string
): { valid: boolean; error?: string } {
  const now = new Date()
  const endTime = new Date(auctionEndTime)
  
  if (auctionStatus !== 'active') {
    return {
      valid: false,
      error: "Auction is not active and cannot accept bids"
    }
  }
  
  if (endTime <= now) {
    return {
      valid: false,
      error: "Auction has ended and cannot accept new bids"
    }
  }
  
  return { valid: true }
}

export function canRetractBid(
  bidPlacedAt: string,
  auctionEndTime: string,
  bidStatus: string
): { canRetract: boolean; reason?: string } {
  const now = new Date()
  const bidTime = new Date(bidPlacedAt)
  const endTime = new Date(auctionEndTime)
  
  // Can't retract if auction has ended
  if (endTime <= now) {
    return {
      canRetract: false,
      reason: "Cannot retract bids after auction has ended"
    }
  }
  
  // Can't retract if bid is already retracted
  if (bidStatus === BidStatus.RETRACTED) {
    return {
      canRetract: false,
      reason: "Bid has already been retracted"
    }
  }
  
  // Can't retract if bid has won
  if (bidStatus === BidStatus.WON) {
    return {
      canRetract: false,
      reason: "Cannot retract winning bids"
    }
  }
  
  // Can only retract within 5 minutes of placing (Swiss market rule)
  const timeSinceBid = now.getTime() - bidTime.getTime()
  const fiveMinutes = 5 * 60 * 1000
  
  if (timeSinceBid > fiveMinutes) {
    return {
      canRetract: false,
      reason: "Bids can only be retracted within 5 minutes of placement"
    }
  }
  
  return { canRetract: true }
}

// Swiss market specific validation
export function validateSwissUser(profile: any): { valid: boolean; error?: string } {
  if (!profile.phone_verified) {
    return {
      valid: false,
      error: "Phone number must be verified to place bids"
    }
  }
  
  if (!profile.email_verified) {
    return {
      valid: false,
      error: "Email address must be verified to place bids"
    }
  }
  
  if (profile.verification_status !== 'verified') {
    return {
      valid: false,
      error: "User profile must be verified to place bids"
    }
  }
  
  return { valid: true }
}

// Rate limiting helper
export function checkBidRateLimit(
  userBids: Array<{ placed_at: string }>,
  maxBidsPerMinute: number = 5
): { allowed: boolean; error?: string; waitTime?: number } {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
  
  const recentBids = userBids.filter(bid => 
    new Date(bid.placed_at) > oneMinuteAgo
  )
  
  if (recentBids.length >= maxBidsPerMinute) {
    const oldestRecentBid = new Date(Math.min(...recentBids.map(bid => new Date(bid.placed_at).getTime())))
    const waitTime = Math.ceil((oldestRecentBid.getTime() + 60 * 1000 - now.getTime()) / 1000)
    
    return {
      allowed: false,
      error: `Rate limit exceeded. Please wait ${waitTime} seconds before placing another bid.`,
      waitTime
    }
  }
  
  return { allowed: true }
}

// Type exports
export type PlaceBid = z.infer<typeof placeBidSchema>
export type AutoBidSetup = z.infer<typeof autoBidSetupSchema>
export type BidRetraction = z.infer<typeof bidRetractionSchema>
export type AuctionBidsQuery = z.infer<typeof auctionBidsQuerySchema>
export type MyBidsQuery = z.infer<typeof myBidsQuerySchema>
export type BidResponse = z.infer<typeof bidResponseSchema>
export type BidWithDetailsResponse = z.infer<typeof bidWithDetailsResponseSchema>
export type AutoBidResponse = z.infer<typeof autoBidResponseSchema>
export type PaginatedBidsResponse = z.infer<typeof paginatedBidsResponseSchema>
export type BidPlacementResponse = z.infer<typeof bidPlacementResponseSchema>
export type BidRetractionResponse = z.infer<typeof bidRetractionResponseSchema>