import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "@/lib/groq"
import { ratelimit } from "@/lib/ratelimit"
import { z } from "zod"

const requestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  model: z
    .enum(["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"])
    .optional(),
})

export async function GET() {
  try {
    const result = await generateText("Hello from Groq! Respond in Polish.")

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: result.content,
      model: "llama-3.3-70b-versatile",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Groq test error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? "127.0.0.1"
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 })
    }

    const body = await request.json()
    const { prompt, model } = requestSchema.parse(body)

    const result = await generateText(prompt, model)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: result.content,
      model: model || "llama-3.3-70b-versatile",
      prompt,
      timestamp: new Date().toISOString(),
      usage: result.usage,
    })
  } catch (error) {
    console.error("Groq API error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
