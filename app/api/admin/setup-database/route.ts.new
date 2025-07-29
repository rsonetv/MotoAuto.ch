import { type NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Missing required environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "Missing required environment variables for database setup",
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

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
          error: `Failed to read setup script: ${fileError instanceof Error ? fileError.message : "Unknown error"}`,
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Try to execute the SQL script using exec_sql function
    console.log("🔧 Attempting to execute database setup script using exec_sql...")
    
    try {
      const { data, error } = await supabaseAdmin.rpc("exec_sql", {
        sql: sqlContent,
      })

      if (error) {
        console.error("❌ Error executing SQL with exec_sql:", error)
        
        // If the function doesn't exist, suggest creating it manually
        if (error.message.includes("function") && error.message.includes("does not exist")) {
          console.log("⚠️ The exec_sql function doesn't exist.")
          console.log("Please run the SQL script manually in Supabase SQL Editor.")
          console.log("The script already contains the code to create the exec_sql function.")
          
          return NextResponse.json(
            {
              success: false,
              error: "The exec_sql function doesn't exist. Please run the SQL script manually in Supabase SQL Editor.",
              helpText: "The SQL script contains the code to create the exec_sql function. After running it once, you can use this setup page again.",
            },
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          )
        }
        
        return NextResponse.json(
          {
            success: false,
            error: `Database setup failed: ${error.message}`,
          },
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      console.log("✅ Database setup completed successfully")
      
      // Test the validation functions
      console.log("🧪 Testing validation functions...")

      const testProfile = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        email_verified: true,
        phone_verified: false,
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
            success: true,
            message: "Database setup completed, but validation test failed",
            error: `Profile validation test failed: ${profileError.message}`,
            validationTests: {
              profile: false,
              listing: false,
            },
          },
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
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
            success: true,
            message: "Database setup completed, but validation test failed",
            error: `Listing validation test failed: ${listingError.message}`,
            validationTests: {
              profile: profileValidation || false,
              listing: false,
            },
          },
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      console.log("✅ Listing validation test result:", listingValidation)

      // Return success response
      return NextResponse.json(
        {
          success: true,
          message: "Database setup completed successfully",
          validationTests: {
            profile: profileValidation || false,
            listing: listingValidation || false,
          },
        },
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
      
    } catch (execError) {
      console.error("❌ Exception during setup:", execError)
      return NextResponse.json(
        {
          success: false,
          error: `Setup exception: ${execError instanceof Error ? execError.message : "Unknown error"}`,
          helpText: "You may need to run the SQL script manually in the Supabase dashboard.",
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }
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
      }
    )
  }
}
