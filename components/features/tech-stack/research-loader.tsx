"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchLoaderProps {
  currentStep: number;
}

const researchSteps = [
  "Analyzing project requirements",
  "Researching frontend frameworks",
  "Evaluating backend solutions",
  "Comparing database options",
  "Reviewing authentication providers",
  "Finalizing recommendations",
];

export function ResearchLoader({ currentStep }: ResearchLoaderProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-display text-xl font-medium">
          Researching Tech Stack
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Finding the best technologies for your project...
        </p>
      </div>

      <div className="relative pl-6">
        {/* Vertical timeline line */}
        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />

        <div className="space-y-4">
          {researchSteps.map((step, index) => (
            <div key={step} className="relative flex items-center gap-3">
              {/* Timeline dot */}
              <div
                className={cn(
                  "absolute -left-6 flex h-4 w-4 items-center justify-center rounded-full",
                  index < currentStep && "bg-success text-white",
                  index === currentStep && "bg-primary text-white animate-pulse-ring",
                  index > currentStep && "border-2 border-muted bg-background"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-2.5 w-2.5" />
                ) : index === currentStep ? (
                  <Circle className="h-2 w-2 fill-current" />
                ) : null}
              </div>

              {/* Step text */}
              <span
                className={cn(
                  "text-sm",
                  index < currentStep && "text-foreground",
                  index === currentStep && "text-primary font-medium",
                  index > currentStep && "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
