export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
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
          email_verified: boolean
          phone_verified: boolean
          is_dealer: boolean
          dealer_name: string | null
          dealer_license: string | null
          location: string | null
          postal_code: string | null
          bio: string | null
          website: string | null
          social_links: Record<string, any>
          preferences: Record<string, any>
          verification_status: "pending" | "verified" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string  // Must match users.id (FK)
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          is_dealer?: boolean
          dealer_name?: string | null
          dealer_license?: string | null
          location?: string | null
          postal_code?: string | null
          bio?: string | null
          website?: string | null
          social_links?: Record<string, any>
          preferences?: Record<string, any>
          verification_status?: "pending" | "verified" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          is_dealer?: boolean
          dealer_name?: string | null
          dealer_license?: string | null
          location?: string | null
          postal_code?: string | null
          bio?: string | null
          website?: string | null
          social_links?: Record<string, any>
          preferences?: Record<string, any>
          verification_status?: "pending" | "verified" | "rejected"
          created_at?: string
          updated_at?: string
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
          color: string | null
          location: string
          images: string[] | null
          is_auction: boolean
          auction_end_time: string | null
          current_bid: number | null
          min_increment: number | null
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
          color?: string | null
          location: string
          images?: string[] | null
          is_auction?: boolean
          auction_end_time?: string | null
          current_bid?: number | null
          min_increment?: number | null
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
          color?: string | null
          location?: string
          images?: string[] | null
          is_auction?: boolean
          auction_end_time?: string | null
          current_bid?: number | null
          min_increment?: number | null
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
    Views: {}
    Functions: {}
    Enums: {}
  }
}
