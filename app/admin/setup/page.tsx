"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Database, Car } from "lucide-react"

/**
 * Safely parse a fetch Response – tries JSON first, falls back to text
 */
async function parseApiResponse(res: Response) {
  const contentType = res.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    try {
      return await res.json()
    } catch {
      /* no-op – will fall back to text below */
    }
  }
  return { success: false, error: (await res.text()).slice(0, 500) }
}

interface SetupStep {
  id: string
  title: string
  description: string
  status: "pending" | "running" | "success" | "error"
  error?: string
}

export default function AdminSetupPage() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: "database",
      title: "Setup Database Schema",
      description: "Create tables, indexes, and security policies",
      status: "pending",
    },
    {
      id: "seed",
      title: "Seed Sample Data",
      description: "Insert demo listings and user profiles",
      status: "pending",
    },
  ])

  const [isRunning, setIsRunning] = useState(false)

  const updateStepStatus = (stepId: string, status: SetupStep["status"], error?: string) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status, error } : step)))
  }

  const runDatabaseSetup = async () => {
    updateStepStatus("database", "running")

    try {
      const response = await fetch("/api/admin/setup-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await parseApiResponse(response)

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Database setup failed")
      }

      updateStepStatus("database", "success")
      return true
    } catch (error) {
      console.error("Database setup error:", error)
      updateStepStatus("database", "error", error instanceof Error ? error.message : "Unknown error")
      return false
    }
  }

  const runSampleDataSetup = async () => {
    updateStepStatus("seed", "running")

    try {
      const response = await fetch("/api/admin/seed-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await parseApiResponse(response)

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Sample data setup failed")
      }

      updateStepStatus("seed", "success")
      return true
    } catch (error) {
      console.error("Sample data setup error:", error)
      updateStepStatus("seed", "error", error instanceof Error ? error.message : "Unknown error")
      return false
    }
  }

  const runFullSetup = async () => {
    setIsRunning(true)

    try {
      // Step 1: Setup database
      const dbSuccess = await runDatabaseSetup()
      if (!dbSuccess) {
        setIsRunning(false)
        return
      }

      // Step 2: Seed sample data
      await runSampleDataSetup()
    } catch (error) {
      console.error("Full setup error:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStepIcon = (status: SetupStep["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const allStepsComplete = steps.every((step) => step.status === "success")
  const hasErrors = steps.some((step) => step.status === "error")

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MotoAuto.ch Admin Setup</h1>
        <p className="text-gray-600">Initialize your Supabase database with the required schema and sample data.</p>
      </div>

      {/* Setup Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Setup Status
          </CardTitle>
          <CardDescription>Follow these steps to set up your MotoAuto.ch database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {step.error && (
                    <Alert className="mt-2">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{step.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <Button onClick={runFullSetup} disabled={isRunning || allStepsComplete} size="lg" className="flex-1">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : allStepsComplete ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Setup Complete
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Run Full Setup
            </>
          )}
        </Button>

        <Button onClick={runDatabaseSetup} disabled={isRunning} variant="outline">
          Database Only
        </Button>

        <Button onClick={runSampleDataSetup} disabled={isRunning || steps[0].status !== "success"} variant="outline">
          Sample Data Only
        </Button>
      </div>

      {/* Success Message */}
      {allStepsComplete && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            🎉 Setup completed successfully! Your MotoAuto.ch database is ready to use. You can now navigate to the main
            application and start using all features.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Summary */}
      {hasErrors && (
        <Alert className="mb-6" variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Some setup steps failed. Please check the error messages above and try again. Make sure your Supabase
            credentials are correct in your .env.local file.
          </AlertDescription>
        </Alert>
      )}

      {/* Setup Information */}
      <Card>
        <CardHeader>
          <CardTitle>What This Setup Does</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database Schema
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Creates user profiles table</li>
                <li>• Creates vehicle listings table</li>
                <li>• Creates bids and favorites tables</li>
                <li>• Sets up security policies (RLS)</li>
                <li>• Creates indexes for performance</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Car className="h-4 w-4" />
                Sample Data
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Demo user profile</li>
                <li>• 6 sample vehicle listings</li>
                <li>• Mix of cars and motorcycles</li>
                <li>• Auction listings with bids</li>
                <li>• Featured listings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
