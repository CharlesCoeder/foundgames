"use client"

import type React from "react"

import { AlertCircle, Loader2, Upload } from "lucide-react"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ManualVerificationScreenProps {
  error: string
  leaseDocument: File | null
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: () => void
  isSubmitting: boolean
  onBack: () => void
}

export function ManualVerificationScreen({
  error,
  leaseDocument,
  handleFileChange,
  handleSubmit,
  isSubmitting,
  onBack,
}: ManualVerificationScreenProps) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>We need some additional verification</AlertTitle>
        <AlertDescription>
          We couldn't automatically verify your residency. Please provide a photo of your lease confirmation.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-medium">Manual Verification Required</h3>
        <p className="mb-4 text-muted-foreground">
          Please upload a photo of your lease confirmation email containing your name, room number, and building. This
          will help us verify your residency.
        </p>

        <div className="mb-6 rounded-lg border-2 border-dashed p-8 text-center">
          <input type="file" id="lease-document" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
          <label htmlFor="lease-document" className="flex cursor-pointer flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-lg font-medium">
              {leaseDocument ? leaseDocument.name : "Click to upload document"}
            </span>
            <span className="text-sm text-muted-foreground">
              {leaseDocument ? `${(leaseDocument.size / 1024 / 1024).toFixed(2)} MB` : "PDF, JPG, or PNG up to 10MB"}
            </span>
          </label>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleSubmit} disabled={!leaseDocument || isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Submit Verification"
            )}
          </Button>
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back to Form
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

