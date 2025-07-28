"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, Bike, Gavel } from "lucide-react"

interface CategoryTabsProps {
  value: string
  onChange: (value: string) => void
  counts: {
    all: number
    auto: number
    moto: number
    aukcje: number
  }
}

export function CategoryTabs({ value, onChange, counts }: CategoryTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <span>Wszystkie</span>
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {counts.all.toLocaleString()}
          </span>
        </TabsTrigger>
        <TabsTrigger value="auto" className="flex items-center gap-2">
          <Car className="h-4 w-4" />
          <span>Auto</span>
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {counts.auto.toLocaleString()}
          </span>
        </TabsTrigger>
        <TabsTrigger value="moto" className="flex items-center gap-2">
          <Bike className="h-4 w-4" />
          <span>Moto</span>
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {counts.moto.toLocaleString()}
          </span>
        </TabsTrigger>
        <TabsTrigger value="aukcje" className="flex items-center gap-2">
          <Gavel className="h-4 w-4" />
          <span>Aukcje</span>
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {counts.aukcje.toLocaleString()}
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
