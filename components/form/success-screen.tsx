"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function SuccessScreen() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert className="border-green-500 bg-green-50 text-green-800">
        <Check className="h-4 w-4 text-green-800" />
        <AlertTitle>Success! You're verified!</AlertTitle>
        <AlertDescription>
          Your details were automatically verified and you are now authenticated to join our Minecraft server.
        </AlertDescription>
      </Alert>
      <div className="rounded-lg border p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-medium">What happens next?</h3>
        <ul className="ml-6 list-disc space-y-2 text-sm">
          <li>You've been automatically added to our whitelist</li>
          <li>You can now connect to the Minecraft server using your username</li>
          <li>Check the server info page for connection details</li>
        </ul>
        <div className="mt-6 flex gap-4">
          <Link href="/server-info">
            <Button>
              View Server Info
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

