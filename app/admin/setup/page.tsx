"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function AdminSetupPage() {
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const setupDatabase = async () => {
    setSetupStatus("loading")
    setMessage("")

    try {
      console.log("Calling setup-database API...")
      const response = await fetch("/api/setup-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      let payload: any = null
      try {
        /* try JSON first */
        payload = await response.json()
      } catch {
        /* if response isn’t JSON read plain-text */
        payload = { success: false, error: await response.text() }
      }

      if (response.ok && payload?.success) {
        setSetupStatus("success")
        setMessage("Database tables created successfully!")
      } else {
        setSetupStatus("error")
        setMessage(payload?.error || "Failed to setup database")
      }
    } catch (error) {
      console.error("Setup error:", error)
      setSetupStatus("error")
      setMessage(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const seedData = async () => {
    setSeedStatus("loading")
    setMessage("")

    try {
      console.log("Calling seed-data API...")
      const response = await fetch("/api/seed-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      let payload: any = null
      try {
        payload = await response.json()
      } catch {
        payload = { success: false, error: await response.text() }
      }

      if (response.ok && payload?.success) {
        setSeedStatus("success")
        setMessage("Sample data added successfully!")
      } else {
        setSeedStatus("error")
        setMessage(payload?.error || "Failed to seed data")
      }
    } catch (error) {
      console.error("Seed error:", error)
      setSeedStatus("error")
      setMessage(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MotoAuto.ch Setup</h1>
          <p className="text-gray-600">Initialize your database and add sample data</p>
        </div>

        <div className="space-y-6">
          {/* Environment Check */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>✅ SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing"}</p>
                <p>✅ SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing"}</p>
                <p>
                  ✅ SUPABASE_DB_URL:{" "}
                  {typeof window === "undefined" && process.env.SUPABASE_DB_URL ? "Set" : "Check server logs"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Database Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {setupStatus === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                {setupStatus === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                Database Setup
              </CardTitle>
              <CardDescription>Create the necessary tables, indexes, and security policies</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={setupDatabase}
                disabled={setupStatus === "loading" || setupStatus === "success"}
                className="w-full"
              >
                {setupStatus === "loading" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {setupStatus === "success" ? "Database Setup Complete" : "Setup Database"}
              </Button>
            </CardContent>
          </Card>

          {/* Seed Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {seedStatus === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                {seedStatus === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                Sample Data
              </CardTitle>
              <CardDescription>Add sample vehicles, auctions, and user profiles for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={seedData}
                disabled={seedStatus === "loading" || seedStatus === "success" || setupStatus !== "success"}
                className="w-full"
                variant={setupStatus !== "success" ? "secondary" : "default"}
              >
                {seedStatus === "loading" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {seedStatus === "success" ? "Sample Data Added" : "Add Sample Data"}
              </Button>
              {setupStatus !== "success" && <p className="text-sm text-gray-500 mt-2">Complete database setup first</p>}
            </CardContent>
          </Card>

          {/* Status Message */}
          {message && (
            <Card>
              <CardContent className="pt-6">
                <div
                  className={`flex items-center gap-2 ${
                    setupStatus === "success" || seedStatus === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {setupStatus === "success" || seedStatus === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {setupStatus === "success" && seedStatus === "success" && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Setup Complete! 🎉</CardTitle>
                <CardDescription className="text-green-700">
                  Your MotoAuto.ch application is ready to use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-green-700">
                  <p>✅ Database tables created</p>
                  <p>✅ Security policies configured</p>
                  <p>✅ Sample data added</p>
                  <p className="mt-4">
                    <a href="/" className="text-blue-600 hover:underline font-medium">
                      → Go to Homepage
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
