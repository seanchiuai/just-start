"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/features/progress/progress-indicator";
import { StageNavigation } from "@/components/features/project/stage-navigation";
import { Id } from "@/convex/_generated/dataModel";

interface WizardLayoutProps {
  children: React.ReactNode;
  projectName: string;
  currentStep: number;
  projectId?: Id<"prdProjects">;
  totalSteps?: number;
  stepLabels?: string[];
}

const defaultStepLabels = ["Input", "Questions", "Tech Stack", "Validation", "PRD"];

export function WizardLayout({
  children,
  projectName,
  currentStep,
  projectId,
  totalSteps = 5,
  stepLabels = defaultStepLabels,
}: WizardLayoutProps) {
  return (
    <div className="min-h-screen bg-background bg-dotgrid">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <h1 className="font-display text-xl font-semibold truncate max-w-md">
              {projectName}
            </h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          {/* Stage Navigation - only show if projectId is provided */}
          {projectId ? (
            <div className="max-w-4xl mx-auto">
              <StageNavigation projectId={projectId} currentStep={currentStep} />
            </div>
          ) : (
            /* Progress indicator fallback */
            <div className="max-w-2xl mx-auto">
              <ProgressIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
                labels={stepLabels}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-paper-warm rounded-lg border p-6 sm:p-8 shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
