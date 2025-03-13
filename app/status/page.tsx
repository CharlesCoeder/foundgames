"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2, Search } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export default function StatusPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<null | {
    status: "pending" | "approved" | "rejected" | "manual-review"
    minecraftUsername: string
    submittedAt: string
  }>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock response - randomly select a status for demonstration
      const statuses = ["approved", "pending", "manual-review"] as const
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      setStatus({
        status: randomStatus,
        minecraftUsername: "MinecraftPlayer123",
        submittedAt: "2025-03-10T15:30:00Z",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-12">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold">Check Verification Status</h1>
        <p className="text-muted-foreground">
          Enter your email address to check the status of your verification request
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>Enter the email address you used during verification</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormDescription>We'll use this to look up your verification status.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Check Status
                  </>
                )}
              </Button>
            </form>
          </Form>

          {status && (
            <div className="mt-6 rounded-lg border p-4">
              <h3 className="mb-2 font-medium">Verification Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={
                      status.status === "approved"
                        ? "font-medium text-green-600"
                        : status.status === "rejected"
                          ? "font-medium text-red-600"
                          : status.status === "manual-review"
                            ? "font-medium text-amber-600"
                            : "font-medium text-amber-600"
                    }
                  >
                    {status.status === "approved"
                      ? "Approved"
                      : status.status === "rejected"
                        ? "Rejected"
                        : status.status === "manual-review"
                          ? "Manual Review"
                          : "Pending Review"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minecraft Username:</span>
                  <span>{status.minecraftUsername}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span>{new Date(status.submittedAt).toLocaleDateString()}</span>
                </div>

                {status.status === "manual-review" && (
                  <div className="mt-2 rounded-md bg-amber-50 p-2 text-amber-800">
                    Your verification requires manual review. We're working on it and will notify you via email when
                    complete.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/">Return Home</Link>
          </Button>
          {status?.status === "approved" && (
            <Button asChild>
              <Link href="/server-info">
                Server Info
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

