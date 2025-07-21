import { type NextRequest, NextResponse } from "next/server"
import { listFiles } from "@/lib/blob"
import { ratelimit } from "@/lib/ratelimit"

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? "127.0.0.1"
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get("prefix") || undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const cursor = searchParams.get("cursor") || undefined

    const result = await listFiles({ prefix, limit, cursor })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      blobs: result.blobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      })),
      cursor: result.cursor,
      hasMore: result.hasMore,
      count: result.blobs.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Blob list error:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}
