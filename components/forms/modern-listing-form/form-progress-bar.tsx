"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Circle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormProgressBarProps {
  progress: number
}

export function FormProgressBar({ progress }: FormProgressBarProps) {
  const getProgressStatus = (progress: number) => {
    if (progress < 30) return { status: "low", color: "text-red-500", bgColor: "bg-red-500" }
    if (progress < 70) return { status: "medium", color: "text-yellow-500", bgColor: "bg-yellow-500" }
    return { status: "high", color: "text-green-500", bgColor: "bg-green-500" }
  }

  const { status, color, bgColor } = getProgressStatus(progress)

  const getStatusIcon = () => {
    switch (status) {
      case "low":
        return <AlertCircle className={cn("h-5 w-5", color)} />
      case "medium":
        return <Circle className={cn("h-5 w-5", color)} />
      case "high":
        return <CheckCircle className={cn("h-5 w-5", color)} />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "low":
        return "Wypełnij więcej pól, aby móc opublikować ogłoszenie"
      case "medium":
        return "Jeszcze kilka pól do wypełnienia"
      case "high":
        return "Formularz jest gotowy do publikacji!"
    }
  }

  return (
    <Card className="sticky top-4 z-10 shadow-lg border-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-sm">
              Postęp wypełniania: {progress}%
            </span>
          </div>
          <span className={cn("text-sm font-medium", color)}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="relative">
          <Progress 
            value={progress} 
            className="h-3"
          />
          <div 
            className={cn(
              "absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ease-out",
              bgColor
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Wskaźniki etapów */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={progress >= 20 ? color : ""}>Podstawowe</span>
          <span className={progress >= 40 ? color : ""}>Specyfikacja</span>
          <span className={progress >= 60 ? color : ""}>Cena</span>
          <span className={progress >= 80 ? color : ""}>Zdjęcia</span>
          <span className={progress >= 100 ? color : ""}>Gotowe</span>
        </div>
      </CardContent>
    </Card>
  )
}