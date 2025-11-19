"use client";

import { useRouter } from "next/navigation";
import { WizardLayout } from "@/components/features/project/wizard-layout";
import { QuestionsForm } from "@/components/features/questions/questions-form";
import { mockQuestions } from "@/lib/mocks/questions";

export default function QuestionsPage() {
  const router = useRouter();

  // Mock project data - will be replaced with Convex query during integration
  const mockProject = {
    appName: "TaskFlow",
    currentStep: 2,
  };

  const handleSubmit = (answers: Record<string, string>) => {
    // Log for development - will be replaced with Convex mutation
    console.log("Submitted answers:", answers);

    // Navigate to next step
    // router.push(`/project/${projectId}/tech-stack`);
  };

  return (
    <WizardLayout
      projectName={mockProject.appName}
      currentStep={mockProject.currentStep}
    >
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">
            Clarifying Questions
          </h2>
          <p className="mt-2 text-muted-foreground">
            Help us understand your project better by answering these questions.
            Your responses will shape the tech stack recommendations.
          </p>
        </div>

        <QuestionsForm
          questions={mockQuestions}
          onSubmit={handleSubmit}
        />
      </div>
    </WizardLayout>
  );
}
