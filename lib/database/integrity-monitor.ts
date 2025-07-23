import { supabaseAdmin } from "@/lib/supabase-admin"
import { DatabaseSchemaValidator } from "./schema-validator"

export interface IntegrityCheckResult {
  tableName: string
  totalRecords: number
  validRecords: number
  invalidRecords: number
  errors: Array<{
    recordId: string | number
    error: string
  }>
}

export class DatabaseIntegrityMonitor {
  /**
   * Perform comprehensive integrity check on all tables
   */
  static async performFullIntegrityCheck(): Promise<IntegrityCheckResult[]> {
    const results: IntegrityCheckResult[] = []

    try {
      // Check profiles table
      const profilesResult = await this.checkTableIntegrity("profiles")
      results.push(profilesResult)

      // Check listings table
      const listingsResult = await this.checkTableIntegrity("listings")
      results.push(listingsResult)

      // Check bids table
      const bidsResult = await this.checkTableIntegrity("bids")
      results.push(bidsResult)

      // Check favorites table
      const favoritesResult = await this.checkTableIntegrity("favorites")
      results.push(favoritesResult)

      return results
    } catch (error) {
      throw new Error(`Integrity check failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Check integrity of a specific table
   */
  static async checkTableIntegrity(tableName: string): Promise<IntegrityCheckResult> {
    const result: IntegrityCheckResult = {
      tableName,
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      errors: [],
    }

    try {
      // Get total record count
      const { count, error: countError } = await supabaseAdmin
        .from(tableName)
        .select("*", { count: "exact", head: true })

      if (countError) {
        throw new Error(`Failed to count records in ${tableName}: ${countError.message}`)
      }

      result.totalRecords = count || 0

      // Get all records for validation
      const { data: records, error: fetchError } = await supabaseAdmin.from(tableName).select("*")

      if (fetchError) {
        throw new Error(`Failed to fetch records from ${tableName}: ${fetchError.message}`)
      }

      if (!records) {
        return result
      }

      // Validate each record
      for (const record of records) {
        try {
          const validation = await DatabaseSchemaValidator.validateBeforeInsert(
            tableName as "profiles" | "listings" | "bids",
            record,
          )

          if (validation.isValid) {
            result.validRecords++
          } else {
            result.invalidRecords++
            result.errors.push({
              recordId: record.id,
              error: validation.errors.join("; "),
            })
          }
        } catch (error) {
          result.invalidRecords++
          result.errors.push({
            recordId: record.id,
            error: `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
          })
        }
      }

      return result
    } catch (error) {
      throw new Error(
        `Table integrity check failed for ${tableName}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Check for orphaned records (referential integrity)
   */
  static async checkReferentialIntegrity(): Promise<{
    orphanedListings: number
    orphanedBids: number
    orphanedFavorites: number
    details: string[]
  }> {
    const details: string[] = []
    let orphanedListings = 0
    let orphanedBids = 0
    let orphanedFavorites = 0

    try {
      // Check for listings with non-existent users
      const { data: orphanedListingsData, error: listingsError } = await supabaseAdmin
        .from("listings")
        .select("id, user_id")
        .not("user_id", "in", `(SELECT id FROM profiles)`)

      if (listingsError) {
        details.push(`Error checking orphaned listings: ${listingsError.message}`)
      } else if (orphanedListingsData) {
        orphanedListings = orphanedListingsData.length
        if (orphanedListings > 0) {
          details.push(`Found ${orphanedListings} listings with non-existent users`)
        }
      }

      // Check for bids with non-existent listings or users
      const { data: orphanedBidsData, error: bidsError } = await supabaseAdmin.rpc("check_orphaned_bids")

      if (bidsError) {
        details.push(`Error checking orphaned bids: ${bidsError.message}`)
      } else if (orphanedBidsData) {
        orphanedBids = orphanedBidsData
        if (orphanedBids > 0) {
          details.push(`Found ${orphanedBids} bids with non-existent listings or users`)
        }
      }

      // Check for favorites with non-existent listings or users
      const { data: orphanedFavoritesData, error: favoritesError } = await supabaseAdmin.rpc("check_orphaned_favorites")

      if (favoritesError) {
        details.push(`Error checking orphaned favorites: ${favoritesError.message}`)
      } else if (orphanedFavoritesData) {
        orphanedFavorites = orphanedFavoritesData
        if (orphanedFavorites > 0) {
          details.push(`Found ${orphanedFavorites} favorites with non-existent listings or users`)
        }
      }

      return {
        orphanedListings,
        orphanedBids,
        orphanedFavorites,
        details,
      }
    } catch (error) {
      throw new Error(`Referential integrity check failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Check for data consistency issues
   */
  static async checkDataConsistency(): Promise<{
    issues: Array<{
      type: string
      description: string
      count: number
    }>
  }> {
    const issues: Array<{ type: string; description: string; count: number }> = []

    try {
      // Check for auctions without end times
      const { count: auctionsWithoutEndTime } = await supabaseAdmin
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("is_auction", true)
        .is("auction_end_time", null)

      if (auctionsWithoutEndTime && auctionsWithoutEndTime > 0) {
        issues.push({
          type: "auction_integrity",
          description: "Auctions without end times",
          count: auctionsWithoutEndTime,
        })
      }

      // Check for bids higher than buy_now_price
      const { data: invalidBids } = await supabaseAdmin.rpc("check_invalid_bids")
      if (invalidBids && invalidBids > 0) {
        issues.push({
          type: "bid_integrity",
          description: "Bids higher than buy-now price",
          count: invalidBids,
        })
      }

      // Check for expired auctions still marked as active
      const { count: expiredActiveAuctions } = await supabaseAdmin
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("is_auction", true)
        .eq("status", "active")
        .lt("auction_end_time", new Date().toISOString())

      if (expiredActiveAuctions && expiredActiveAuctions > 0) {
        issues.push({
          type: "auction_status",
          description: "Expired auctions still marked as active",
          count: expiredActiveAuctions,
        })
      }

      // Check for negative view counts or favorites
      const { count: negativeViews } = await supabaseAdmin
        .from("listings")
        .select("*", { count: "exact", head: true })
        .or("views.lt.0,favorites_count.lt.0")

      if (negativeViews && negativeViews > 0) {
        issues.push({
          type: "counter_integrity",
          description: "Listings with negative view or favorite counts",
          count: negativeViews,
        })
      }

      return { issues }
    } catch (error) {
      throw new Error(`Data consistency check failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Generate comprehensive integrity report
   */
  static async generateIntegrityReport(): Promise<{
    timestamp: string
    summary: {
      totalTables: number
      totalRecords: number
      validRecords: number
      invalidRecords: number
    }
    tableResults: IntegrityCheckResult[]
    referentialIntegrity: any
    dataConsistency: any
  }> {
    try {
      const tableResults = await this.performFullIntegrityCheck()
      const referentialIntegrity = await this.checkReferentialIntegrity()
      const dataConsistency = await this.checkDataConsistency()

      const summary = {
        totalTables: tableResults.length,
        totalRecords: tableResults.reduce((sum, result) => sum + result.totalRecords, 0),
        validRecords: tableResults.reduce((sum, result) => sum + result.validRecords, 0),
        invalidRecords: tableResults.reduce((sum, result) => sum + result.invalidRecords, 0),
      }

      return {
        timestamp: new Date().toISOString(),
        summary,
        tableResults,
        referentialIntegrity,
        dataConsistency,
      }
    } catch (error) {
      throw new Error(
        `Failed to generate integrity report: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }
}
