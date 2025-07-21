import { generateXAIText, streamXAIText } from "@/lib/xai"
import { type NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { z } from "zod"

// Rate limiting: 10 requests per minute per IP
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
})

const requestSchema = z.object({
  prompt: z.string().min(1).max(2000).optional(),
  model: z.enum(["grok-2-1212", "grok-2-vision-1212", "grok-beta"]).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  stream: z.boolean().optional(),
})

// GET endpoint - Generate a holiday
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? "127.0.0.1"
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": new Date(reset).toISOString(),
          },
        },
      )
    }

    const defaultPrompt =
      "Invent a new holiday and describe its traditions, food, decorations, and how people celebrate it. Make it creative and fun!"

    const result = await generateXAIText(defaultPrompt, {
      model: "grok-2-1212",
      temperature: 0.8,
      maxTokens: 1000,
      system: "You are a creative holiday inventor. Create unique, fun, and detailed holiday descriptions.",
    })

    if (!result.success) {
      return NextResponse.json({ error: "Failed to generate holiday", details: result.error }, { status: 500 })
    }

    return NextResponse.json({
      text: result.text,
      usage: result.usage,
      model: "grok-2-1212",
      prompt: defaultPrompt,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Holiday generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST endpoint - Custom prompt
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? "127.0.0.1"
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": new Date(reset).toISOString(),
          },
        },
      )
    }

    const body = await request.json()
    const validatedData = requestSchema.parse(body)

    const {
      prompt = "Invent a new holiday and describe its traditions.",
      model = "grok-2-1212",
      temperature = 0.7,
      maxTokens = 1000,
      stream = false,
    } = validatedData

    if (stream) {
      // Streaming response
      const result = await streamXAIText(prompt, {
        model,
        temperature,
        maxTokens,
        system: "You are a helpful and creative assistant.",
      })

      if (!result.success) {
        return NextResponse.json({ error: "Failed to generate response", details: result.error }, { status: 500 })
      }

      // Convert stream to text for JSON response
      let fullText = ""
      if (result.stream) {
        for await (const chunk of result.stream) {
          fullText += chunk
        }
      }

      return NextResponse.json({
        text: fullText,
        model,
        prompt,
        streaming: true,
        timestamp: new Date().toISOString(),
      })
    } else {
      // Regular response
      const result = await generateXAIText(prompt, {
        model,
        temperature,
        maxTokens,
        system: "You are a helpful and creative assistant.",
      })

      if (!result.success) {
        return NextResponse.json({ error: "Failed to generate response", details: result.error }, { status: 500 })
      }

      return NextResponse.json({
        text: result.text,
        usage: result.usage,
        model,
        prompt,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    console.error("Holiday generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
