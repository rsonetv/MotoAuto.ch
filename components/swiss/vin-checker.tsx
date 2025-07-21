"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface VINCheckerProps {
  onVINValidated?: (vin: string, data: any) => void
}

export function VINChecker({ onVINValidated }: VINCheckerProps) {
  const [vin, setVin] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<{
    valid: boolean
    data?: any
    error?: string
  } | null>(null)

  const validateVIN = (vinCode: string): boolean => {
    // Basic VIN validation (17 characters, alphanumeric except I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/
    return vinRegex.test(vinCode.toUpperCase())
  }

  const checkVIN = async () => {
    if (!vin.trim()) return

    setIsChecking(true)
    setResult(null)

    try {
      // Basic validation first
      if (!validateVIN(vin)) {
        setResult({
          valid: false,
          error: "Ungültige VIN-Nummer. VIN muss 17 Zeichen lang sein.",
        })
        return
      }

      // In a real implementation, you would call a VIN checking service
      // For now, we'll simulate a check
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful validation
      const mockData = {
        make: "BMW",
        model: "320i",
        year: 2020,
        engine: "2.0L Turbo",
        transmission: "Automatic",
        fuel_type: "Benzin",
        swiss_registered: true,
        last_inspection: "2023-12-15",
        recalls: 0,
      }

      setResult({
        valid: true,
        data: mockData,
      })

      if (onVINValidated) {
        onVINValidated(vin, mockData)
      }
    } catch (error) {
      setResult({
        valid: false,
        error: "Fehler beim Überprüfen der VIN-Nummer. Bitte versuchen Sie es später erneut.",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vin">VIN-Nummer (Fahrzeugidentifikationsnummer)</Label>
        <div className="flex gap-2">
          <Input
            id="vin"
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            placeholder="z.B. WBAVA31070NL12345"
            maxLength={17}
            className="font-mono"
          />
          <Button onClick={checkVIN} disabled={!vin.trim() || isChecking} className="shrink-0">
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Prüfen...
              </>
            ) : (
              "VIN prüfen"
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Die VIN finden Sie im Fahrzeugausweis oder am Armaturenbrett.</p>
      </div>

      {result && (
        <Alert variant={result.valid ? "default" : "destructive"}>
          <div className="flex items-center gap-2">
            {result.valid ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4" />}
            <AlertDescription>
              {result.valid ? (
                <div className="space-y-2">
                  <p className="font-medium">VIN erfolgreich validiert!</p>
                  {result.data && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Marke: {result.data.make}</div>
                      <div>Modell: {result.data.model}</div>
                      <div>Baujahr: {result.data.year}</div>
                      <div>Motor: {result.data.engine}</div>
                      <div>Getriebe: {result.data.transmission}</div>
                      <div>Kraftstoff: {result.data.fuel_type}</div>
                      <div className="col-span-2">
                        {result.data.swiss_registered ? (
                          <span className="text-green-600">✓ In der Schweiz zugelassen</span>
                        ) : (
                          <span className="text-orange-600">⚠ Nicht in der Schweiz zugelassen</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                result.error
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}
