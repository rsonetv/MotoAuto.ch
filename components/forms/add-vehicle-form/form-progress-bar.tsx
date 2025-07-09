"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle } from "lucide-react"

interface FormProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function FormProgressBar({ currentStep, totalSteps }: FormProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Dodawanie ogłoszenia</h2>
        <span className="text-sm text-gray-500">
          Krok {currentStep + 1} z {totalSteps}
        </span>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Rozpoczęte</span>
          <span>{Math.round(progress)}% ukończone</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                index <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div className={`h-0.5 w-12 mx-2 ${index < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
