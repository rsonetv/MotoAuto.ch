"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UserStats() {
  // Replace mock data with real queries later
  const stats = [
    { label: "Aktywne ogłoszenia", value: 3 },
    { label: "Wygrane aukcje", value: 1 },
    { label: "Łączna liczba wizyt", value: 742 },
  ]
  return (
    <section className="grid sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
