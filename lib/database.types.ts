export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name_en: string
          name_de: string
          name_fr: string
          name_pl: string
          slug: string
          parent_id: string | null
          description_en: string | null
          description_de: string | null
          description_fr: string | null
          description_pl: string | null
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_de: string
          name_fr: string
          name_pl: string
          slug: string
          parent_id?: string | null
          description_en?: string | null
          description_de?: string | null
          description_fr?: string | null
          description_pl?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_de?: string
          name_fr?: string
          name_pl?: string
          slug?: string
          parent_id?: string | null
          description_en?: string | null
          description_de?: string | null
          description_fr?: string | null
          description_pl?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          name_en: string
          name_de: string
          name_fr: string
          name_pl: string
          description_en: string | null
          description_de: string | null
          description_fr: string | null
          description_pl: string | null
          price_chf: number
          duration_days: number
          features: Json
          max_images: number
          is_featured: boolean
          is_premium: boolean
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_de: string
          name_fr: string
          name_pl: string
          description_en?: string | null
          description_de?: string | null
          description_fr?: string | null
          description_pl?: string | null
          price_chf: number
          duration_days: number
          features?: Json
          max_images?: number
          is_featured?: boolean
          is_premium?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_de?: string
          name_fr?: string
          name_pl?: string
          description_en?: string | null
          description_de?: string | null
          description_fr?: string | null
          description_pl?: string | null
          price_chf?: number
          duration_days?: number
          features?: Json
          max_images?: number
          is_featured?: boolean
          is_premium?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          phone_verified: boolean
          email_verified: boolean
          is_dealer: boolean
          dealer_name: string | null
          dealer_license: string | null
          dealer_vat_number: string | null
          company_address: string | null
          location: string | null
          postal_code: string | null
          canton: string | null
          country: string
          bio: string | null
          website: string | null
          social_links: Json
          preferred_language: string
          notification_preferences: Json
          verification_status: 'pending' | 'verified' | 'rejected'
          verification_documents: Json
          free_listings_used: number
          total_listings: number
          total_sales: number
          rating: number
          rating_count: number
          last_active_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          phone_verified?: boolean
          email_verified?: boolean
          is_dealer?: boolean
          dealer_name?: string | null
          dealer_license?: string | null
          dealer_vat_number?: string | null
          company_address?: string | null
          location?: string | null
          postal_code?: string | null
          canton?: string | null
          country?: string
          bio?: string | null
          website?: string | null
          social_links?: Json
          preferred_language?: string
          notification_preferences?: Json
          verification_status?: 'pending' | 'verified' | 'rejected'
          verification_documents?: Json
          free_listings_used?: number
          total_listings?: number
          total_sales?: number
          rating?: number
          rating_count?: number
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          phone_verified?: boolean
          email_verified?: boolean
          is_dealer?: boolean
          dealer_name?: string | null
          dealer_license?: string | null
          dealer_vat_number?: string | null
          company_address?: string | null
          location?: string | null
          postal_code?: string | null
          canton?: string | null
          country?: string
          bio?: string | null
          website?: string | null
          social_links?: Json
          preferred_language?: string
          notification_preferences?: Json
          verification_status?: 'pending' | 'verified' | 'rejected'
          verification_documents?: Json
          free_listings_used?: number
          total_listings?: number
          total_sales?: number
          rating?: number
          rating_count?: number
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          category_id: string
          package_id: string | null
          title: string
          description: string | null
          brand: string
          model: string
          year: number | null
          mileage: number | null
          engine_capacity: number | null
          power_hp: number | null
          power_kw: number | null
          fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'gas' | 'other' | null
          transmission: 'manual' | 'automatic' | 'semi-automatic' | null
          drivetrain: 'fwd' | 'rwd' | 'awd' | '4wd' | null
          color: string | null
          interior_color: string | null
          vin: string | null
          condition: 'new' | 'used' | 'damaged'
          accident_free: boolean
          owners_count: number
          has_service_book: boolean
          last_service_km: number | null
          last_service_date: string | null
          next_service_due_km: number | null
          next_service_due_date: string | null
          price: number
          currency: 'CHF' | 'EUR' | 'USD'
          price_negotiable: boolean
          financing_available: boolean
          leasing_available: boolean
          location: string
          postal_code: string
          canton: string | null
          country: string
          latitude: number | null
          longitude: number | null
          images: string[]
          video_url: string | null
          features: Json
          equipment: Json
          is_auction: boolean
          auction_end_time: string | null
          min_bid_increment: number
          reserve_price: number | null
          current_bid: number
          bid_count: number
          auto_extend_minutes: number
          status: 'draft' | 'active' | 'sold' | 'expired' | 'suspended'
          views: number
          favorites_count: number
          contact_count: number
          published_at: string | null
          expires_at: string | null
          sold_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          package_id?: string | null
          title: string
          description?: string | null
          brand: string
          model: string
          year?: number | null
          mileage?: number | null
          engine_capacity?: number | null
          power_hp?: number | null
          power_kw?: number | null
          fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'gas' | 'other' | null
          transmission?: 'manual' | 'automatic' | 'semi-automatic' | null
          drivetrain?: 'fwd' | 'rwd' | 'awd' | '4wd' | null
          color?: string | null
          interior_color?: string | null
          vin?: string | null
          condition?: 'new' | 'used' | 'damaged'
          accident_free?: boolean
          owners_count?: number
          has_service_book?: boolean
          last_service_km?: number | null
          last_service_date?: string | null
          next_service_due_km?: number | null
          next_service_due_date?: string | null
          price: number
          currency?: 'CHF' | 'EUR' | 'USD'
          price_negotiable?: boolean
          financing_available?: boolean
          leasing_available?: boolean
          location: string
          postal_code: string
          canton?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          images?: string[]
          video_url?: string | null
          features?: Json
          equipment?: Json
          is_auction?: boolean
          auction_end_time?: string | null
          min_bid_increment?: number
          reserve_price?: number | null
          current_bid?: number
          bid_count?: number
          auto_extend_minutes?: number
          status?: 'draft' | 'active' | 'sold' | 'expired' | 'suspended'
          views?: number
          favorites_count?: number
          contact_count?: number
          published_at?: string | null
          expires_at?: string | null
          sold_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          package_id?: string | null
          title?: string
          description?: string | null
          brand?: string
          model?: string
          year?: number | null
          mileage?: number | null
          engine_capacity?: number | null
          power_hp?: number | null
          power_kw?: number | null
          fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'gas' | 'other' | null
          transmission?: 'manual' | 'automatic' | 'semi-automatic' | null
          drivetrain?: 'fwd' | 'rwd' | 'awd' | '4wd' | null
          color?: string | null
          interior_color?: string | null
          vin?: string | null
          condition?: 'new' | 'used' | 'damaged'
          accident_free?: boolean
          owners_count?: number
          has_service_book?: boolean
          last_service_km?: number | null
          last_service_date?: string | null
          next_service_due_km?: number | null
          next_service_due_date?: string | null
          price?: number
          currency?: 'CHF' | 'EUR' | 'USD'
          price_negotiable?: boolean
          financing_available?: boolean
          leasing_available?: boolean
          location?: string
          postal_code?: string
          canton?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          images?: string[]
          video_url?: string | null
          features?: Json
          equipment?: Json
          is_auction?: boolean
          auction_end_time?: string | null
          min_bid_increment?: number
          reserve_price?: number | null
          current_bid?: number
          bid_count?: number
          auto_extend_minutes?: number
          status?: 'draft' | 'active' | 'sold' | 'expired' | 'suspended'
          views?: number
          favorites_count?: number
          contact_count?: number
          published_at?: string | null
          expires_at?: string | null
          sold_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      auctions: {
        Row: {
          id: string
          listing_id: string
          starting_price: number
          reserve_met: boolean
          winner_id: string | null
          winning_bid: number | null
          total_bids: number
          unique_bidders: number
          extended_count: number
          max_extensions: number
          ended_at: string | null
          payment_due_date: string | null
          payment_received: boolean
          pickup_arranged: boolean
          feedback_left: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          starting_price: number
          reserve_met?: boolean
          winner_id?: string | null
          winning_bid?: number | null
          total_bids?: number
          unique_bidders?: number
          extended_count?: number
          max_extensions?: number
          ended_at?: string | null
          payment_due_date?: string | null
          payment_received?: boolean
          pickup_arranged?: boolean
          feedback_left?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          starting_price?: number
          reserve_met?: boolean
          winner_id?: string | null
          winning_bid?: number | null
          total_bids?: number
          unique_bidders?: number
          extended_count?: number
          max_extensions?: number
          ended_at?: string | null
          payment_due_date?: string | null
          payment_received?: boolean
          pickup_arranged?: boolean
          feedback_left?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bids: {
        Row: {
          id: string
          listing_id: string
          auction_id: string
          user_id: string
          amount: number
          is_auto_bid: boolean
          max_auto_bid: number | null
          auto_bid_active: boolean
          status: 'active' | 'outbid' | 'winning' | 'won' | 'lost' | 'retracted'
          ip_address: string | null
          user_agent: string | null
          placed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          auction_id: string
          user_id: string
          amount: number
          is_auto_bid?: boolean
          max_auto_bid?: number | null
          auto_bid_active?: boolean
          status?: 'active' | 'outbid' | 'winning' | 'won' | 'lost' | 'retracted'
          ip_address?: string | null
          user_agent?: string | null
          placed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          auction_id?: string
          user_id?: string
          amount?: number
          is_auto_bid?: boolean
          max_auto_bid?: number | null
          auto_bid_active?: boolean
          status?: 'active' | 'outbid' | 'winning' | 'won' | 'lost' | 'retracted'
          ip_address?: string | null
          user_agent?: string | null
          placed_at?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          listing_id: string | null
          package_id: string | null
          amount: number
          currency: 'CHF' | 'EUR' | 'USD'
          commission_rate: number
          commission_amount: number
          max_commission: number
          payment_method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'twint' | 'postfinance' | null
          payment_provider: string | null
          payment_provider_id: string | null
          payment_type: 'listing_fee' | 'commission' | 'premium_package' | 'featured_listing' | 'refund'
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          description: string | null
          metadata: Json
          failure_reason: string | null
          processed_at: string | null
          completed_at: string | null
          failed_at: string | null
          refunded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id?: string | null
          package_id?: string | null
          amount: number
          currency?: 'CHF' | 'EUR' | 'USD'
          commission_rate?: number
          commission_amount?: number
          max_commission?: number
          payment_method?: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'twint' | 'postfinance' | null
          payment_provider?: string | null
          payment_provider_id?: string | null
          payment_type: 'listing_fee' | 'commission' | 'premium_package' | 'featured_listing' | 'refund'
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          description?: string | null
          metadata?: Json
          failure_reason?: string | null
          processed_at?: string | null
          completed_at?: string | null
          failed_at?: string | null
          refunded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string | null
          package_id?: string | null
          amount?: number
          currency?: 'CHF' | 'EUR' | 'USD'
          commission_rate?: number
          commission_amount?: number
          max_commission?: number
          payment_method?: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'twint' | 'postfinance' | null
          payment_provider?: string | null
          payment_provider_id?: string | null
          payment_type?: 'listing_fee' | 'commission' | 'premium_package' | 'featured_listing' | 'refund'
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          description?: string | null
          metadata?: Json
          failure_reason?: string | null
          processed_at?: string | null
          completed_at?: string | null
          failed_at?: string | null
          refunded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          category: 'general_inquiry' | 'listing_inquiry' | 'technical_support' | 'billing_support' | 'account_issues' | 'partnership' | 'legal_compliance'
          listing_id: string | null
          language: 'de' | 'fr' | 'pl' | 'en'
          status: 'new' | 'read' | 'responded' | 'closed'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          assigned_to: string | null
          response_count: number
          last_response_at: string | null
          ip_address: string | null
          user_agent: string | null
          recaptcha_score: number | null
          recaptcha_action: string | null
          submission_count: number
          metadata: Json
          created_at: string
          updated_at: string
          read_at: string | null
          responded_at: string | null
          closed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          category: 'general_inquiry' | 'listing_inquiry' | 'technical_support' | 'billing_support' | 'account_issues' | 'partnership' | 'legal_compliance'
          listing_id?: string | null
          language?: 'de' | 'fr' | 'pl' | 'en'
          status?: 'new' | 'read' | 'responded' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          assigned_to?: string | null
          response_count?: number
          last_response_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
          recaptcha_score?: number | null
          recaptcha_action?: string | null
          submission_count?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
          read_at?: string | null
          responded_at?: string | null
          closed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          category?: 'general_inquiry' | 'listing_inquiry' | 'technical_support' | 'billing_support' | 'account_issues' | 'partnership' | 'legal_compliance'
          listing_id?: string | null
          language?: 'de' | 'fr' | 'pl' | 'en'
          status?: 'new' | 'read' | 'responded' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          assigned_to?: string | null
          response_count?: number
          last_response_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
          recaptcha_score?: number | null
          recaptcha_action?: string | null
          submission_count?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
          read_at?: string | null
          responded_at?: string | null
          closed_at?: string | null
        }
      }
      contact_responses: {
        Row: {
          id: string
          contact_message_id: string
          responder_id: string | null
          response_text: string
          response_type: 'email' | 'phone' | 'internal_note'
          email_sent: boolean
          email_sent_at: string | null
          email_delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_message_id: string
          responder_id?: string | null
          response_text: string
          response_type?: 'email' | 'phone' | 'internal_note'
          email_sent?: boolean
          email_sent_at?: string | null
          email_delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_message_id?: string
          responder_id?: string | null
          response_text?: string
          response_type?: 'email' | 'phone' | 'internal_note'
          email_sent?: boolean
          email_sent_at?: string | null
          email_delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_commission: {
        Args: {
          sale_amount: number
          rate?: number
          max_commission?: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type Category = Tables<'categories'>
export type Package = Tables<'packages'>
export type Profile = Tables<'profiles'>
export type Listing = Tables<'listings'>
export type Auction = Tables<'auctions'>
export type Bid = Tables<'bids'>
export type Payment = Tables<'payments'>
export type ContactMessage = Tables<'contact_messages'>
export type ContactResponse = Tables<'contact_responses'>

// Insert types
export type CategoryInsert = TablesInsert<'categories'>
export type PackageInsert = TablesInsert<'packages'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ListingInsert = TablesInsert<'listings'>
export type AuctionInsert = TablesInsert<'auctions'>
export type BidInsert = TablesInsert<'bids'>
export type PaymentInsert = TablesInsert<'payments'>
export type ContactMessageInsert = TablesInsert<'contact_messages'>
export type ContactResponseInsert = TablesInsert<'contact_responses'>

// Update types
export type CategoryUpdate = TablesUpdate<'categories'>
export type PackageUpdate = TablesUpdate<'packages'>
export type ProfileUpdate = TablesUpdate<'profiles'>
export type ListingUpdate = TablesUpdate<'listings'>
export type AuctionUpdate = TablesUpdate<'auctions'>
export type BidUpdate = TablesUpdate<'bids'>
export type PaymentUpdate = TablesUpdate<'payments'>
export type ContactMessageUpdate = TablesUpdate<'contact_messages'>
export type ContactResponseUpdate = TablesUpdate<'contact_responses'>

// Extended types with relationships
export type ListingWithDetails = Listing & {
  profiles: Profile
  categories: Category
  packages?: Package
  auctions?: Auction
  bids?: Bid[]
}

export type AuctionWithDetails = Auction & {
  listings: Listing
  profiles?: Profile
  bids: Bid[]
}

export type BidWithDetails = Bid & {
  profiles: Profile
  listings: Listing
}

export type ProfileWithStats = Profile & {
  listings_count: number
  active_listings_count: number
  sold_listings_count: number
  total_bids: number
  won_auctions: number
}

// Enums for better type safety
export const FuelType = {
  PETROL: 'petrol',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid',
  GAS: 'gas',
  OTHER: 'other'
} as const

export const TransmissionType = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
  SEMI_AUTOMATIC: 'semi-automatic'
} as const

export const VehicleCondition = {
  NEW: 'new',
  USED: 'used',
  DAMAGED: 'damaged'
} as const

export const ListingStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SOLD: 'sold',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended'
} as const

export const BidStatus = {
  ACTIVE: 'active',
  OUTBID: 'outbid',
  WINNING: 'winning',
  WON: 'won',
  LOST: 'lost',
  RETRACTED: 'retracted'
} as const

export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const

export const PaymentType = {
  LISTING_FEE: 'listing_fee',
  COMMISSION: 'commission',
  PREMIUM_PACKAGE: 'premium_package',
  FEATURED_LISTING: 'featured_listing',
  REFUND: 'refund'
} as const

export const Currency = {
  CHF: 'CHF',
  EUR: 'EUR',
  USD: 'USD'
} as const

export const Language = {
  DE: 'de',
  FR: 'fr',
  PL: 'pl',
  EN: 'en'
} as const

// Contact-specific enums
export const ContactCategory = {
  GENERAL_INQUIRY: 'general_inquiry',
  LISTING_INQUIRY: 'listing_inquiry',
  TECHNICAL_SUPPORT: 'technical_support',
  BILLING_SUPPORT: 'billing_support',
  ACCOUNT_ISSUES: 'account_issues',
  PARTNERSHIP: 'partnership',
  LEGAL_COMPLIANCE: 'legal_compliance'
} as const

export const ContactStatus = {
  NEW: 'new',
  READ: 'read',
  RESPONDED: 'responded',
  CLOSED: 'closed'
} as const

export const ContactPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

export const ResponseType = {
  EMAIL: 'email',
  PHONE: 'phone',
  INTERNAL_NOTE: 'internal_note'
} as const

export const EmailDeliveryStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  BOUNCED: 'bounced'
} as const

// Extended contact types with relationships
export type ContactMessageWithDetails = ContactMessage & {
  profiles?: Profile
  listings?: Listing
  contact_responses?: ContactResponse[]
}

export type ContactResponseWithDetails = ContactResponse & {
  contact_messages: ContactMessage
  profiles?: Profile
}