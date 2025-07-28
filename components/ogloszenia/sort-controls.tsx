"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"

interface SortControlsProps {
  value: string
  onChange: (value: string) => void
}

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <ArrowUpDown className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Sortowanie" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Najnowsze</SelectItem>
        <SelectItem value="price_asc">Cena: od najniższej</SelectItem>
        <SelectItem value="price_desc">Cena: od najwyższej</SelectItem>
        <SelectItem value="mileage">Przebieg: od najmniejszego</SelectItem>
        <SelectItem value="year">Rok: od najnowszego</SelectItem>
      </SelectContent>
    </Select>
  )
}
