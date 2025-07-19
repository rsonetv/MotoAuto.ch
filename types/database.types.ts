export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          email_verified: boolean
          is_dealer: boolean
          dealer_name: string | null
          dealer_license: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          email_verified?: boolean
          is_dealer?: boolean
          dealer_name?: string | null
          dealer_license?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          email_verified?: boolean
          is_dealer?: boolean
          dealer_name?: string | null
          dealer_license?: string | null
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: number
          user_id: string
          title: string
          description: string | null
          price: number
          current_bid: number | null
          category: "auto" | "moto"
          brand: string
          model: string
          year: number | null
          mileage: number | null
          engine_capacity: number | null
          power: number | null
          fuel_type: string | null
          transmission: string | null
          drive_type: string | null
          body_type: string | null
          doors: number | null
          seats: number | null
          color: string | null
          vin: string | null
          condition: string | null
          accident_free: boolean
          owners_count: number
          has_service_book: boolean
          last_service_date: string | null
          next_service_due: number | null
          location: string
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          images: string[] | null
          documents: string[] | null
          video_url: string | null
          is_auction: boolean
          auction_start_time: string | null
          auction_end_time: string | null
          reserve_price: number | null
          buy_now_price: number | null
          min_bid_increment: number
          auto_extend: boolean
          warranty_months: number | null
          financing_available: boolean
          trade_in_accepted: boolean
          delivery_available: boolean
          status: "active" | "sold" | "expired" | "draft"
          views: number
          favorites_count: number
          featured: boolean
          featured_until: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          sold_at: string | null
        }
        Insert: {
          user_id: string
          title: string
          description?: string | null
          price: number
          current_bid?: number | null
          category: "auto" | "moto"
          brand: string
          model: string
          year?: number | null
          mileage?: number | null
          engine_capacity?: number | null
          power?: number | null
          fuel_type?: string | null
          transmission?: string | null
          drive_type?: string | null
          body_type?: string | null
          doors?: number | null
          seats?: number | null
          color?: string | null
          vin?: string | null
          condition?: string | null
          accident_free?: boolean
          owners_count?: number
          has_service_book?: boolean
          last_service_date?: string | null
          next_service_due?: number | null
          location: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          images?: string[] | null
          documents?: string[] | null
          video_url?: string | null
          is_auction?: boolean
          auction_start_time?: string | null
          auction_end_time?: string | null
          reserve_price?: number | null
          buy_now_price?: number | null
          min_bid_increment?: number
          auto_extend?: boolean
          warranty_months?: number | null
          financing_available?: boolean
          trade_in_accepted?: boolean
          delivery_available?: boolean
          status?: "active" | "sold" | "expired" | "draft"
          views?: number
          favorites_count?: number
          featured?: boolean
          featured_until?: string | null
          published_at?: string | null
        }
        Update: {
          user_id?: string
          title?: string
          description?: string | null
          price?: number
          current_bid?: number | null
          category?: "auto" | "moto"
          brand?: string
          model?: string
          year?: number | null
          mileage?: number | null
          engine_capacity?: number | null
          power?: number | null
          fuel_type?: string | null
          transmission?: string | null
          drive_type?: string | null
          body_type?: string | null
          doors?: number | null
          seats?: number | null
          color?: string | null
          vin?: string | null
          condition?: string | null
          accident_free?: boolean
          owners_count?: number
          has_service_book?: boolean
          last_service_date?: string | null
          next_service_due?: number | null
          location?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          images?: string[] | null
          documents?: string[] | null
          video_url?: string | null
          is_auction?: boolean
          auction_start_time?: string | null
          auction_end_time?: string | null
          reserve_price?: number | null
          buy_now_price?: number | null
          min_bid_increment?: number
          auto_extend?: boolean
          warranty_months?: number | null
          financing_available?: boolean
          trade_in_accepted?: boolean
          delivery_available?: boolean
          status?: "active" | "sold" | "expired" | "draft"
          views?: number
          favorites_count?: number
          featured?: boolean
          featured_until?: string | null
          updated_at?: string
          published_at?: string | null
          sold_at?: string | null
        }
      }
      bids: {
        Row: {
          id: number
          listing_id: number
          user_id: string
          amount: number
          is_auto_bid: boolean
          max_auto_bid: number | null
          placed_at: string
        }
        Insert: {
          listing_id: number
          user_id: string
          amount: number
          is_auto_bid?: boolean
          max_auto_bid?: number | null
          placed_at?: string
        }
        Update: {
          listing_id?: number
          user_id?: string
          amount?: number
          is_auto_bid?: boolean
          max_auto_bid?: number | null
          placed_at?: string
        }
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          listing_id: number
          created_at: string
        }
        Insert: {
          user_id: string
          listing_id: number
          created_at?: string
        }
        Update: {
          user_id?: string
          listing_id?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

export type Profile = Tables<"profiles">
export type Listing = Tables<"listings">
export type Bid = Tables<"bids">
export type Favorite = Tables<"favorites">

export type NewProfile = TablesInsert<"profiles">
export type NewListing = TablesInsert<"listings">
export type NewBid = TablesInsert<"bids">
export type NewFavorite = TablesInsert<"favorites">

export type UpdateProfile = TablesUpdate<"profiles">
export type UpdateListing = TablesUpdate<"listings">
export type UpdateBid = TablesUpdate<"bids">
export type UpdateFavorite = TablesUpdate<"favorites">
