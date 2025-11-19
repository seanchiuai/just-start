"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  labels,
}: ProgressIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm transition-all duration-300",
                  step < currentStep && "bg-foreground text-background",
                  step === currentStep &&
                    "border-2 border-primary bg-background text-primary animate-pulse-ring",
                  step > currentStep &&
                    "border-2 border-muted-foreground/30 bg-background text-muted-foreground"
                )}
              >
                {step < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              {labels && labels[index] && (
                <span
                  className={cn(
                    "mt-2 text-xs font-mono hidden sm:block",
                    step === currentStep
                      ? "text-primary font-medium"
                      : step < currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {labels[index]}
                </span>
              )}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2">
                <div
                  className={cn(
                    "h-0.5 w-full transition-all duration-300",
                    step < currentStep
                      ? "bg-foreground"
                      : "border-t-2 border-dashed border-muted-foreground/30"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
