"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

export function AuctionFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtry aukcji</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium mb-2">Cena (CHF)</p>
          <Slider defaultValue={[0, 200000]} max={200000} step={1000} />
        </div>
        {/* Add real filters later */}
      </CardContent>
    </Card>
  )
}
