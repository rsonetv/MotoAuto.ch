import Groq from "groq-sdk"

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is required")
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export const GROQ_MODELS = {
  "llama-3.3-70b-versatile": "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile": "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant": "llama-3.1-8b-instant",
  "mixtral-8x7b-32768": "mixtral-8x7b-32768",
} as const

export type GroqModel = keyof typeof GROQ_MODELS

export async function generateText(prompt: string, model: GroqModel = "llama-3.3-70b-versatile") {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODELS[model],
      temperature: 0.7,
      max_tokens: 1024,
    })

    return {
      success: true,
      content: completion.choices[0]?.message?.content || "",
      usage: completion.usage,
    }
  } catch (error) {
    console.error("Groq API error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
