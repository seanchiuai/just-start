"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { WizardLayout } from "@/components/features/project/wizard-layout";
import { ValidationStatus } from "@/components/features/validation/validation-status";
import { IssueCard } from "@/components/features/validation/issue-card";
import { ValidationActions } from "@/components/features/validation/validation-actions";
import { ValidationSkeleton } from "@/components/ui/query-loader";
import type { ValidationSeverity, ValidationIssue, CompatibilityCheck } from "@/lib/types/prd";

export default function ValidationPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as Id<"prdProjects">;

  // Fetch project and validation data
  const project = useQuery(api.prdProjects.get, { projectId });
  const validation = useQuery(api.compatibility.getByProject, { projectId }) as CompatibilityCheck | null | undefined;

  // Mutation to acknowledge warnings
  const acknowledgeWarnings = useMutation(api.compatibility.acknowledgeWarnings);
  const validateCompatibility = useAction(api.compatibility.validate);

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
  if (project === undefined || validation === undefined) {
    return (
      <WizardLayout projectName="Loading..." currentStep={4}>
        <ValidationSkeleton />
      </WizardLayout>
    );
  }

  // Error state - project not found
  if (project === null) {
    return (
      <WizardLayout projectName="Error" currentStep={4}>
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
      <WizardLayout projectName={project.appName} currentStep={project.currentStep}>
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

  const handleProceed = async () => {
    try {
      if (validation.status === "warnings") {
        await acknowledgeWarnings({ projectId });
      }
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
          />
        </div>
      </div>
    </WizardLayout>
  );
}
