'use client'

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PrintButtonProps {
  label?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function PrintButton({ 
  label = "Print", 
  className = "hidden md:flex",
  variant = "outline",
  size = "sm"
}: PrintButtonProps) {
  return (
    <Button 
      variant={variant}
      size={size}
      onClick={() => window.print()}
      className={className}
    >
      <Printer className="w-4 h-4 mr-2" />
      {label}
    </Button>
  )
}