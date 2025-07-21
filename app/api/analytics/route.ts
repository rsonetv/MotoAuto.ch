import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, properties } = body

    // Get user info if available
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Store analytics event in database
    const { error } = await supabase.from("analytics_events").insert({
      event_name: event,
      properties,
      user_id: user?.id || null,
      session_id: request.headers.get("x-session-id"),
      ip_address: request.ip || request.headers.get("x-forwarded-for"),
      user_agent: request.headers.get("user-agent"),
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error storing analytics event:", error)
      return NextResponse.json({ error: "Failed to store event" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
