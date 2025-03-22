"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import { createAdminClient } from "@/app/utils/supabase/admin-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminSetupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use a simple setup key mechanism for security (in a real app, you might use a more secure approach)
  const SETUP_KEY = "FOUND_GAMES_ADMIN_SETUP"; // In a real app, this would be an environment variable

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Verify setup key
      if (setupKey !== SETUP_KEY) {
        throw new Error("Invalid setup key");
      }

      // Use the regular client for authentication
      const supabase = createClient();

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: {
              // Set user metadata during signup
              name: name,
            },
          },
        }
      );

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Use admin client with service role to bypass RLS for creating the profile
      const adminClient = createAdminClient();

      // Create the profile with admin role using service role key to bypass RLS
      const { error: profileError } = await adminClient
        .from("profiles")
        .upsert({
          id: authData.user.id,
          name: name,
          email: email,
          role: "admin",
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile error:", profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      setSuccess(
        "Admin user created successfully! Please check your email to confirm your account."
      );
    } catch (err: any) {
      console.error("Admin setup error:", err);
      setError(err.message || "Failed to create admin user");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Admin Setup</CardTitle>
            <CardDescription>
              Create the initial admin account for FOUND Games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="setupKey" className="text-sm font-medium">
                  Setup Key
                </label>
                <Input
                  id="setupKey"
                  type="password"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  required
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateAdmin}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                "Create Admin"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
