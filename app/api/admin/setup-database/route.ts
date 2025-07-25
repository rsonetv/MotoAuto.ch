import { type NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

export async function POST(request: NextRequest) {
  try {
    // For build time, return a mock response
    if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "preview") {
      return NextResponse.json(
        {
          success: true,
          message: "This is a mock response for build time",
          validationTests: {
            profile: true,
            listing: true,
          },
        },
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Create Supabase client at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Supabase configuration",
          details: "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("🚀 Starting database setup...")

    // Read the SQL setup script
    const sqlPath = join(process.cwd(), "scripts", "setup-database-with-jsonschema.sql")
    console.log("📁 Reading SQL file from:", sqlPath)

    let sqlContent: string
    try {
      sqlContent = readFileSync(sqlPath, "utf8")
      console.log("✅ SQL file read successfully, length:", sqlContent.length)
    } catch (fileError) {
      console.error("❌ Failed to read SQL file:", fileError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to read setup script: ${fileError instanceof Error ? fileError.message : "Unknown file error"}`,
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Execute the SQL script
    console.log("🔧 Executing database setup script...")
    const { data, error } = await supabaseAdmin.rpc("exec", {
      sql: sqlContent,
    })

    if (error) {
      console.error("❌ Database setup error:", error)
      return NextResponse.json(
        {
          success: false,
          error: `Database setup failed: ${error.message}`,
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("✅ Database setup completed successfully")

    // Test the validation functions
    console.log("🧪 Testing validation functions...")

    const testProfile = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      email_verified: true,
      is_dealer: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: profileValidation, error: profileError } = await supabaseAdmin.rpc("validate_profile_data", {
      profile_data: testProfile,
    })

    if (profileError) {
      console.error("❌ Profile validation test failed:", profileError)
      return NextResponse.json(
        {
          success: false,
          error: `Profile validation test failed: ${profileError.message}`,
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("✅ Profile validation test result:", profileValidation)

    // Test listing validation
    const testListing = {
      user_id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Test Vehicle Listing",
      category: "auto",
      brand: "BMW",
      model: "X5",
      price: 25000,
      location: "Zurich",
    }

    const { data: listingValidation, error: listingError } = await supabaseAdmin.rpc("validate_listing_data", {
      listing_data: testListing,
    })

    if (listingError) {
      console.error("❌ Listing validation test failed:", listingError)
      return NextResponse.json(
        {
          success: false,
          error: `Listing validation test failed: ${listingError.message}`,
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("✅ Listing validation test result:", listingValidation)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Database setup completed successfully",
        validationTests: {
          profile: profileValidation,
          listing: listingValidation,
        },
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("❌ Unexpected error during database setup:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
