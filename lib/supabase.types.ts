export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string
          title: string
          price: number
          image_url: string
          category: "moto" | "auto"
          brand: string
          model: string
          year: number
          mileage: number
          fuel_type: string
          location: string
          view_count: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          price: number
          image_url: string
          category: "moto" | "auto"
          brand: string
          model: string
          year: number
          mileage: number
          fuel_type: string
          location: string
          view_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          price?: number
          image_url?: string
          category?: "moto" | "auto"
          brand?: string
          model?: string
          year?: number
          mileage?: number
          fuel_type?: string
          location?: string
          view_count?: number
          created_at?: string
        }
      }
      auctions: {
        Row: {
          id: string
          title: string
          current_bid: number
          image_url: string
          ends_at: string
          view_count: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          current_bid: number
          image_url: string
          ends_at: string
          view_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          current_bid?: number
          image_url?: string
          ends_at?: string
          view_count?: number
          created_at?: string
        }
      }
    }
  }
}
