"use client"

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FormNavigationProps {
  currentStep: number
  totalSteps: number
  onPrev: () => void
  onNext: () => void
  isSubmitting: boolean
  isCheckingDiscord: boolean
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isSubmitting,
  isCheckingDiscord,
}: FormNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t p-4">
      <Button
        type="button"
        variant="outline"
        onClick={onPrev}
        disabled={currentStep === 0 || isSubmitting || isCheckingDiscord}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Button type="button" onClick={onNext} disabled={isSubmitting || isCheckingDiscord}>
        {isCheckingDiscord ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying Discord...
          </>
        ) : isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : currentStep === totalSteps - 1 ? (
          "Submit Verification"
        ) : (
          <>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}

