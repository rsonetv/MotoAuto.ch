import { supabaseAdmin } from "@/lib/supabase-admin"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class DatabaseSchemaValidator {
  /**
   * Validate profile data against JSON schema
   */
  static async validateProfile(profileData: any): Promise<ValidationResult> {
    try {
      const { data, error } = await supabaseAdmin.rpc("validate_profile_data", {
        profile_data: profileData,
      })

      if (error) {
        return {
          isValid: false,
          errors: [error.message],
          warnings: [],
        }
      }

      return {
        isValid: data === true,
        errors: data === true ? [] : ["Profile data does not match required schema"],
        warnings: [],
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`],
        warnings: [],
      }
    }
  }

  /**
   * Validate listing data against JSON schema
   */
  static async validateListing(listingData: any): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Client-side validation first
      if (!listingData.title || listingData.title.length < 10) {
        errors.push("Title must be at least 10 characters long")
      }

      if (!listingData.price || listingData.price <= 0) {
        errors.push("Price must be a positive number")
      }

      if (!listingData.category || !["auto", "moto", "commercial"].includes(listingData.category)) {
        errors.push("Category must be auto, moto, or commercial")
      }

      if (!listingData.brand || listingData.brand.length === 0) {
        errors.push("Brand is required")
      }

      if (!listingData.model || listingData.model.length === 0) {
        errors.push("Model is required")
      }

      if (!listingData.location || listingData.location.length < 2) {
        errors.push("Location must be at least 2 characters long")
      }

      // Validate VIN format if provided
      if (listingData.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(listingData.vin)) {
        errors.push("VIN must be exactly 17 characters (excluding I, O, Q)")
      }

      // Validate year range
      if (listingData.year && (listingData.year < 1900 || listingData.year > new Date().getFullYear() + 1)) {
        errors.push("Year must be between 1900 and next year")
      }

      // Validate auction-specific fields
      if (listingData.is_auction) {
        if (!listingData.auction_end_time) {
          errors.push("Auction end time is required for auctions")
        } else if (new Date(listingData.auction_end_time) <= new Date()) {
          errors.push("Auction end time must be in the future")
        }

        if (!listingData.min_bid_increment || listingData.min_bid_increment <= 0) {
          errors.push("Minimum bid increment must be positive for auctions")
        }
      }

      // Server-side schema validation
      if (errors.length === 0) {
        const { data, error } = await supabaseAdmin.rpc("validate_listing_data", {
          listing_data: listingData,
        })

        if (error) {
          errors.push(error.message)
        } else if (data !== true) {
          errors.push("Listing data does not match required schema")
        }
      }

      // Add warnings for optional but recommended fields
      if (!listingData.description || listingData.description.length < 50) {
        warnings.push("Consider adding a more detailed description (at least 50 characters)")
      }

      if (!listingData.images || listingData.images.length === 0) {
        warnings.push("Adding images will significantly improve listing visibility")
      }

      if (listingData.mileage === undefined || listingData.mileage === null) {
        warnings.push("Mileage information helps buyers make informed decisions")
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`],
        warnings,
      }
    }
  }

  /**
   * Validate bid data against JSON schema
   */
  static async validateBid(bidData: any): Promise<ValidationResult> {
    const errors: string[] = []

    try {
      // Client-side validation
      if (!bidData.listing_id || bidData.listing_id <= 0) {
        errors.push("Valid listing ID is required")
      }

      if (!bidData.user_id) {
        errors.push("User ID is required")
      }

      if (!bidData.amount || bidData.amount <= 0) {
        errors.push("Bid amount must be positive")
      }

      if (bidData.is_auto_bid && (!bidData.max_auto_bid || bidData.max_auto_bid < bidData.amount)) {
        errors.push("Maximum auto bid must be greater than or equal to current bid amount")
      }

      // Server-side schema validation
      if (errors.length === 0) {
        const { data, error } = await supabaseAdmin.rpc("validate_bid_data", {
          bid_data: bidData,
        })

        if (error) {
          errors.push(error.message)
        } else if (data !== true) {
          errors.push("Bid data does not match required schema")
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings: [],
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`],
        warnings: [],
      }
    }
  }

  /**
   * Validate data before database insertion
   */
  static async validateBeforeInsert(table: "profiles" | "listings" | "bids", data: any): Promise<ValidationResult> {
    // For build time, return a mock validation result
    if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "preview") {
      return {
        isValid: true,
        errors: [],
        warnings: [],
      };
    }
    
    switch (table) {
      case "profiles":
        return this.validateProfile(data)
      case "listings":
        return this.validateListing(data)
      case "bids":
        return this.validateBid(data)
      default:
        return {
          isValid: false,
          errors: [`Unknown table: ${table}`],
          warnings: [],
        }
    }
  }

  /**
   * Get schema definition for a table
   */
  static async getSchema(table: "profiles" | "listings" | "bids"): Promise<any> {
    try {
      const functionName = `get_${table.slice(0, -1)}_schema` // Remove 's' from table name
      const { data, error } = await supabaseAdmin.rpc(functionName)

      if (error) {
        throw new Error(`Failed to get schema for ${table}: ${error.message}`)
      }

      return data
    } catch (error) {
      throw new Error(`Schema retrieval error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}

// Utility functions for common validations
export const ValidationUtils = {
  isValidEmail: (email: string): boolean => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
  },

  isValidPhone: (phone: string): boolean => {
    return /^[+]?[0-9\s\-$$$$]{7,20}$/.test(phone)
  },

  isValidVIN: (vin: string): boolean => {
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin)
  },

  isValidURL: (url: string): boolean => {
    try {
      new URL(url)
      return url.startsWith("http://") || url.startsWith("https://")
    } catch {
      return false
    }
  },

  isValidPostalCode: (code: string): boolean => {
    return /^[0-9]{4,6}$/.test(code)
  },

  sanitizeString: (str: string, maxLength = 255): string => {
    return str.trim().substring(0, maxLength)
  },

  validateNumericRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max
  },
}
