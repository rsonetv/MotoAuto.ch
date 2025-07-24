"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, RefreshCw, Database, Shield, Activity, FileCheck } from "lucide-react"

interface IntegrityError {
  recordId: string | number
  error: string
}

interface TableResult {
  tableName: string
  totalRecords: number
  validRecords: number
  invalidRecords: number
  errors: IntegrityError[]
}

interface ReferentialIntegrity {
  orphanedListings: number
  orphanedBids: number
  orphanedFavorites: number
  details: string[]
}

interface ConsistencyIssue {
  type: string
  description: string
  count: number
}

interface DataConsistency {
  issues: ConsistencyIssue[]
}

interface IntegrityReport {
  timestamp: string
  summary: {
    totalTables: number
    totalRecords: number
    validRecords: number
    invalidRecords: number
  }
  tableResults: TableResult[]
  referentialIntegrity: ReferentialIntegrity
  dataConsistency: DataConsistency
}

interface ApiResponse {
  success: boolean
  report?: IntegrityReport
  message?: string
  error?: string
}

export default function IntegrityMonitorPage() {
  const [report, setReport] = useState<IntegrityReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null)

  // Utility function for API calls with timeout
  const makeApiCall = useCallback(
    async (url: string, options: RequestInit = {}, timeoutMs = 30000): Promise<ApiResponse> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        })

        clearTimeout(timeoutId)

        let result: ApiResponse
        try {
          result = await response.json()
        } catch {
          const textContent = await response.text()
          result = {
            success: false,
            error: textContent || "Failed to parse response",
          }
        }

        if (!response.ok) {
          result.success = false
          if (!result.error) {
            result.error = `HTTP ${response.status}: ${response.statusText}`
          }
        }

        return result
      } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            return {
              success: false,
              error: `Request timed out after ${timeoutMs / 1000} seconds`,
            }
          }
          return {
            success: false,
            error: `Network error: ${error.message}`,
          }
        }

        return {
          success: false,
          error: "Unknown network error occurred",
        }
      }
    },
    [],
  )

  const fetchIntegrityReport = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching integrity report...")
      const result = await makeApiCall(
        "/api/admin/integrity-check",
        {
          method: "GET",
        },
        60000,
      ) // 60 second timeout for integrity check

      if (result.success && result.report) {
        setReport(result.report)
        setLastFetchTime(new Date())
        console.log("Integrity report fetched successfully")
      } else {
        setError(result.error || "Failed to fetch integrity report")
        console.error("Failed to fetch integrity report:", result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      console.error("Unexpected error fetching integrity report:", error)
    } finally {
      setLoading(false)
    }
  }, [makeApiCall])

  const performAction = useCallback(
    async (action: string) => {
      setActionLoading(action)
      setError(null)

      try {
        console.log(`Performing action: ${action}`)
        const result = await makeApiCall(
          "/api/admin/integrity-check",
          {
            method: "POST",
            body: JSON.stringify({ action }),
          },
          120000,
        ) // 2 minute timeout for maintenance actions

        if (result.success) {
          console.log(`Action ${action} completed successfully:`, result.message)
          // Refresh the report after successful action
          await fetchIntegrityReport()
        } else {
          setError(result.error || `Failed to perform action: ${action}`)
          console.error(`Action ${action} failed:`, result.error)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Action ${action} failed`
        setError(errorMessage)
        console.error(`Unexpected error performing action ${action}:`, error)
      } finally {
        setActionLoading(null)
      }
    },
    [makeApiCall, fetchIntegrityReport],
  )

  // Auto-fetch report on component mount
  useEffect(() => {
    fetchIntegrityReport()
  }, [fetchIntegrityReport])

  const getHealthScore = useCallback(() => {
    if (!report) return 0
    const { validRecords, invalidRecords } = report.summary
    const totalRecords = validRecords + invalidRecords
    return totalRecords > 0 ? Math.round((validRecords / totalRecords) * 100) : 100
  }, [report])

  const getHealthColor = useCallback((score: number) => {
    if (score >= 95) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }, [])

  const formatTimestamp = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Integrity Monitor</h1>
          <p className="text-muted-foreground">Monitor and maintain data integrity with JSON schema validation</p>
          {lastFetchTime && (
            <p className="text-sm text-muted-foreground mt-1">Last updated: {lastFetchTime.toLocaleString()}</p>
          )}
        </div>
        <Button onClick={fetchIntegrityReport} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh Report"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Error occurred:</div>
            <div className="mt-1">{error}</div>
            <Button onClick={() => setError(null)} variant="outline" size="sm" className="mt-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading && !report && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Generating integrity report...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getHealthColor(getHealthScore())}`}>{getHealthScore()}%</div>
                <Progress value={getHealthScore()} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalRecords.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across {report.summary.totalTables} tables</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valid Records</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{report.summary.validRecords.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Schema compliant</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invalid Records</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{report.summary.invalidRecords.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Report */}
          <Tabs defaultValue="tables" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tables">Table Integrity</TabsTrigger>
              <TabsTrigger value="referential">Referential Integrity</TabsTrigger>
              <TabsTrigger value="consistency">Data Consistency</TabsTrigger>
              <TabsTrigger value="actions">Maintenance Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="tables" className="space-y-4">
              {report.tableResults.map((table, tableIndex) => (
                <Card key={`table-${table.tableName}-${tableIndex}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{table.tableName}</CardTitle>
                      <Badge variant={table.invalidRecords > 0 ? "destructive" : "default"}>
                        {table.invalidRecords > 0 ? `${table.invalidRecords} issues` : "Healthy"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {table.totalRecords} total records, {table.validRecords} valid, {table.invalidRecords} invalid
                    </CardDescription>
                  </CardHeader>
                  {table.errors.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Validation Errors:</h4>
                        {table.errors.slice(0, 5).map((error, errorIndex) => (
                          <div
                            key={`error-${table.tableName}-${error.recordId}-${errorIndex}`}
                            className="text-sm bg-red-50 p-2 rounded border-l-2 border-red-200"
                          >
                            <span className="font-mono text-xs">ID: {error.recordId}</span>
                            <p className="text-red-700">{error.error}</p>
                          </div>
                        ))}
                        {table.errors.length > 5 && (
                          <p className="text-sm text-muted-foreground">... and {table.errors.length - 5} more errors</p>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="referential" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Referential Integrity Check
                  </CardTitle>
                  <CardDescription>Checking for orphaned records and broken relationships</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-red-600">
                        {report.referentialIntegrity.orphanedListings}
                      </div>
                      <div className="text-sm text-muted-foreground">Orphaned Listings</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-red-600">{report.referentialIntegrity.orphanedBids}</div>
                      <div className="text-sm text-muted-foreground">Orphaned Bids</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-red-600">
                        {report.referentialIntegrity.orphanedFavorites}
                      </div>
                      <div className="text-sm text-muted-foreground">Orphaned Favorites</div>
                    </div>
                  </div>

                  {report.referentialIntegrity.details.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Details:</h4>
                      {report.referentialIntegrity.details.map((detail, detailIndex) => (
                        <div
                          key={`referential-detail-${detailIndex}`}
                          className="text-sm bg-yellow-50 p-2 rounded border-l-2 border-yellow-200"
                        >
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consistency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Data Consistency Issues
                  </CardTitle>
                  <CardDescription>Checking for logical inconsistencies in data</CardDescription>
                </CardHeader>
                <CardContent>
                  {report.dataConsistency.issues.length === 0 ? (
                    <div className="text-center py-8 text-green-600">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-medium">No consistency issues found</p>
                      <p className="text-sm text-muted-foreground">All data appears to be logically consistent</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {report.dataConsistency.issues.map((issue, issueIndex) => (
                        <div
                          key={`consistency-issue-${issue.type}-${issueIndex}`}
                          className="flex items-center justify-between p-3 bg-yellow-50 rounded border-l-2 border-yellow-200"
                        >
                          <div>
                            <div className="font-medium">{issue.description}</div>
                            <div className="text-sm text-muted-foreground">Type: {issue.type}</div>
                          </div>
                          <Badge variant="outline">{issue.count} records</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Actions</CardTitle>
                  <CardDescription>Automated maintenance tasks to fix common issues</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        action: "cleanup_expired_auctions",
                        title: "Cleanup Expired Auctions",
                        description: "Mark expired auctions as 'expired' status",
                      },
                      {
                        action: "recalculate_favorites",
                        title: "Recalculate Favorites",
                        description: "Fix favorites count inconsistencies",
                      },
                      {
                        action: "validate_all_data",
                        title: "Validate All Data",
                        description: "Run comprehensive schema validation",
                      },
                      {
                        action: "cleanup_orphaned_records",
                        title: "Cleanup Orphaned Records",
                        description: "Remove records with broken relationships",
                      },
                    ].map((actionItem, actionIndex) => (
                      <Button
                        key={`action-${actionItem.action}-${actionIndex}`}
                        onClick={() => performAction(actionItem.action)}
                        disabled={actionLoading === actionItem.action}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start"
                      >
                        <div className="font-medium">{actionItem.title}</div>
                        <div className="text-sm text-muted-foreground text-left">{actionItem.description}</div>
                        {actionLoading === actionItem.action && <RefreshCw className="h-4 w-4 animate-spin mt-2" />}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-xs text-muted-foreground text-center">
            Report generated: {formatTimestamp(report.timestamp)}
          </div>
        </>
      )}
    </div>
  )
}
