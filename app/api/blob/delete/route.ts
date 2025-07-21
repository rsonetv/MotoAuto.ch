import { type NextRequest, NextResponse } from "next/server"
import { deleteFile } from "@/lib/blob"
import { ratelimit } from "@/lib/ratelimit"
import { z } from "zod"

const deleteSchema = z.object({
  url: z.string().url("Invalid URL format"),
})

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? "127.0.0.1"
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 })
    }

    const body = await request.json()
    const { url } = deleteSchema.parse(body)

    // Validate that URL is from Vercel Blob
    if (!url.includes("vercel-storage.com") && !url.includes("blob.vercel-storage.com")) {
      return NextResponse.json({ error: "Invalid blob URL. Only Vercel Blob URLs are allowed." }, { status: 400 })
    }

    const result = await deleteFile(url)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      url,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Blob delete error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
