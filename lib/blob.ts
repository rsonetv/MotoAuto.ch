import { put, del, list } from "@vercel/blob"

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("BLOB_READ_WRITE_TOKEN is required")
}

// Allowed file types for uploads
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"] as const

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// Validate file type
export function isValidFileType(type: string): boolean {
  return ALLOWED_FILE_TYPES.includes(type as any)
}

// Validate file size
export function isValidFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE
}

// Upload file to Vercel Blob
export async function uploadFile(
  filename: string,
  file: File | Buffer | ReadableStream,
  options?: {
    access?: "public" | "private"
    addRandomSuffix?: boolean
    cacheControlMaxAge?: number
  },
) {
  try {
    const blob = await put(filename, file, {
      access: options?.access || "public",
      addRandomSuffix: options?.addRandomSuffix ?? true,
      cacheControlMaxAge: options?.cacheControlMaxAge || 3600,
    })

    return {
      success: true,
      blob,
      url: blob.url,
      pathname: blob.pathname,
    }
  } catch (error) {
    console.error("Blob upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  }
}

// Delete file from Vercel Blob
export async function deleteFile(url: string) {
  try {
    await del(url)
    return {
      success: true,
      message: "File deleted successfully",
    }
  } catch (error) {
    console.error("Blob delete error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    }
  }
}

// List files from Vercel Blob
export async function listFiles(options?: {
  prefix?: string
  limit?: number
  cursor?: string
}) {
  try {
    const result = await list({
      prefix: options?.prefix,
      limit: options?.limit || 100,
      cursor: options?.cursor,
    })

    return {
      success: true,
      blobs: result.blobs,
      cursor: result.cursor,
      hasMore: result.hasMore,
    }
  } catch (error) {
    console.error("Blob list error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "List failed",
      blobs: [],
    }
  }
}

// Generate unique filename
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split(".").pop()
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "")

  return `${nameWithoutExt}-${timestamp}-${random}.${extension}`
}

// Get file info from URL
export function getFileInfoFromUrl(url: string) {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split("/").pop() || "unknown"

    return {
      filename,
      pathname,
      domain: urlObj.hostname,
    }
  } catch (error) {
    return {
      filename: "unknown",
      pathname: "",
      domain: "",
    }
  }
}
