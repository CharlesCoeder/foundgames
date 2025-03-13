import Link from "next/link"
import { ArrowRight, Check, GamepadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 font-bold">
            <GamepadIcon className="h-6 w-6" />
            <span>FOUND Games</span>
          </div>
          <nav className="ml-auto flex gap-4">
            <Link
              href="/verify"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Verify
            </Link>
            <Link
              href="/status"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Check Status
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Join the FOUND Games Minecraft Community
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Connect with fellow residents in our exclusive Minecraft server. Verify your residency to get
                    started.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/verify">
                    <Button size="lg">
                      Get Verified
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/status">
                    <Button size="lg" variant="outline">
                      Check Verification Status
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card>
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>Follow these steps to join our Minecraft server</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">Join our Discord</p>
                        <p className="text-sm text-muted-foreground">
                          First, join the FOUND Games Discord server to connect with the community
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">Complete Verification</p>
                        <p className="text-sm text-muted-foreground">
                          Fill out the verification form with your resident details and Minecraft username
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">Get Whitelisted</p>
                        <p className="text-sm text-muted-foreground">
                          Once verified, you'll be whitelisted on the server and can start playing
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/verify" className="w-full">
                      <Button className="w-full">Start Verification</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 FOUND Games. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

