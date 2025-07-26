export interface Vehicle {
  id: string
  title: string
  description: string
  price: number
  mileage: number
  year: number
  fuel: "benzyna" | "diesel" | "elektryczny" | "hybrid"
  transmission: "manualna" | "automatyczna"
  bodyType: string
  brand: string
  model: string
  images: string[]
  location: string
  sellerId: string
  sellerName: string
  sellerPhone?: string
  sellerEmail?: string
  category: "auto" | "moto"
  createdAt: string
  updatedAt: string
  isActive: boolean
  views: number
  favorites: number
  features: string[]
  vin?: string
  registrationDate?: string
  technicalInspection?: string
  listingType: "ogłoszenie" | "aukcja"
  auction?: AuctionData
}

export interface AuctionData {
  id: string
  vehicleId: string
  startingBid: number // zawsze 1 CHF
  currentBid: number
  reservePrice: number // ukryta cena
  reserveMet: boolean
  bidCount: number
  endsAt: string // ISO datetime - zawsze 7 dni od utworzenia
  softClose: boolean // zawsze true
  extensionSec: number // zawsze 300 (5 min)
  isActive: boolean
  winner?: {
    bidderId: string
    winningBid: number
    fee: number // min(winningBid * 0.05, 500)
  }
}

export interface Bid {
  id: string
  auctionId: string
  bidderId: string
  bidderName: string // anonimizowane np. "A***r"
  amount: number
  timestamp: string
  isWinning: boolean
  isRetracted: boolean
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: "private" | "dealer"
  dealerInfo?: DealerInfo
  createdAt: string
  isVerified: boolean
  listings: Vehicle[]
  bids: Bid[]
  favorites: string[] // vehicle IDs
  notifications: Notification[]
}

export interface DealerInfo {
  companyName: string
  nip?: string
  address: string
  website?: string
  description?: string
  package: "lite" | "starter" | "pro" | "enterprise"
  packageExpiresAt: string
  listingsLimit: number
  listingsUsed: number
}

export interface Notification {
  id: string
  userId: string
  type: "bid_placed" | "bid_outbid" | "auction_ending" | "auction_won" | "auction_lost" | "listing_viewed"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: any
}

export interface PricingPackage {
  id: string
  name: string
  segment: string
  listingLimit: number | "unlimited"
  billingModel: "subscription" | "pay-per-listing" | "success-fee"
  monthlyPrice?: number
  pricePerListing?: number | "variable"
  successFeePercent?: number
  successFeeCap?: number
  features: string[]
  isPopular?: boolean
}

export interface ContactForm {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  vehicleId?: string
  inquiryType: "general" | "vehicle" | "support" | "dealer"
}

export interface SearchFilters {
  category?: "auto" | "moto"
  listingType?: "ogłoszenie" | "aukcja"
  brand?: string
  model?: string
  priceMin?: number
  priceMax?: number
  yearMin?: number
  yearMax?: number
  mileageMax?: number
  fuel?: string[]
  transmission?: string[]
  location?: string
  sortBy?: "newest" | "price_asc" | "price_desc" | "mileage" | "year"
  page?: number
  limit?: number
}

export interface DashboardStats {
  totalListings: number
  activeListings: number
  totalViews: number
  totalFavorites: number
  activeBids: number
  wonAuctions: number
  totalEarnings?: number
  thisMonthEarnings?: number
  conversionRate?: number
  avgViewsPerListing?: number
}