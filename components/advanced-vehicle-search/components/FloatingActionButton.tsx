"use client"

import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

interface FloatingActionButtonProps {
  variant: 'search' | 'filter'
  onClick: () => void
  className?: string
}

export function FloatingActionButton({ variant, onClick, className }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`fab-button ${className}`}
      size="icon"
    >
      {variant === 'search' ? (
        <Search className="h-6 w-6" />
      ) : (
        <Filter className="h-6 w-6" />
      )}
    </Button>
  )
}