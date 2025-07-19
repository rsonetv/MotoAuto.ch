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
          created_at?: string
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
          fuel_type: string | null
          transmission: string | null
          location: string
          images: string[] | null
          is_auction: boolean
          auction_end_time: string | null
          buy_now_price: number | null
          status: "active" | "sold" | "expired"
          views: number
          created_at: string
          updated_at: string
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
          fuel_type?: string | null
          transmission?: string | null
          location: string
          images?: string[] | null
          is_auction?: boolean
          auction_end_time?: string | null
          buy_now_price?: number | null
          status?: "active" | "sold" | "expired"
          views?: number
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
          fuel_type?: string | null
          transmission?: string | null
          location?: string
          images?: string[] | null
          is_auction?: boolean
          auction_end_time?: string | null
          buy_now_price?: number | null
          status?: "active" | "sold" | "expired"
          views?: number
          updated_at?: string
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
          listing_id: number
          user_id: string
          amount: number
          placed_at?: string
        }
        Update: {
          listing_id?: number
          user_id?: string
          amount?: number
          placed_at?: string
        }
      }
    }
  }
}

export type NewListing = Database["public"]["Tables"]["listings"]["Insert"]
export type UpdateListing = Database["public"]["Tables"]["listings"]["Update"]
export type Listing = Database["public"]["Tables"]["listings"]["Row"]
export type NewBid = Database["public"]["Tables"]["bids"]["Insert"]
export type Bid = Database["public"]["Tables"]["bids"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
