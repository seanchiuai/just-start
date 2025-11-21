"use client";

import { useState, useEffect } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { WizardLayout } from "@/components/features/project/wizard-layout";
import { Id } from "@/convex/_generated/dataModel";

export default function InputEditPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as Id<"prdProjects">;

  const project = useQuery(api.prdProjects.get, { projectId });
  const updateInput = useMutation(api.prdProjects.updateInput);
  const resetFromStage = useMutation(api.prdProjects.resetFromStage);
  const generateQuestions = useAction(api.questions.generate);

  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Updating...");
  const [error, setError] = useState("");

  // Pre-fill form when project loads
  useEffect(() => {
    if (project) {
      setAppName(project.appName);
      setAppDescription(project.appDescription);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!appName.trim() || !appDescription.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      setLoadingMessage("Updating project...");
      // Update the project input
      await updateInput({
        projectId,
        appName: appName.trim(),
        appDescription: appDescription.trim(),
      });

      setLoadingMessage("Resetting subsequent stages...");
      // Reset all stages after input
      await resetFromStage({ projectId, stage: 1 });

      setLoadingMessage("Generating new questions...");
      // Generate new questions
      await generateQuestions({ projectId });

      // Navigate to questions
      router.push(`/project/${projectId}/questions`);
    } catch (err) {
      console.error("Failed to update project:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update project. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Loading state
  if (project === undefined) {
    return (
      <WizardLayout projectName="Loading..." currentStep={1}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </WizardLayout>
    );
  }

  // Error state
  if (project === null) {
    return (
      <WizardLayout projectName="Error" currentStep={1}>
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

  return (
    <WizardLayout
      projectName={project.appName}
      currentStep={1}
      projectId={projectId}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0">
          <CardTitle>Edit Project Input</CardTitle>
          <CardDescription>
            Update your app description and we&apos;ll regenerate everything based on the new information
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                placeholder="e.g., TaskFlow, MealPlanner, FitTrack"
                value={appName}
                onChange={(e) => {
                  setAppName(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appDescription">App Description</Label>
              <Textarea
                id="appDescription"
                placeholder="Describe what your app does, who it's for, and key features you're envisioning..."
                value={appDescription}
                onChange={(e) => {
                  setAppDescription(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                rows={8}
              />
              <p className="text-sm text-muted-foreground">
                Be as detailed as possible. The more context you provide, the better questions and recommendations we can generate.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {loadingMessage}
                  </>
                ) : (
                  "Update & Regenerate"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </WizardLayout>
  );
}

