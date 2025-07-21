import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { generalRateLimit, getClientIP } from "@/lib/ratelimit"

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const { success } = await generalRateLimit.limit(ip)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Test Redis connection
    const testKey = "redis-test"
    const testValue = `Hello from Redis! ${new Date().toISOString()}`

    await redis.set(testKey, testValue, { ex: 60 }) // Expire in 60 seconds
    const retrievedValue = await redis.get(testKey)

    return NextResponse.json({
      success: true,
      message: "Redis connection successful",
      test: {
        key: testKey,
        setValue: testValue,
        retrievedValue,
        match: testValue === retrievedValue,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Redis Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Redis connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const { success } = await generalRateLimit.limit(ip)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const body = await request.json()
    const { key, value, action, ttl } = body

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    let result

    switch (action) {
      case "set":
        if (value === undefined) {
          return NextResponse.json({ error: "Value is required for set operation" }, { status: 400 })
        }
        if (ttl) {
          result = await redis.set(key, value, { ex: ttl })
        } else {
          result = await redis.set(key, value)
        }
        break

      case "get":
        result = await redis.get(key)
        break

      case "del":
        result = await redis.del(key)
        break

      case "exists":
        result = await redis.exists(key)
        break

      case "ttl":
        result = await redis.ttl(key)
        break

      default:
        return NextResponse.json({ error: "Invalid action. Use: set, get, del, exists, ttl" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      action,
      key,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Redis Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Redis operation failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
