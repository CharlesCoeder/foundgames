"use client";

import type { UseFormReturn } from "react-hook-form";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import type { FormValues } from "@/components/verification-form";

interface DiscordVerificationStepProps {
  form: UseFormReturn<FormValues>;
  error?: string;
  discordError: string;
  question: string;
  description: string;
}

export function DiscordVerificationStep({
  form,
  error,
  discordError,
  question,
  description,
}: DiscordVerificationStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{question}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Enter your Discord username"
          {...form.register("discordUsername")}
          className="text-lg h-14"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        {discordError && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-col gap-3">
              <p className="text-amber-800">{discordError}</p>
              <a
                href="https://discord.gg/7wFdg8Ne7H"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Join our Discord server
                <ExternalLink className="h-3 w-3" />
              </a>
              <p className="text-xs text-muted-foreground">
                After joining, click "Next" again to verify your Discord
                username
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
