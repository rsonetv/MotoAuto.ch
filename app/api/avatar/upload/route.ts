import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { ratelimit } from "@/lib/ratelimit"
import { isValidFileType, isValidFileSize, generateUniqueFilename } from "@/lib/blob"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? "127.0.0.1"
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return NextResponse.json({ error: "Missing filename parameter" }, { status: 400 })
    }

    // Get file from request body
    const file = request.body
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get content type and content length from headers
    const contentType = request.headers.get("content-type") || ""
    const contentLength = request.headers.get("content-length")

    // Validate file type
    if (!isValidFileType(contentType)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
          allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        },
        { status: 400 },
      )
    }

    // Validate file size
    if (contentLength && !isValidFileSize(Number.parseInt(contentLength))) {
      return NextResponse.json(
        {
          error: "File too large. Maximum size is 10MB.",
          maxSize: "10MB",
        },
        { status: 400 },
      )
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(filename)

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: "public",
      addRandomSuffix: false, // We already added our own suffix
    })

    return NextResponse.json({
      success: true,
      blob: {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      },
      originalFilename: filename,
      uniqueFilename,
      contentType,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
