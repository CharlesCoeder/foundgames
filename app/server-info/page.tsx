import { Copy, GamepadIcon, Server } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ServerInfoPage() {
  return (
    <div className="container max-w-2xl py-12">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold">Minecraft Server Information</h1>
        <p className="text-muted-foreground">
          You've been approved! Here's everything you need to connect to our server.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Server className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>FOUND Games Minecraft Server</CardTitle>
            <CardDescription>Java Edition 1.20.4</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Server Address</h3>
            <div className="flex items-center gap-2 rounded-md border p-2">
              <code className="flex-1 text-sm">mc.foundgames.example.com</code>
              <Button variant="ghost" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Server Rules</h3>
            <ul className="ml-6 list-disc space-y-2 text-sm">
              <li>Be respectful to all players</li>
              <li>No griefing or stealing from other players</li>
              <li>No excessive profanity or inappropriate content</li>
              <li>No hacking, cheating, or using exploits</li>
              <li>Report any issues to the server admins on Discord</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Getting Started</h3>
            <ol className="ml-6 list-decimal space-y-2 text-sm">
              <li>Launch Minecraft Java Edition (version 1.20.4)</li>
              <li>Click on "Multiplayer"</li>
              <li>Click "Add Server"</li>
              <li>Enter "FOUND Games" as the server name</li>
              <li>Enter the server address shown above</li>
              <li>Click "Done" and join the server!</li>
            </ol>
          </div>

          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center gap-2">
              <GamepadIcon className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Need help?</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Join our Discord server for support, to meet other players, and to stay updated on server events.
            </p>
            <Button className="mt-4 w-full" variant="outline">
              Join Discord Server
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

