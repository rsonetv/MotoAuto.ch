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
