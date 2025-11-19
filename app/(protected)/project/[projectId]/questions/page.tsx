"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { WizardLayout } from "@/components/features/project/wizard-layout";
import { QuestionsForm } from "@/components/features/questions/questions-form";
import { QuestionsFormSkeleton } from "@/components/ui/query-loader";

export default function QuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as Id<"prdProjects">;

  // Fetch project and questions from Convex
  const project = useQuery(api.prdProjects.get, { projectId });
  const questionSet = useQuery(api.questions.getByProject, { projectId });
  const saveAnswers = useMutation(api.questions.saveAnswers);

  const handleSubmit = async (answers: Record<string, string>) => {
    try {
      await saveAnswers({ projectId, answers });
      router.push(`/project/${projectId}/tech-stack`);
    } catch (error) {
      console.error("Failed to save answers:", error);
    }
  };

  // Loading state
  if (project === undefined || questionSet === undefined) {
    return (
      <WizardLayout
        projectName="Loading..."
        currentStep={2}
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
          <QuestionsFormSkeleton />
        </div>
      </WizardLayout>
    );
  }

  // Error state - project not found or not authorized
  if (project === null) {
    return (
      <WizardLayout
        projectName="Error"
        currentStep={2}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">
              Project not found or you don&apos;t have access to it.
            </p>
          </div>
        </div>
      </WizardLayout>
    );
  }

  // Error state - questions not found
  if (questionSet === null) {
    return (
      <WizardLayout
        projectName={project.appName}
        currentStep={project.currentStep}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">
              Questions have not been generated for this project yet.
            </p>
          </div>
        </div>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      projectName={project.appName}
      currentStep={project.currentStep}
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
          questions={questionSet.questions}
          onSubmit={handleSubmit}
        />
      </div>
    </WizardLayout>
  );
}
