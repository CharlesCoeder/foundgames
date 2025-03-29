"use client";

import type React from "react";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { StepIndicator } from "@/components/form/step-indicator";
import { QuestionStep } from "@/components/form/question-step";
import { SuccessScreen } from "@/components/form/success-screen";
import { ManualVerificationScreen } from "@/components/form/manual-verification-screen";
import { VerificationPendingScreen } from "@/components/form/verification-pending-screen";
import { FormNavigation } from "@/components/form/form-navigation";

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
});

export type FormValues = z.infer<typeof formSchema>;
export type VerificationStatus =
  | "idle"
  | "submitting"
  | "success"
  | "manual-verification"
  | "verification-pending";

export function VerificationForm() {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [leaseDocument, setLeaseDocument] = useState<File | null>(null);

  const form = useForm<FormValues>({
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
  });

  const steps = [
    {
      id: "firstName",
      question: "What's your first name?",
      description: "We'll use this to verify your residency",
    },
    {
      id: "lastName",
      question: "What's your last name?",
      description: "We'll use this to verify your residency",
    },
    {
      id: "building",
      question: "Which FOUND Study location do you live in?",
      description: "Select your current residence",
    },
    {
      id: "roomNumber",
      question: "What's your room number?",
      description: "This helps us verify your residency",
    },
    {
      id: "email",
      question: "What's your email address?",
      description:
        "We'll use this to notify you about your verification status",
    },
    {
      id: "discordUsername",
      question: "What's your Discord username?",
      description: "This helps us contact you about server updates and events",
    },
    {
      id: "minecraftUsername",
      question: "What's your Minecraft username?",
      description: "This is the username you use to log into Minecraft",
    },
  ];

  const nextStep = async () => {
    const currentField = steps[currentStep].id as keyof FormValues;
    const isValid = !form.formState.errors[currentField];

    if (isValid && form.getValues(currentField)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      // Trigger validation
      form.trigger(currentField);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setVerificationStatus("submitting");
    setError("");

    try {
      const formData = form.getValues();

      if (!process.env.NEXT_PUBLIC_VERIFIER_API_KEY) {
        throw new Error("Verifier API key is not configured");
      }

      // Make API call to Flask server
      const response = await fetch(
        "http://localhost:5000/api/user-building?" +
          new URLSearchParams({
            first_name: formData.firstName,
            last_name: formData.lastName,
            room_number: formData.roomNumber,
            building: formData.building,
            email: formData.email,
          }),
        {
          headers: {
            "X-API-Key": process.env.NEXT_PUBLIC_VERIFIER_API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Verification failed");
      }

      const data = await response.json();

      if (data === true) {
        setVerificationStatus("success");
      } else {
        setVerificationStatus("manual-verification");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "There was an error verifying your information. Please try again."
      );
      setVerificationStatus("idle");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLeaseDocument(e.target.files[0]);
    }
  };

  const handleManualVerificationSubmit = async () => {
    if (!leaseDocument) {
      setError("Please upload a document to verify your lease");
      return;
    }

    setVerificationStatus("submitting");

    try {
      // This would be a server action in a real implementation
      // await submitManualVerification(form.getValues(), leaseDocument)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setVerificationStatus("verification-pending");
    } catch (err) {
      setError(
        "There was an error submitting your verification. Please try again."
      );
      setVerificationStatus("manual-verification");
    }
  };

  if (verificationStatus === "success") {
    return <SuccessScreen />;
  }

  if (verificationStatus === "manual-verification") {
    return (
      <ManualVerificationScreen
        error={error}
        leaseDocument={leaseDocument}
        handleFileChange={handleFileChange}
        handleSubmit={handleManualVerificationSubmit}
        isSubmitting={
          verificationStatus === ("submitting" as VerificationStatus)
        }
        onBack={() => setVerificationStatus("idle")}
      />
    );
  }

  if (verificationStatus === "verification-pending") {
    return <VerificationPendingScreen />;
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

      <Form {...form}>
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <StepIndicator
              currentStep={currentStep}
              totalSteps={steps.length}
            />

            <div className="relative mt-8 min-h-[300px]">
              <QuestionStep
                form={form}
                currentStep={currentStep}
                steps={steps}
              />
            </div>
          </div>

          <FormNavigation
            currentStep={currentStep}
            totalSteps={steps.length}
            onPrev={prevStep}
            onNext={nextStep}
            isSubmitting={verificationStatus === "submitting"}
          />
        </div>
      </Form>
    </div>
  );
}
