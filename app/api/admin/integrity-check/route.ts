import { type NextRequest, NextResponse } from "next/server"
import { DatabaseIntegrityMonitor } from "@/lib/database/integrity-monitor"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    // Check if user has admin privileges
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    // Check if user is admin (you might want to add an is_admin field to profiles)
    const { data: profile } = await supabaseAdmin.from("profiles").select("is_dealer").eq("id", user.id).single()

    if (!profile?.is_dealer) {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
    }

    // Generate comprehensive integrity report
    const report = await DatabaseIntegrityMonitor.generateIntegrityReport()

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Integrity check error:", error)
    return NextResponse.json(
      {
        error: "Failed to perform integrity check",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    // Check admin authentication (same as GET)
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    switch (action) {
      case "cleanup_expired_auctions":
        const { data: cleanupResult, error: cleanupError } = await supabaseAdmin.rpc("cleanup_expired_auctions")

        if (cleanupError) {
          throw new Error(`Cleanup failed: ${cleanupError.message}`)
        }

        return NextResponse.json({
          success: true,
          message: `Updated ${cleanupResult} expired auctions`,
        })

      case "recalculate_favorites":
        const { data: recalcResult, error: recalcError } = await supabaseAdmin.rpc("recalculate_favorites_count")

        if (recalcError) {
          throw new Error(`Recalculation failed: ${recalcError.message}`)
        }

        return NextResponse.json({
          success: true,
          message: `Updated favorites count for ${recalcResult} listings`,
        })

      case "validate_all_data":
        const { data: validationResult, error: validationError } = await supabaseAdmin.rpc("validate_all_data")

        if (validationError) {
          throw new Error(`Validation failed: ${validationError.message}`)
        }

        return NextResponse.json({
          success: true,
          validationErrors: validationResult,
        })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Integrity action error:", error)
    return NextResponse.json(
      {
        error: "Failed to perform integrity action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
