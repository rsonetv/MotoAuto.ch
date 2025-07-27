import { z } from "zod"
import { FuelType, TransmissionType, VehicleCondition, ListingStatus, Currency } from "@/lib/database.types"

// Base listing object schema (without refinements)
const baseListingSchema = z.object({
  // Required fields
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),
  brand: z
    .string()
    .min(1, "Brand is required")
    .max(50, "Brand cannot exceed 50 characters"),
  model: z
    .string()
    .min(1, "Model is required")
    .max(50, "Model cannot exceed 50 characters"),
  category_id: z
    .string()
    .uuid("Invalid category ID format"),
  price: z
    .number()
    .positive("Price must be positive")
    .max(10000000, "Price cannot exceed 10,000,000"),
  currency: z
    .enum([Currency.CHF, Currency.EUR, Currency.USD])
    .default(Currency.CHF),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location cannot exceed 100 characters"),
  postal_code: z
    .string()
    .min(4, "Postal code must be at least 4 characters")
    .max(10, "Postal code cannot exceed 10 characters"),
  country: z
    .string()
    .min(2, "Country code must be at least 2 characters")
    .max(3, "Country code cannot exceed 3 characters")
    .default("CH"),

  // Optional vehicle details
  year: z
    .number()
    .int()
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future")
    .optional(),
  mileage: z
    .number()
    .int()
    .min(0, "Mileage cannot be negative")
    .max(2000000, "Mileage seems unrealistic")
    .optional(),
  engine_capacity: z
    .number()
    .positive("Engine capacity must be positive")
    .max(20000, "Engine capacity seems unrealistic")
    .optional(),
  power_hp: z
    .number()
    .positive("Power must be positive")
    .max(2000, "Power seems unrealistic")
    .optional(),
  power_kw: z
    .number()
    .positive("Power must be positive")
    .max(1500, "Power seems unrealistic")
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
  drivetrain: z
    .enum(["fwd", "rwd", "awd", "4wd"])
    .optional(),
  color: z
    .string()
    .max(30, "Color cannot exceed 30 characters")
    .optional(),
  interior_color: z
    .string()
    .max(30, "Interior color cannot exceed 30 characters")
    .optional(),
  vin: z
    .string()
    .min(17, "VIN must be 17 characters")
    .max(17, "VIN must be 17 characters")
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "Invalid VIN format")
    .optional(),
  condition: z
    .enum([VehicleCondition.NEW, VehicleCondition.USED, VehicleCondition.DAMAGED])
    .default(VehicleCondition.USED),
  accident_free: z.boolean().default(true),
  owners_count: z
    .number()
    .int()
    .min(1, "Must have at least 1 owner")
    .max(20, "Too many owners")
    .default(1),
  has_service_book: z.boolean().default(false),
  last_service_km: z
    .number()
    .int()
    .min(0, "Service mileage cannot be negative")
    .optional(),
  last_service_date: z
    .string()
    .datetime("Invalid service date format")
    .optional(),
  next_service_due_km: z
    .number()
    .int()
    .min(0, "Service due mileage cannot be negative")
    .optional(),
  next_service_due_date: z
    .string()
    .datetime("Invalid service due date format")
    .optional(),

  // Location details
  canton: z
    .string()
    .max(20, "Canton cannot exceed 20 characters")
    .optional(),
  latitude: z
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude")
    .optional(),
  longitude: z
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .optional(),

  // Pricing options
  price_negotiable: z.boolean().default(false),
  financing_available: z.boolean().default(false),
  leasing_available: z.boolean().default(false),

  // Media
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(25, "Maximum 25 images allowed")
    .default([]),
  video_url: z
    .string()
    .url("Invalid video URL")
    .optional(),

  // Features and equipment (JSON fields)
  features: z.record(z.any()).optional(),
  equipment: z.record(z.any()).optional(),

  // Auction fields
  is_auction: z.boolean().default(false),
  auction_end_time: z
    .string()
    .datetime("Invalid auction end time format")
    .optional(),
  min_bid_increment: z
    .number()
    .positive("Minimum bid increment must be positive")
    .default(50),
  reserve_price: z
    .number()
    .positive("Reserve price must be positive")
    .optional(),
  auto_extend_minutes: z
    .number()
    .int()
    .min(1, "Auto extend must be at least 1 minute")
    .max(60, "Auto extend cannot exceed 60 minutes")
    .default(5),

  // Package selection
  package_id: z
    .string()
    .uuid("Invalid package ID format")
    .optional(),
})

