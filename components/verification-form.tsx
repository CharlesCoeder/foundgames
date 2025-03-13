"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowLeft, ArrowRight, Check, ExternalLink, Loader2, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  building: z.string({
    required_error: "Please select your FOUND building.",
  }),
  roomNumber: z.string().min(1, {
    message: "Room number is required.",
  }),
  discordUsername: z.string().min(2, {
    message: "Discord username is required.",
  }),
  minecraftUsername: z.string().min(3, {
    message: "Minecraft username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

type VerificationStatus = "idle" | "submitting" | "success" | "manual-verification" | "verification-pending"

export function VerificationForm() {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle")
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [leaseDocument, setLeaseDocument] = useState<File | null>(null)
  const [isCheckingDiscord, setIsCheckingDiscord] = useState(false)
  const [discordError, setDiscordError] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      building: "",
      roomNumber: "",
      discordUsername: "",
      minecraftUsername: "",
      email: "",
    },
    mode: "onChange",
  })

  const steps = [
    {
      id: "firstName",
      question: "What's your first name?",
      description: "We'll use this to verify your residency",
      component: <Input placeholder="Enter your first name" {...form.register("firstName")} className="text-lg h-14" />,
      error: form.formState.errors.firstName?.message,
    },
    {
      id: "lastName",
      question: "What's your last name?",
      description: "We'll use this to verify your residency",
      component: <Input placeholder="Enter your last name" {...form.register("lastName")} className="text-lg h-14" />,
      error: form.formState.errors.lastName?.message,
    },
    {
      id: "building",
      question: "Which FOUND Study location do you live in?",
      description: "Select your current residence",
      component: (
        <Select onValueChange={(value) => form.setValue("building", value)}>
          <SelectTrigger className="text-lg h-14">
            <SelectValue placeholder="Select your building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chelsea">FOUND Study Chelsea</SelectItem>
            <SelectItem value="midtown-east">FOUND Study Midtown East</SelectItem>
            <SelectItem value="turtle-bay">FOUND Study Turtle Bay</SelectItem>
            <SelectItem value="brooklyn-heights">FOUND Study Brooklyn Heights</SelectItem>
          </SelectContent>
        </Select>
      ),
      error: form.formState.errors.building?.message,
    },
    {
      id: "roomNumber",
      question: "What's your room number?",
      description: "This helps us verify your residency",
      component: (
        <Input placeholder="Enter your room number" {...form.register("roomNumber")} className="text-lg h-14" />
      ),
      error: form.formState.errors.roomNumber?.message,
    },
    {
      id: "email",
      question: "What's your email address?",
      description: "We'll use this to notify you about your verification status",
      component: (
        <Input
          type="email"
          placeholder="Enter your email address"
          {...form.register("email")}
          className="text-lg h-14"
        />
      ),
      error: form.formState.errors.email?.message,
    },
    {
      id: "discordUsername",
      question: "What's your Discord username?",
      description: "We'll verify that you've joined our Discord server",
      component: (
        <Input
          placeholder="Enter your Discord username"
          {...form.register("discordUsername")}
          className="text-lg h-14"
        />
      ),
      error: form.formState.errors.discordUsername?.message || discordError,
    },
    {
      id: "minecraftUsername",
      question: "What's your Minecraft username?",
      description: "This is the username you use to log into Minecraft",
      component: (
        <Input
          placeholder="Enter your Minecraft username"
          {...form.register("minecraftUsername")}
          className="text-lg h-14"
        />
      ),
      error: form.formState.errors.minecraftUsername?.message,
    },
  ]

  // Function to check if Discord username exists in the server
  const checkDiscordUsername = async (username: string): Promise<boolean> => {
    setIsCheckingDiscord(true)
    setDiscordError("")

    try {
      // This would be a real API call in production
      // const response = await fetch(`/api/check-discord?username=${encodeURIComponent(username)}`)
      // const data = await response.json()
      // return data.exists

      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, let's say usernames that start with "found" are in the server
      // In a real implementation, this would check against your Discord server API
      return username.toLowerCase().startsWith("found")
    } catch (error) {
      console.error("Error checking Discord username:", error)
      return false
    } finally {
      setIsCheckingDiscord(false)
    }
  }

  const nextStep = async () => {
    const currentField = steps[currentStep].id as keyof z.infer<typeof formSchema>
    const isValid = !form.formState.errors[currentField]

    if (isValid && form.getValues(currentField)) {
      // Special handling for Discord username verification
      if (currentField === "discordUsername") {
        const discordUsername = form.getValues("discordUsername")
        const isInDiscord = await checkDiscordUsername(discordUsername)

        if (!isInDiscord) {
          setDiscordError("We couldn't find you in our Discord server. Please join before continuing.")
          return
        }

        // Clear any previous Discord errors if verification succeeds
        setDiscordError("")
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    } else {
      // Trigger validation
      form.trigger(currentField)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    // Double-check Discord verification before final submission
    const discordUsername = form.getValues("discordUsername")
    const isInDiscord = await checkDiscordUsername(discordUsername)

    if (!isInDiscord) {
      setCurrentStep(5) // Go back to Discord username step
      setDiscordError("We couldn't find you in our Discord server. Please join before continuing.")
      return
    }

    setVerificationStatus("submitting")
    setError("")

    try {
      // This would be a server action in a real implementation
      // const result = await submitVerification(form.getValues())

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate verification result (50/50 chance of automatic vs manual verification)
      const isAutomaticallyVerified = Math.random() > 0.5

      if (isAutomaticallyVerified) {
        setVerificationStatus("success")
      } else {
        setVerificationStatus("manual-verification")
      }
    } catch (err) {
      setError("There was an error submitting your verification. Please try again.")
      setVerificationStatus("idle")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLeaseDocument(e.target.files[0])
    }
  }

  const handleManualVerificationSubmit = async () => {
    if (!leaseDocument) {
      setError("Please upload a document to verify your lease")
      return
    }

    setVerificationStatus("submitting")

    try {
      // This would be a server action in a real implementation
      // await submitManualVerification(form.getValues(), leaseDocument)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setVerificationStatus("verification-pending")
    } catch (err) {
      setError("There was an error submitting your verification. Please try again.")
      setVerificationStatus("manual-verification")
    }
  }

  if (verificationStatus === "success") {
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

  if (verificationStatus === "manual-verification") {
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
            <input
              type="file"
              id="lease-document"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
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
            <Button
              onClick={handleManualVerificationSubmit}
              disabled={!leaseDocument || verificationStatus === "submitting"}
              className="flex-1"
            >
              {verificationStatus === "submitting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Submit Verification"
              )}
            </Button>
            <Button variant="outline" onClick={() => setVerificationStatus("idle")} className="flex-1">
              Back to Form
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (verificationStatus === "verification-pending") {
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
          <AlertDescription>
            Your manual verification request has been submitted and is being reviewed.
          </AlertDescription>
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

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <p>
            You must join our{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Discord server
            </a>{" "}
            before completing this form.
          </p>
        </div>
      </div>

      <Form {...form}>
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <div className="mb-4 flex justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
            </div>

            <div className="h-2 w-full rounded-full bg-muted">
              <motion.div
                className="h-2 rounded-full bg-primary"
                initial={{ width: `${(currentStep / steps.length) * 100}%` }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="relative mt-8 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{steps[currentStep].question}</h2>
                    <p className="text-muted-foreground">{steps[currentStep].description}</p>
                  </div>

                  <div className="space-y-4">
                    {steps[currentStep].component}
                    {steps[currentStep].error && <p className="text-sm text-destructive">{steps[currentStep].error}</p>}

                    {/* Discord error and join button */}
                    {currentStep === 5 && discordError && (
                      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
                        <div className="flex flex-col gap-3">
                          <p className="text-amber-800">{discordError}</p>
                          <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                          >
                            Join our Discord server
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <p className="text-xs text-muted-foreground">
                            After joining, click "Next" again to verify your Discord username
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-between border-t p-4">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || verificationStatus === "submitting" || isCheckingDiscord}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              type="button"
              onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
              disabled={verificationStatus === "submitting" || isCheckingDiscord}
            >
              {isCheckingDiscord ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Discord...
                </>
              ) : verificationStatus === "submitting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : currentStep === steps.length - 1 ? (
                "Submit Verification"
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}

