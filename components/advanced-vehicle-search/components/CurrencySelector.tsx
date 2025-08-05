"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign } from "lucide-react"

interface CurrencySelectorProps {
  value: 'CHF' | 'EUR' | 'USD'
  onChange: (currency: 'CHF' | 'EUR' | 'USD') => void
  className?: string
}

export function CurrencySelector({ value, onChange, className }: CurrencySelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DollarSign className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-20 touch-friendly">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CHF">CHF</SelectItem>
          <SelectItem value="EUR">EUR</SelectItem>
          <SelectItem value="USD">USD</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}