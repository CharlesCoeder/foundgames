"use client"

import { motion } from "framer-motion"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span>{progress}% complete</span>
      </div>

      <div className="h-2 w-full rounded-full bg-muted">
        <motion.div
          className="h-2 rounded-full bg-primary"
          initial={{ width: `${(currentStep / totalSteps) * 100}%` }}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

