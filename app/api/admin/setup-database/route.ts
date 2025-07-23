import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { readFileSync } from "fs"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting enhanced database setup with JSON schema validation...")

    // Read and execute the enhanced setup script
    const setupScriptPath = join(process.cwd(), "scripts", "setup-database-with-jsonschema.sql")
    const setupScript = readFileSync(setupScriptPath, "utf8")

    // Execute the setup script
    const { error: setupError } = await supabaseAdmin.rpc("exec_sql", {
      sql: setupScript,
    })

    if (setupError) {
      console.error("❌ Database setup failed:", setupError)
      return NextResponse.json(
        {
          error: "Database setup failed",
          details: setupError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Enhanced database schema created successfully")

    // Read and execute integrity check functions
    const integrityScriptPath = join(process.cwd(), "scripts", "integrity-check-functions.sql")
    const integrityScript = readFileSync(integrityScriptPath, "utf8")

    const { error: integrityError } = await supabaseAdmin.rpc("exec_sql", {
      sql: integrityScript,
    })

    if (integrityError) {
      console.error("❌ Integrity functions setup failed:", integrityError)
      return NextResponse.json(
        {
          error: "Integrity functions setup failed",
          details: integrityError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Integrity check functions created successfully")

    // Verify pg_jsonschema extension is working
    const { data: schemaTest, error: schemaError } = await supabaseAdmin.rpc("get_profile_schema")

    if (schemaError) {
      console.error("❌ JSON schema validation setup failed:", schemaError)
      return NextResponse.json(
        {
          error: "JSON schema validation setup failed",
          details: schemaError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ JSON schema validation is working correctly")

    // Test data validation
    const testProfile = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      email_verified: true,
      is_dealer: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: validationResult, error: validationError } = await supabaseAdmin.rpc("validate_profile_data", {
      profile_data: testProfile,
    })

    if (validationError || !validationResult) {
      console.error("❌ Data validation test failed:", validationError)
      return NextResponse.json(
        {
          error: "Data validation test failed",
          details: validationError?.message || "Validation returned false",
        },
        { status: 500 },
      )
    }

    console.log("✅ Data validation test passed")

    return NextResponse.json({
      success: true,
      message: "Enhanced database with JSON schema validation setup completed successfully",
      features: [
        "pg_jsonschema extension enabled",
        "Comprehensive CHECK constraints implemented",
        "JSON schema validation functions created",
        "Data integrity monitoring functions installed",
        "Row Level Security policies configured",
        "Performance indexes optimized",
        "Automatic triggers for data consistency",
      ],
    })
  } catch (error) {
    console.error("❌ Database setup error:", error)
    return NextResponse.json(
      {
        error: "Database setup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