// Base listing validation schema with refinements
export const createListingSchema = baseListingSchema
  .refine(
    (data: any) => {
      // If it's an auction, auction_end_time is required
      if (data.is_auction && !data.auction_end_time) {
        return false
      }
      return true
    },
    {
      message: "Auction end time is required for auction listings",
      path: ["auction_end_time"],
    }
  )
  .refine(
    (data: any) => {
      // If auction_end_time is provided, it must be in the future
      if (data.auction_end_time) {
        const endTime = new Date(data.auction_end_time)
        const now = new Date()
        return endTime > now
      }
      return true
    },
    {
      message: "Auction end time must be in the future",
      path: ["auction_end_time"],
    }
  )

// Update listing schema (all fields optional except those that shouldn't change)
export const updateListingSchema = baseListingSchema
  .partial()
  .omit({ category_id: true }) // Category shouldn't be changed after creation
  .extend({
    status: z
      .enum([
        ListingStatus.DRAFT,
        ListingStatus.ACTIVE,
        ListingStatus.SOLD,
        ListingStatus.EXPIRED,
        ListingStatus.SUSPENDED
      ])
      .optional(),
  })

// Query parameters for GET /api/listings
export const listingsQuerySchema = z.object({
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
  is_auction: z
    .string()
    .regex(/^(true|false)$/, "is_auction must be 'true' or 'false'")
    .transform((s: string) => s === "true")
    .optional(),

  // Price range
  price_min: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .transform(Number)
    .refine((n: number) => n >= 0, "Minimum price cannot be negative")
    .optional(),
  price_max: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .transform(Number)
    .refine((n: number) => n >= 0, "Maximum price cannot be negative")
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
      "created_at",
      "price",
      "year",
      "mileage",
      "views",
      "favorites_count",
      "auction_end_time"
    ])
    .default("created_at"),
  sort_order: z
    .enum(["asc", "desc"])
    .default("desc"),

  // Status filter
  status: z
    .enum([
      ListingStatus.DRAFT,
      ListingStatus.ACTIVE,
      ListingStatus.SOLD,
      ListingStatus.EXPIRED,
      ListingStatus.SUSPENDED
    ])
    .default(ListingStatus.ACTIVE),
})
.refine(
  (data: any) => {
    // Validate price range
    if (data.price_min && data.price_max && data.price_min > data.price_max) {
      return false
    }
    return true
  },
  {
    message: "Minimum price cannot be greater than maximum price",
    path: ["price_min"],
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

// Favorite action schema
export const favoriteActionSchema = z.object({
  action: z.enum(["add", "remove"]),
})

// Response schemas for type safety
export const listingResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  brand: z.string(),
  model: z.string(),
  year: z.number().nullable(),
  price: z.number(),
  currency: z.string(),
  location: z.string(),
  images: z.array(z.string()),
  is_auction: z.boolean(),
  auction_end_time: z.string().nullable(),
  current_bid: z.number(),
  bid_count: z.number(),
  views: z.number(),
  favorites_count: z.number(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
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
})

export const paginatedListingsResponseSchema = z.object({
  data: z.array(listingResponseSchema),
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

// Type exports
export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
export type ListingsQuery = z.infer<typeof listingsQuerySchema>
export type FavoriteAction = z.infer<typeof favoriteActionSchema>
export type ListingResponse = z.infer<typeof listingResponseSchema>
export type PaginatedListingsResponse = z.infer<typeof paginatedListingsResponseSchema>