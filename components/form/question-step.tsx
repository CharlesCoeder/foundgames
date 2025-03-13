"use client"

import type { UseFormReturn } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormValues } from "@/components/verification-form"

interface QuestionStepProps {
  form: UseFormReturn<FormValues>
  currentStep: number
  steps: {
    id: string
    question: string
    description: string
  }[]
}

export function QuestionStep({ form, currentStep, steps }: QuestionStepProps) {
  const currentField = steps[currentStep].id as keyof FormValues
  const errorMessage = form.formState.errors[currentField]?.message

  const renderInput = () => {
    switch (currentField) {
      case "building":
        return (
          <Select onValueChange={(value) => form.setValue("building", value)} value={form.getValues("building")}>
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
        )
      case "email":
        return (
          <Input
            type="email"
            placeholder={`Enter your ${currentField.replace(/([A-Z])/g, " $1").toLowerCase()}`}
            {...form.register(currentField)}
            className="text-lg h-14"
          />
        )
      default:
        return (
          <Input
            placeholder={`Enter your ${currentField.replace(/([A-Z])/g, " $1").toLowerCase()}`}
            {...form.register(currentField)}
            className="text-lg h-14"
          />
        )
    }
  }

  return (
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
          {renderInput()}
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

