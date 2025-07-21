"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, Zap, Brain, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface XAIResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: {
    name: string
    info: {
      name: string
      description: string
      maxTokens: number
      supportsVision: boolean
    }
  }
  request: {
    prompt: string
    system?: string
    temperature: number
    maxTokens: number
  }
  timestamp: string
  rateLimit: {
    limit: number
    remaining: number
    reset: string
  }
}

const PRESET_PROMPTS = [
  {
    name: "Creative Writing",
    prompt: "Write a short story about a robot who discovers emotions for the first time.",
    system: "You are a creative writer specializing in science fiction stories.",
  },
  {
    name: "Code Explanation",
    prompt: "Explain how React hooks work and provide a simple example.",
    system: "You are a programming instructor who explains concepts clearly.",
  },
  {
    name: "Business Analysis",
    prompt: "Analyze the pros and cons of remote work for tech companies.",
    system: "You are a business consultant with expertise in workplace trends.",
  },
  {
    name: "Holiday Generator",
    prompt: "Invent a new holiday and describe its traditions, food, and celebrations.",
    system: "You are a creative holiday inventor who creates fun and unique celebrations.",
  },
]

export default function XAITestPage() {
  const [prompt, setPrompt] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [model, setModel] = useState("grok-2-1212")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)
  const [response, setResponse] = useState<XAIResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch("/api/xai-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          system: systemPrompt.trim() || undefined,
          temperature,
          maxTokens,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate response")
      }

      setResponse(data)
      toast({
        title: "Response generated!",
        description: `Used ${data.usage?.totalTokens || 0} tokens`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard",
        variant: "destructive",
      })
    }
  }

  const loadPreset = (preset: (typeof PRESET_PROMPTS)[0]) => {
    setPrompt(preset.prompt)
    setSystemPrompt(preset.system)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          XAI Test Interface
        </h1>
        <p className="text-gray-600">Test XAI models (Grok) with custom prompts and parameters</p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">Grok 2</Badge>
          <Badge variant="outline">Vision Support</Badge>
          <Badge variant="outline">Rate Limited</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Configuration
            </CardTitle>
            <CardDescription>Configure your XAI request parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Prompts */}
            <div>
              <Label className="text-sm font-medium">Preset Prompts</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PRESET_PROMPTS.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset(preset)}
                    className="text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Model Selection */}
              <div>
                <Label htmlFor="model">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grok-2-1212">Grok 2 (December 2024)</SelectItem>
                    <SelectItem value="grok-2-vision-1212">Grok 2 Vision (December 2024)</SelectItem>
                    <SelectItem value="grok-beta">Grok Beta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* System Prompt */}
              <div>
                <Label htmlFor="system">System Prompt (Optional)</Label>
                <Textarea
                  id="system"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  rows={2}
                />
              </div>

              {/* Main Prompt */}
              <div>
                <Label htmlFor="prompt">Prompt *</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  rows={4}
                  required
                />
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature: {temperature}</Label>
                  <input
                    type="range"
                    id="temperature"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="maxTokens">Max Tokens: {maxTokens}</Label>
                  <input
                    type="range"
                    id="maxTokens"
                    min="100"
                    max="4000"
                    step="100"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number.parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading || !prompt.trim()} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Response
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Response
            </CardTitle>
            <CardDescription>Generated response from XAI</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-red-700 text-sm font-medium">Error:</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                {/* Response Text */}
                <div className="relative">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm">{response.text}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(response.text)}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Model:</p>
                    <p className="text-gray-600">{response.model.info.name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Tokens Used:</p>
                    <p className="text-gray-600">{response.usage?.totalTokens || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Temperature:</p>
                    <p className="text-gray-600">{response.request.temperature}</p>
                  </div>
                  <div>
                    <p className="font-medium">Rate Limit:</p>
                    <p className="text-gray-600">
                      {response.rateLimit.remaining}/{response.rateLimit.limit}
                    </p>
                  </div>
                </div>

                {/* Usage Details */}
                {response.usage && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Token Usage:</p>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>Prompt: {response.usage.promptTokens}</p>
                      <p>Completion: {response.usage.completionTokens}</p>
                      <p>Total: {response.usage.totalTokens}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!response && !error && !loading && (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Enter a prompt and click generate to see the response</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
