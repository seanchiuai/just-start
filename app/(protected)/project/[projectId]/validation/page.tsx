"use client";

import { useRouter } from "next/navigation";
import { WizardLayout } from "@/components/features/project/wizard-layout";
import { ValidationStatus } from "@/components/features/validation/validation-status";
import { IssueCard } from "@/components/features/validation/issue-card";
import { ValidationActions } from "@/components/features/validation/validation-actions";
import {
  mockValidationResult,
  ValidationSeverity,
} from "@/lib/mocks/validation";

export default function ValidationPage() {
  const router = useRouter();

  // Mock project data - will be replaced with Convex query during integration
  const mockProject = {
    appName: "TaskFlow",
    currentStep: 4,
  };

  // Calculate issue counts by severity
  const counts = mockValidationResult.issues.reduce(
    (acc, issue) => {
      acc[issue.severity]++;
      return acc;
    },
    { info: 0, warning: 0, critical: 0 } as Record<ValidationSeverity, number>
  );

  const handleProceed = () => {
    // Log for development - will be replaced with Convex mutation
    console.log("Proceeding to PRD generation");

    // Navigate to PRD page
    // router.push(`/project/${projectId}/prd`);
  };

  const handleModify = () => {
    // Navigate back to tech stack
    // router.push(`/project/${projectId}/tech-stack`);
    console.log("Navigating back to tech stack");
  };

  return (
    <WizardLayout
      projectName={mockProject.appName}
      currentStep={mockProject.currentStep}
    >
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">
            Compatibility Check
          </h2>
          <p className="mt-2 text-muted-foreground">
            We've validated your tech stack choices for compatibility and best
            practices.
          </p>
        </div>

        {/* Status banner */}
        <ValidationStatus
          status={mockValidationResult.status}
          summary={mockValidationResult.summary}
          counts={counts}
        />

        {/* Issues list */}
        {mockValidationResult.issues.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display text-lg font-medium">Issues Found</h3>
            {mockValidationResult.issues.map((issue, index) => (
              <IssueCard key={index} issue={issue} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t">
          <ValidationActions
            status={mockValidationResult.status}
            onProceed={handleProceed}
            onModify={handleModify}
          />
        </div>
      </div>
    </WizardLayout>
  );
}
