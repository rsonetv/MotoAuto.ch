"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, RefreshCw, Database, Shield, Activity, FileCheck } from "lucide-react"

interface IntegrityReport {
  timestamp: string
  summary: {
    totalTables: number
    totalRecords: number
    validRecords: number
    invalidRecords: number
  }
  tableResults: Array<{
    tableName: string
    totalRecords: number
    validRecords: number
    invalidRecords: number
    errors: Array<{
      recordId: string | number
      error: string
    }>
  }>
  referentialIntegrity: {
    orphanedListings: number
    orphanedBids: number
    orphanedFavorites: number
    details: string[]
  }
  dataConsistency: {
    issues: Array<{
      type: string
      description: string
      count: number
    }>
  }
}

export default function IntegrityMonitorPage() {
  const [report, setReport] = useState<IntegrityReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchIntegrityReport = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/integrity-check", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch integrity report")
      }

      const data = await response.json()
      setReport(data.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const performAction = async (action: string) => {
    setActionLoading(action)
    setError(null)

    try {
      const response = await fetch("/api/admin/integrity-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error("Action failed")
      }

      const data = await response.json()

      // Refresh the report after successful action
      await fetchIntegrityReport()

      // Show success message (you might want to add a toast notification here)
      console.log("Action completed:", data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchIntegrityReport()
  }, [])

  const getHealthScore = () => {
    if (!report) return 0
    const { validRecords, invalidRecords } = report.summary
    const totalRecords = validRecords + invalidRecords
    return totalRecords > 0 ? Math.round((validRecords / totalRecords) * 100) : 100
  }

  const getHealthColor = (score: number) => {
    if (score >= 95) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Integrity Monitor</h1>
          <p className="text-muted-foreground">Monitor and maintain data integrity with JSON schema validation</p>
        </div>
        <Button onClick={fetchIntegrityReport} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Report
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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
              {report.tableResults.map((table) => (
                <Card key={table.tableName}>
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
                        {table.errors.slice(0, 5).map((error, index) => (
                          <div key={index} className="text-sm bg-red-50 p-2 rounded border-l-2 border-red-200">
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
                      {report.referentialIntegrity.details.map((detail, index) => (
                        <div key={index} className="text-sm bg-yellow-50 p-2 rounded border-l-2 border-yellow-200">
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
                      {report.dataConsistency.issues.map((issue, index) => (
                        <div
                          key={index}
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
                    <Button
                      onClick={() => performAction("cleanup_expired_auctions")}
                      disabled={actionLoading === "cleanup_expired_auctions"}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                    >
                      <div className="font-medium">Cleanup Expired Auctions</div>
                      <div className="text-sm text-muted-foreground text-left">
                        Mark expired auctions as 'expired' status
                      </div>
                      {actionLoading === "cleanup_expired_auctions" && (
                        <RefreshCw className="h-4 w-4 animate-spin mt-2" />
                      )}
                    </Button>

                    <Button
                      onClick={() => performAction("recalculate_favorites")}
                      disabled={actionLoading === "recalculate_favorites"}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                    >
                      <div className="font-medium">Recalculate Favorites</div>
                      <div className="text-sm text-muted-foreground text-left">Fix favorites count inconsistencies</div>
                      {actionLoading === "recalculate_favorites" && <RefreshCw className="h-4 w-4 animate-spin mt-2" />}
                    </Button>

                    <Button
                      onClick={() => performAction("validate_all_data")}
                      disabled={actionLoading === "validate_all_data"}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                    >
                      <div className="font-medium">Validate All Data</div>
                      <div className="text-sm text-muted-foreground text-left">Run comprehensive schema validation</div>
                      {actionLoading === "validate_all_data" && <RefreshCw className="h-4 w-4 animate-spin mt-2" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-xs text-muted-foreground text-center">
            Last updated: {new Date(report.timestamp).toLocaleString()}
          </div>
        </>
      )}
    </div>
  )
}
