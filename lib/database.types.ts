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
      auction_edits: {
        Row: {
          id: string
          listing_id: string
          user_id: string
          field_name: string
          old_value: string | null
          new_value: string | null
          edited_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id: string
          field_name: string
          old_value?: string | null
          new_value?: string | null
          edited_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string
          field_name?: string
          old_value?: string | null
          new_value?: string | null
          edited_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          dealer_name: string | null
          is_dealer: boolean | null
          is_verified: boolean | null
          avatar_url: string | null
          phone: string | null
          location: string | null
          canton: string | null
          postal_code: string | null
          bio: string | null
          website: string | null
          vat_number: string | null
          dealer_license: string | null
          rating: number | null
          total_sales: number | null
          free_listings_used: number | null
          current_package_id: string | null
          package_expires_at: string | null
          email_notifications: boolean | null
          sms_notifications: boolean | null
          marketing_emails: boolean | null
          bid_notifications: boolean | null
          listing_updates: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          // ... other fields
        }
        Update: {
          id?: string
          // ... other fields
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          name_de: string | null
          name_fr: string | null
          name_en: string | null
          slug: string
          description: string | null
          icon: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          // ...
        }
        Update: {
          // ...
        }
      }
      packages: {
        Row: {
          id: string
          name: string
          // ... other fields
        }
        Insert: {
          // ...
        }
        Update: {
          // ...
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          package_id: string | null
          title: string
          description: string | null
          brand: string
          model: string
          year: number
          price: number
          currency: string
          mileage: number | null
          fuel_type: string | null
          transmission: string | null
          condition: string | null
          location: string | null
          canton: string | null
          postal_code: string | null
          images: string[] | null
          status: string
          sale_type: string
          views: number | null
          contact_count: number | null
          is_featured: boolean | null
          expires_at: string | null
          created_at: string
          updated_at: string
          starting_price: number | null
          reserve_price: number | null
          current_bid: number | null
          auction_end_time: string | null
          bid_count: number | null
          is_reserve_met: boolean | null
        }
        Insert: {
          // ...
        }
        Update: {
          // ...
        }
      }
      bids: {
        Row: {
          id: string
          listing_id: string
          user_id: string
          amount: number
          max_bid: number | null
          is_auto_bid: boolean | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          // ...
        }
        Update: {
          // ...
        }
      }
      payments: {
        Row: {
          id: string
          // ... other fields
        }
        Insert: {
          // ...
        }
        Update: {
          // ...
        }
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          // ...
        }
        Update: {
          // ...
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_updated_at: {
        Args: {}
        Returns: unknown
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