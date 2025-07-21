import { xai } from "@ai-sdk/xai"
import { generateText, streamText } from "ai"

// Available XAI models
export const XAI_MODELS = {
  "grok-2-1212": "grok-2-1212",
  "grok-2-vision-1212": "grok-2-vision-1212",
  "grok-beta": "grok-beta",
} as const

export type XAIModel = keyof typeof XAI_MODELS

// Default model
export const DEFAULT_XAI_MODEL: XAIModel = "grok-2-1212"

// Create XAI model instance
export function createXAIModel(model: XAIModel = DEFAULT_XAI_MODEL) {
  return xai(XAI_MODELS[model])
}

// Generate text with XAI
export async function generateXAIText(
  prompt: string,
  options: {
    model?: XAIModel
    system?: string
    temperature?: number
    maxTokens?: number
  } = {},
) {
  const { model = DEFAULT_XAI_MODEL, system, temperature = 0.7, maxTokens = 1000 } = options

  try {
    const result = await generateText({
      model: createXAIModel(model),
      prompt,
      system,
      temperature,
      maxTokens,
    })

    return {
      success: true,
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
    }
  } catch (error) {
    console.error("XAI generation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      text: null,
    }
  }
}

// Stream text with XAI
export async function streamXAIText(
  prompt: string,
  options: {
    model?: XAIModel
    system?: string
    temperature?: number
    maxTokens?: number
  } = {},
) {
  const { model = DEFAULT_XAI_MODEL, system, temperature = 0.7, maxTokens = 1000 } = options

  try {
    const result = streamText({
      model: createXAIModel(model),
      prompt,
      system,
      temperature,
      maxTokens,
    })

    return {
      success: true,
      stream: result.textStream,
      fullStream: result.fullStream,
    }
  } catch (error) {
    console.error("XAI streaming error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stream: null,
    }
  }
}

// Utility function to validate XAI model
export function isValidXAIModel(model: string): model is XAIModel {
  return model in XAI_MODELS
}

// Get model info
export function getModelInfo(model: XAIModel) {
  const modelInfo = {
    "grok-2-1212": {
      name: "Grok 2 (December 2024)",
      description: "Latest Grok model with improved reasoning",
      maxTokens: 8192,
      supportsVision: false,
    },
    "grok-2-vision-1212": {
      name: "Grok 2 Vision (December 2024)",
      description: "Grok model with vision capabilities",
      maxTokens: 8192,
      supportsVision: true,
    },
    "grok-beta": {
      name: "Grok Beta",
      description: "Beta version of Grok with experimental features",
      maxTokens: 4096,
      supportsVision: false,
    },
  }

  return modelInfo[model]
}
