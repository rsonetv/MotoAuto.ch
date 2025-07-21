export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: number
          title: string
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          title: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          title?: string
          content?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          id: number
          title: string
          brand: string
          model: string
          year: number
          price: number
          currency: string
          mileage: number | null
          fuel_type: string
          location: string
          description: string | null
          images: string[] | null
          created_at: string
          updated_at: string
          user_id: string
          status: string
        }
        Insert: {
          id?: never
          title: string
          brand: string
          model: string
          year: number
          price: number
          currency?: string
          mileage?: number | null
          fuel_type: string
          location: string
          description?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
          user_id: string
          status?: string
        }
        Update: {
          id?: never
          title?: string
          brand?: string
          model?: string
          year?: number
          price?: number
          currency?: string
          mileage?: number | null
          fuel_type?: string
          location?: string
          description?: string | null
          images?: string[] | null
          updated_at?: string
          status?: string
        }
        Relationships: []
      }
      auctions: {
        Row: {
          id: number
          vehicle_id: number
          starting_price: number
          current_price: number
          reserve_price: number | null
          end_time: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          vehicle_id: number
          starting_price: number
          current_price?: number
          reserve_price?: number | null
          end_time: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          current_price?: number
          reserve_price?: number | null
          end_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auctions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      fuel_type: "Benzyna" | "Diesel" | "EV" | "Hybryd"
      vehicle_status: "active" | "sold" | "reserved" | "draft"
      auction_status: "active" | "ended" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
