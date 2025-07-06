export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          email_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          email_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          email_verified?: boolean
          created_at?: string
        }
      }
      listings: {
        Row: {
          id: number
          user_id: string
          title: string
          description: string
          price: number
          category: string
          brand: string | null
          model: string | null
          year: number | null
          mileage: number | null
          fuel_type: string | null
          transmission: string | null
          location: string
          images: string[]
          is_auction: boolean
          auction_end_time: string | null
          current_bid: number | null
          min_increment: number
          buy_now_price: number | null
          status: "active" | "sold" | "expired"
          views: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          description: string
          price: number
          category: string
          brand?: string | null
          model?: string | null
          year?: number | null
          mileage?: number | null
          fuel_type?: string | null
          transmission?: string | null
          location: string
          images?: string[]
          is_auction?: boolean
          auction_end_time?: string | null
          current_bid?: number | null
          min_increment?: number
          buy_now_price?: number | null
          status?: "active" | "sold" | "expired"
          views?: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          description?: string
          price?: number
          category?: string
          brand?: string | null
          model?: string | null
          year?: number | null
          mileage?: number | null
          fuel_type?: string | null
          transmission?: string | null
          location?: string
          images?: string[]
          is_auction?: boolean
          auction_end_time?: string | null
          current_bid?: number | null
          min_increment?: number
          buy_now_price?: number | null
          status?: "active" | "sold" | "expired"
          views?: number
          created_at?: string
        }
      }
      bids: {
        Row: {
          id: number
          listing_id: number
          user_id: string
          amount: number
          placed_at: string
        }
        Insert: {
          id?: number
          listing_id: number
          user_id: string
          amount: number
          placed_at?: string
        }
        Update: {
          id?: number
          listing_id?: number
          user_id?: string
          amount?: number
          placed_at?: string
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

// Helper types for easier usage
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Listing = Database["public"]["Tables"]["listings"]["Row"]
export type Bid = Database["public"]["Tables"]["bids"]["Row"]

export type NewProfile = Database["public"]["Tables"]["profiles"]["Insert"]
export type NewListing = Database["public"]["Tables"]["listings"]["Insert"]
export type NewBid = Database["public"]["Tables"]["bids"]["Insert"]

export type UpdateProfile = Database["public"]["Tables"]["profiles"]["Update"]
export type UpdateListing = Database["public"]["Tables"]["listings"]["Update"]
export type UpdateBid = Database["public"]["Tables"]["bids"]["Update"]
