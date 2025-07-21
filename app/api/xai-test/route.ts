import { generateXAIText, isValidXAIModel, getModelInfo, type XAIModel } from "@/lib/xai"
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
  prompt: z.string().min(1).max(2000),
  model: z.string().optional(),
  system: z.string().max(1000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
})

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

    const { prompt, model: requestedModel = "grok-2-1212", system, temperature = 0.7, maxTokens = 1000 } = validatedData

    // Validate model
    if (!isValidXAIModel(requestedModel)) {
      return NextResponse.json(
        {
          error: "Invalid model",
          availableModels: ["grok-2-1212", "grok-2-vision-1212", "grok-beta"],
        },
        { status: 400 },
      )
    }

    const model = requestedModel as XAIModel
    const modelInfo = getModelInfo(model)

    // Generate response
    const result = await generateXAIText(prompt, {
      model,
      system,
      temperature,
      maxTokens: Math.min(maxTokens, modelInfo.maxTokens),
    })

    if (!result.success) {
      return NextResponse.json({ error: "Failed to generate response", details: result.error }, { status: 500 })
    }

    return NextResponse.json({
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      model: {
        name: model,
        info: modelInfo,
      },
      request: {
        prompt,
        system,
        temperature,
        maxTokens,
      },
      timestamp: new Date().toISOString(),
      rateLimit: {
        limit,
        remaining: remaining - 1,
        reset: new Date(reset).toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    console.error("XAI test error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: "XAI Test API is running",
    availableModels: ["grok-2-1212", "grok-2-vision-1212", "grok-beta"],
    endpoints: {
      POST: "/api/xai-test",
      GET: "/api/grok-holiday",
    },
    example: {
      method: "POST",
      body: {
        prompt: "Write a short poem about AI",
        model: "grok-2-1212",
        temperature: 0.7,
        maxTokens: 500,
      },
    },
  })
}
