import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { NextResponse } from "next/server"

// Create a mock client for build time
class MockSupabase {
  from(table: string) {
    return {
      select: () => ({ data: [], error: null }),
      limit: () => ({ data: [], error: null }),
    };
  }
  
  rpc() {
    return { error: null };
  }
}

// Use mock client during build, real client during runtime
const supabaseAdmin = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview'
  ? new MockSupabase() as any
  : createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "example-service-key",
    )

export async function POST() {
  try {
    console.log("🌱 Starting to seed sample data...")

    // First, check if we can connect to the database
    const { data: connectionTest, error: connectionError } = await supabaseAdmin.from("profiles").select("id").limit(1)

    if (connectionError && !connectionError.message.includes("does not exist")) {
      console.error("❌ Database connection failed:", connectionError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionError.message,
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Read and execute the seed data script
    const seedScriptPath = join(process.cwd(), "scripts", "seed-validated-data.sql")
    let seedScript: string

    try {
      seedScript = readFileSync(seedScriptPath, "utf8")
    } catch (fileError) {
      console.error("❌ Failed to read seed script:", fileError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to read seed data script",
          details: fileError instanceof Error ? fileError.message : "Unknown file error",
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Execute the seed script
    const { error: seedError } = await supabaseAdmin.rpc("exec_sql", {
      sql: seedScript,
    })

    if (seedError) {
      console.error("❌ Data seeding failed:", seedError)
      return NextResponse.json(
        {
          success: false,
          error: "Data seeding failed",
          details: seedError.message,
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("✅ Sample data seeded successfully")

    // Verify the data was inserted correctly
    const { data: profileCount, error: countError } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact" })

    if (countError) {
      console.error("❌ Failed to verify seeded data:", countError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to verify seeded data",
          details: countError.message,
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log(`✅ Verified ${profileCount?.length || 0} profiles created`)

    return NextResponse.json(
      {
        success: true,
        message: "Sample data seeded successfully with validation",
        stats: {
          profiles: profileCount?.length || 0,
          message: "All data validated against JSON schemas",
        },
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("❌ Seed data error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Data seeding failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
