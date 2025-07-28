"use client"

import { Progress } from "@/components/ui/progress"

interface FormProgressProps {
  requiredFields: string[]
  completedFields: string[]
}

export function FormProgress({ requiredFields, completedFields }: FormProgressProps) {
  const completionPercentage = Math.round(
    (completedFields.length / requiredFields.length) * 100
  )

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Wypełniono {completedFields.length} z {requiredFields.length} wymaganych pól
        </p>
        <p className="text-sm font-medium">{completionPercentage}%</p>
      </div>
      <Progress value={completionPercentage} className="h-2" />
    </div>
  )
}
