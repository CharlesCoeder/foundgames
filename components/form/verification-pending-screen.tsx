"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function VerificationPendingScreen() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert className="border-amber-500 bg-amber-50 text-amber-800">
        <Check className="h-4 w-4 text-amber-800" />
        <AlertTitle>Verification in progress!</AlertTitle>
        <AlertDescription>Your manual verification request has been submitted and is being reviewed.</AlertDescription>
      </Alert>
      <div className="rounded-lg border p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-medium">What happens next?</h3>
        <ul className="ml-6 list-disc space-y-2 text-sm">
          <li>Our team will review your submitted documentation</li>
          <li>This process typically takes 1-2 business days</li>
          <li>You will be notified of any updates via email</li>
          <li>You can check your verification status anytime using your email address</li>
        </ul>
        <div className="mt-6 flex gap-4">
          <Link href="/status">
            <Button>
              Check Status
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

