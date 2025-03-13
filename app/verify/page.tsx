import { VerificationForm } from "@/components/verification-form"

export default function VerifyPage() {
  return (
    <div className="container max-w-2xl py-12">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold">Minecraft Server Verification</h1>
        <p className="text-muted-foreground">
          Complete this form to verify your FOUND residency and join our Minecraft server
        </p>
      </div>
      <VerificationForm />
    </div>
  )
}

