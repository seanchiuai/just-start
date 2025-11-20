"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
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
  const generateQuestions = useAction(api.questions.generate);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  // Fallback: trigger generation if questions don't exist
  useEffect(() => {
    if (project && questionSet === null && !isGenerating && !generationError) {
      setIsGenerating(true);
      generateQuestions({ projectId })
        .then(() => {
          setIsGenerating(false);
        })
        .catch((err) => {
          console.error("Failed to generate questions:", err);
          setGenerationError("Failed to generate questions. Please try again.");
          setIsGenerating(false);
        });
    }
  }, [project, questionSet, projectId, isGenerating, generationError, generateQuestions]);

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

  // Generating state or error state
  if (questionSet === null) {
    return (
      <WizardLayout
        projectName={project.appName}
        currentStep={project.currentStep}
      >
        <div className="flex flex-col items-center justify-center py-12">
          {generationError ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4">
              <p className="text-sm text-destructive">{generationError}</p>
              <button
                onClick={() => {
                  setGenerationError("");
                  setIsGenerating(false);
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
                Generating questions for your project...
              </p>
            </div>
          )}
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
