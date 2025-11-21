"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Loader2, AlertCircle, CreditCard } from "lucide-react";
import { WizardLayout } from "@/components/features/project/wizard-layout";
import { ValidationStatus } from "@/components/features/validation/validation-status";
import { IssueCard } from "@/components/features/validation/issue-card";
import { ValidationActions } from "@/components/features/validation/validation-actions";
import { ValidationSkeleton } from "@/components/ui/query-loader";
import type { ValidationSeverity, ValidationIssue, CompatibilityCheck } from "@/lib/types/prd";
import { Card, CardContent } from "@/components/ui/card";

export default function ValidationPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as Id<"prdProjects">;

  // Fetch project and validation data
  const project = useQuery(api.prdProjects.get, { projectId });
  const validation = useQuery(api.compatibility.getByProject, { projectId }) as CompatibilityCheck | null | undefined;
  const user = useQuery(api.users.getCurrentUser);

  // Mutation to acknowledge warnings
  const acknowledgeWarnings = useMutation(api.compatibility.acknowledgeWarnings);
  const validateCompatibility = useAction(api.compatibility.validate);
  const resetFromStage = useMutation(api.prdProjects.resetFromStage);
  const generatePRD = useAction(api.prdActions.generate);
  const existingPRD = useQuery(api.prd.getByProject, { projectId });

  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Fallback: trigger validation if it doesn't exist
  useEffect(() => {
    if (project && validation === null && !isValidating && !validationError) {
      setIsValidating(true);
      validateCompatibility({ projectId })
        .then(() => {
          setIsValidating(false);
        })
        .catch((err) => {
          console.error("Failed to validate compatibility:", err);
          setValidationError("Failed to validate compatibility. Please try again.");
          setIsValidating(false);
        });
    }
  }, [project, validation, projectId, isValidating, validationError, validateCompatibility]);

  // Loading state
  if (project === undefined || validation === undefined || user === undefined) {
    return (
      <WizardLayout projectName="Loading..." currentStep={4} projectId={projectId}>
        <ValidationSkeleton />
      </WizardLayout>
    );
  }

  // Error state - project not found
  if (project === null) {
    return (
      <WizardLayout projectName="Error" currentStep={4} projectId={projectId}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">
              Project not found. Please check the URL and try again.
            </p>
          </div>
        </div>
      </WizardLayout>
    );
  }

  // Validating state or error state
  if (validation === null) {
    return (
      <WizardLayout projectName={project.appName} currentStep={project.currentStep} projectId={projectId}>
        <div className="flex flex-col items-center justify-center py-12">
          {validationError ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4">
              <p className="text-sm text-destructive">{validationError}</p>
              <button
                onClick={() => {
                  setValidationError("");
                  setIsValidating(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Validating tech stack compatibility...
              </p>
            </div>
          )}
        </div>
      </WizardLayout>
    );
  }

  // Calculate issue counts by severity
  const counts = validation.issues.reduce(
    (acc: Record<ValidationSeverity, number>, issue: ValidationIssue) => {
      acc[issue.severity]++;
      return acc;
    },
    { critical: 0, moderate: 0, low: 0 }
  );

  // Check credits
  const hasCredits = user && user.subscription.credits > 0;
  const creditsRemaining = user?.subscription.credits ?? 0;

  const handleProceed = async () => {
    if (!hasCredits) {
      return; // Disabled when no credits
    }
    
    try {
      if (validation.status === "warnings") {
        await acknowledgeWarnings({ projectId });
      }
      
      // If PRD already exists (regenerating), reset stage
      if (existingPRD) {
        await resetFromStage({ projectId, stage: 4 });
      }
      
      // Generate the PRD
      await generatePRD({ projectId });
      
      // Navigate to PRD page
      router.push(`/project/${projectId}/prd`);
    } catch (error) {
      console.error("Failed to proceed:", error);
    }
  };

  const handleModify = () => {
    router.push(`/project/${projectId}/tech-stack`);
  };

  return (
    <WizardLayout
      projectName={project.appName}
      currentStep={project.currentStep}
      projectId={projectId}
    >
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">
            Compatibility Check
          </h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;ve validated your tech stack choices for compatibility and best
            practices.
          </p>
        </div>

        {/* Status banner */}
        <ValidationStatus
          status={validation.status}
          summary={validation.summary}
          counts={counts}
        />

        {/* Credit warning card */}
        {user && (
          <Card className={hasCredits ? "border-blue-200 bg-blue-50/50" : "border-destructive bg-destructive/5"}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${hasCredits ? "bg-blue-100" : "bg-destructive/10"}`}>
                  {hasCredits ? (
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium ${hasCredits ? "text-blue-900" : "text-destructive"}`}>
                      {hasCredits ? "Credit Usage" : "No Credits Remaining"}
                    </h3>
                    <span className={`text-sm font-semibold ${hasCredits ? "text-blue-700" : "text-destructive"}`}>
                      {creditsRemaining} {creditsRemaining === 1 ? "credit" : "credits"} left
                    </span>
                  </div>
                  <p className={`text-sm ${hasCredits ? "text-blue-700" : "text-destructive"}`}>
                    {hasCredits 
                      ? "Generating your PRD will use 1 credit." 
                      : "You need at least 1 credit to generate a PRD. Please upgrade your plan to continue."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issues list */}
        {validation.issues.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display text-lg font-medium">Issues Found</h3>
            {validation.issues.map((issue, index) => (
              <IssueCard key={index} issue={issue} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t">
          <ValidationActions
            status={validation.status}
            onProceed={handleProceed}
            onModify={handleModify}
            disabled={!hasCredits}
            disabledMessage={!hasCredits ? "Upgrade to continue" : undefined}
          />
        </div>
      </div>
    </WizardLayout>
  );
}
