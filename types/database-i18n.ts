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
          name_translations: Json | null
          description_translations: Json | null
          slug: string
          parent_id: string | null
          sort_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_translations?: Json | null
          description_translations?: Json | null
          slug: string
          parent_id?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_translations?: Json | null
          description_translations?: Json | null
          slug?: string
          parent_id?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      listings: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title_translations: Json | null
          description_translations: Json | null
          price: number
          currency: string
          brand: string
          model: string
          year: number
          mileage: number | null
          fuel_type: string | null
          transmission: string | null
          body_type: string | null
          color: string | null
          doors: number | null
          seats: number | null
          engine_size: number | null
          power: number | null
          consumption: number | null
          location: string
          canton: string | null
          postal_code: string | null
          coordinates: Json | null
          images: Json | null
          video_url: string | null
          features: Json | null
          condition: string
          accident_history: boolean
          service_history: Json | null
          financing_available: boolean
          leasing_available: boolean
          trade_in_accepted: boolean
          warranty_months: number | null
          first_registration: string | null
          last_inspection: string | null
          emission_sticker: string | null
          is_auction: boolean
          auction_end_time: string | null
          reserve_price: number | null
          current_bid: number | null
          bid_count: number
          auto_extend: boolean
          extension_count: number
          max_extensions: number
          bid_increment: number | null
          status: string
          views: number
          favorites_count: number
          published_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          title_translations?: Json | null
          description_translations?: Json | null
          price: number
          currency?: string
          brand: string
          model: string
          year: number
          mileage?: number | null
          fuel_type?: string | null
          transmission?: string | null
          body_type?: string | null
          color?: string | null
          doors?: number | null
          seats?: number | null
          engine_size?: number | null
          power?: number | null
          consumption?: number | null
          location: string
          canton?: string | null
          postal_code?: string | null
          coordinates?: Json | null
          images?: Json | null
          video_url?: string | null
          features?: Json | null
          condition?: string
          accident_history?: boolean
          service_history?: Json | null
          financing_available?: boolean
          leasing_available?: boolean
          trade_in_accepted?: boolean
          warranty_months?: number | null
          first_registration?: string | null
          last_inspection?: string | null
          emission_sticker?: string | null
          is_auction?: boolean
          auction_end_time?: string | null
          reserve_price?: number | null
          current_bid?: number | null
          bid_count?: number
          auto_extend?: boolean
          extension_count?: number
          max_extensions?: number
          bid_increment?: number | null
          status?: string
          views?: number
          favorites_count?: number
          published_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          title_translations?: Json | null
          description_translations?: Json | null
          price?: number
          currency?: string
          brand?: string
          model?: string
          year?: number
          mileage?: number | null
          fuel_type?: string | null
          transmission?: string | null
          body_type?: string | null
          color?: string | null
          doors?: number | null
          seats?: number | null
          engine_size?: number | null
          power?: number | null
          consumption?: number | null
          location?: string
          canton?: string | null
          postal_code?: string | null
          coordinates?: Json | null
          images?: Json | null
          video_url?: string | null
          features?: Json | null
          condition?: string
          accident_history?: boolean
          service_history?: Json | null
          financing_available?: boolean
          leasing_available?: boolean
          trade_in_accepted?: boolean
          warranty_months?: number | null
          first_registration?: string | null
          last_inspection?: string | null
          emission_sticker?: string | null
          is_auction?: boolean
          auction_end_time?: string | null
          reserve_price?: number | null
          current_bid?: number | null
          bid_count?: number
          auto_extend?: boolean
          extension_count?: number
          max_extensions?: number
          bid_increment?: number | null
          status?: string
          views?: number
          favorites_count?: number
          published_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          bio_translations: Json | null
          location: string | null
          canton: string | null
          postal_code: string | null
          website: string | null
          company_name: string | null
          company_vat: string | null
          is_dealer: boolean
          is_verified: boolean
          rating_average: number
          rating_count: number
          total_listings: number
          total_sales: number
          free_listings_used: number
          preferred_language: string
          email_notifications: boolean
          sms_notifications: boolean
          marketing_emails: boolean
          last_active_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          bio_translations?: Json | null
          location?: string | null
          canton?: string | null
          postal_code?: string | null
          website?: string | null
          company_name?: string | null
          company_vat?: string | null
          is_dealer?: boolean
          is_verified?: boolean
          rating_average?: number
          rating_count?: number
          total_listings?: number
          total_sales?: number
          free_listings_used?: number
          preferred_language?: string
          email_notifications?: boolean
          sms_notifications?: boolean
          marketing_emails?: boolean
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          bio_translations?: Json | null
          location?: string | null
          canton?: string | null
          postal_code?: string | null
          website?: string | null
          company_name?: string | null
          company_vat?: string | null
          is_dealer?: boolean
          is_verified?: boolean
          rating_average?: number
          rating_count?: number
          total_listings?: number
          total_sales?: number
          free_listings_used?: number
          preferred_language?: string
          email_notifications?: boolean
          sms_notifications?: boolean
          marketing_emails?: boolean
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      translation_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          field_name: string
          source_language: string
          target_languages: string[]
          translations: Json
          translation_method: string
          quality_score: number | null
          reviewed: boolean
          reviewer_id: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          field_name: string
          source_language: string
          target_languages: string[]
          translations: Json
          translation_method?: string
          quality_score?: number | null
          reviewed?: boolean
          reviewer_id?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          field_name?: string
          source_language?: string
          target_languages?: string[]
          translations?: Json
          translation_method?: string
          quality_score?: number | null
          reviewed?: boolean
          reviewer_id?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_logs_reviewer_id_fkey"
            columns: ["reviewer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      listings_multilingual: {
        Row: {
          id: string | null
          title_pl: string | null
          title_de: string | null
          title_fr: string | null
          title_en: string | null
          title_it: string | null
          description_pl: string | null
          description_de: string | null
          description_fr: string | null
          description_en: string | null
          description_it: string | null
          price: number | null
          currency: string | null
          brand: string | null
          model: string | null
          year: number | null
          location: string | null
          status: string | null
          created_at: string | null
        }
      }
    }
    Functions: {
      get_translation: {
        Args: {
          translations: Json
          locale: string
        }
        Returns: string
      }
      set_translation: {
        Args: {
          translations: Json
          locale: string
          value: string
        }
        Returns: Json
      }
    }
  }
}

// Helper types for better TypeScript experience
export type Listing = Database['public']['Tables']['listings']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type TranslationLog = Database['public']['Tables']['translation_logs']['Row'];

export type ListingInsert = Database['public']['Tables']['listings']['Insert'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export type ListingUpdate = Database['public']['Tables']['listings']['Update'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Translations interface for JSONB fields
export interface TranslationObject {
  pl?: string;
  de?: string;
  fr?: string;
  en?: string;
  it?: string;
  [key: string]: string | undefined;
}

// Extended types with computed translation fields
export interface LocalizedListing extends Omit<Listing, 'title_translations' | 'description_translations'> {
  title: string;
  description: string;
  title_translations: TranslationObject | null;
  description_translations: TranslationObject | null;
  category_name?: string;
}

export interface LocalizedCategory extends Omit<Category, 'name_translations' | 'description_translations'> {
  name: string;
  description: string;
  name_translations: TranslationObject | null;
  description_translations: TranslationObject | null;
}

export interface LocalizedProfile extends Omit<Profile, 'bio_translations'> {
  bio: string;
  bio_translations: TranslationObject | null;
}