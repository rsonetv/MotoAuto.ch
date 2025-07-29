"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface ApiResponse {
  success: boolean
  message?: string
  error?: string
  helpText?: string
  stats?: {
    profiles: number
    message?: string
  }
  validationTests?: {
    profile: boolean
    listing: boolean
  }
}

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    database?: ApiResponse
    seed?: ApiResponse
  }>({})
  const [errors, setErrors] = useState<string[]>([])

  // Utility function for API calls with timeout and proper error handling
  const makeApiCall = async (url: string, timeout = 45000): Promise<ApiResponse> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      })

      clearTimeout(timeoutId)

      // Clone the response to avoid "body stream already read" error
      const responseClone = response.clone()

      // Check if response is ok
      if (!response.ok) {
        let errorMessage: string
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Try to parse as JSON, fallback to text
      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          return await response.json()
        } else {
          // If not JSON, try to parse the cloned response as text
          const textResponse = await responseClone.text()
          return {
            success: true,
            message: textResponse || "Operation completed successfully",
          }
        }
      } catch (parseError) {
        // If JSON parsing fails, try text parsing on the clone
        try {
          const textResponse = await responseClone.text()
          return {
            success: true,
            message: textResponse || "Operation completed successfully",
          }
        } catch {
          throw new Error(
            `Failed to parse response: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`,
          )
        }
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${timeout / 1000} seconds`)
        }
        throw error
      }
      throw new Error("Unknown network error occurred")
    }
  }

  const setupDatabase = async () => {
    setIsLoading(true)
    setErrors([])
    setResults({})

    try {
      console.log("🚀 Starting database setup...")

      const dbResult = await makeApiCall("/api/admin/setup-database", 45000)
      setResults((prev) => ({ ...prev, database: dbResult }))

      if (!dbResult.success) {
        throw new Error(`Database setup failed: ${dbResult.error}`)
      }

      console.log("✅ Database setup completed successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error("❌ Setup failed:", errorMessage)
      setErrors((prev) => [...prev, `Database setup failed: ${errorMessage}`])
    } finally {
      setIsLoading(false)
    }
  }

  const seedData = async () => {
    setIsLoading(true)
    setErrors([])

    try {
      console.log("🌱 Starting data seeding...")

      const seedResult = await makeApiCall("/api/seed-data", 30000)
      setResults((prev) => ({ ...prev, seed: seedResult }))

      if (!seedResult.success) {
        throw new Error(`Data seeding failed: ${seedResult.error}`)
      }

      console.log("✅ Data seeding completed successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error("❌ Seeding failed:", errorMessage)
      setErrors((prev) => [...prev, `Data seeding failed: ${errorMessage}`])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (result?: ApiResponse) => {
    if (!result) return <Badge variant="secondary">Not Started</Badge>
    if (result.success)
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Success
        </Badge>
      )
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Failed
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MotoAuto.ch Admin Setup</h1>
        <p className="text-muted-foreground">Initialize the database schema and seed initial data for the platform.</p>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index} className="text-red-700">
                  {error}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Database Setup Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <CardTitle>Database Setup</CardTitle>
              </div>
              {getStatusBadge(results.database)}
            </div>
            <CardDescription>
              Create tables, indexes, JSON schemas, and validation functions. This process typically takes 30-45
              seconds. If the exec_sql function is missing, you'll need to follow the manual setup instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={setupDatabase} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up database...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Setup Database
                  </>
                )}
              </Button>

              {results.database && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Setup Results:</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {results.database.message ||
                      (results.database.success ? "Database setup completed successfully" : "Setup failed")}
                  </p>
                  
                  {results.database.helpText && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <AlertTriangle className="inline-block w-4 h-4 mr-1" />
                        {results.database.helpText}
                      </p>
                    </div>
                  )}

                  {results.database.validationTests && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Validation Tests:</p>
                      <div className="flex space-x-4 text-sm">
                        <span
                          className={`flex items-center ${results.database.validationTests.profile ? "text-green-600" : "text-red-600"}`}
                        >
                          {results.database.validationTests.profile ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          Profile Schema
                        </span>
                        <span
                          className={`flex items-center ${results.database.validationTests.listing ? "text-green-600" : "text-red-600"}`}
                        >
                          {results.database.validationTests.listing ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          Listing Schema
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Seeding Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <CardTitle>Seed Sample Data</CardTitle>
              </div>
              {getStatusBadge(results.seed)}
            </div>
            <CardDescription>
              Populate the database with sample users, listings, and test data. Run this after database setup is
              complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={seedData}
              disabled={isLoading || !results.database?.success}
              variant={results.database?.success ? "default" : "secondary"}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding data...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Data
                </>
              )}
            </Button>

            {results.seed && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Seeding Results:</h4>
                <p className="text-sm text-gray-600">
                  {results.seed.message ||
                    (results.seed.success ? "Data seeding completed successfully" : "Seeding failed")}
                </p>
                
                {results.seed.helpText && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <AlertTriangle className="inline-block w-4 h-4 mr-1" />
                      {results.seed.helpText}
                    </p>
                  </div>
                )}
                
                {results.seed.stats && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Created {results.seed.stats.profiles} profiles.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <div>
                  <p className="font-medium">Database Setup</p>
                  <p className="text-gray-600">
                    Creates all necessary tables, indexes, and validation functions with comprehensive JSON schemas.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <div>
                  <p className="font-medium">Seed Data</p>
                  <p className="text-gray-600">
                    Populates the database with sample users, vehicle listings, and test data for development.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">
                  ✓
                </span>
                <div>
                  <p className="font-medium">Ready to Use</p>
                  <p className="text-gray-600">Your MotoAuto.ch platform is now ready for development and testing.</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium mb-1 flex items-center text-yellow-800">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Troubleshooting
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  If you receive a message about missing "exec_sql" function, you'll need to create it manually:
                </p>
                <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700">
                  <li>Go to the Supabase dashboard</li>
                  <li>Open the SQL Editor</li>
                  <li>Create the function by running this SQL:</li>
                </ol>
                <pre className="mt-2 p-2 bg-gray-100 text-xs rounded overflow-x-auto">
                  {`CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executed successfully';
EXCEPTION WHEN OTHERS THEN
  RETURN 'Error: ' || SQLERRM;
END;
$$;`}
                </pre>
                <p className="text-sm mt-2 text-gray-700">After creating the function, return to this page and try the setup again.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
