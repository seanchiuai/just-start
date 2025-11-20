"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { WizardLayout } from "@/components/features/project/wizard-layout";
import { TechCategoryCard } from "@/components/features/tech-stack/tech-category-card";
import { AlternativesDialog } from "@/components/features/tech-stack/alternatives-dialog";
import { TechStackSummary } from "@/components/features/tech-stack/tech-stack-summary";
import { TechStackSkeleton } from "@/components/ui/query-loader";
import { TechCategory } from "@/lib/types/prd";

export default function TechStackPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as Id<"prdProjects">;

  // Fetch project and tech stack data
  const project = useQuery(api.prdProjects.get, { projectId });
  const techStack = useQuery(api.techStack.getByProject, { projectId });

  // Confirm mutation
  const confirmStack = useMutation(api.techStack.confirm);
  const researchTechStack = useAction(api.techStack.research);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  // Track selected technologies
  const [selections, setSelections] = useState<Record<TechCategory, string>>({
    frontend: "",
    backend: "",
    database: "",
    auth: "",
    hosting: "",
  });

  // Fallback: trigger generation if tech stack doesn't exist
  useEffect(() => {
    if (project && techStack === null && !isGenerating && !generationError) {
      setIsGenerating(true);
      researchTechStack({ projectId })
        .then(() => {
          setIsGenerating(false);
        })
        .catch((err) => {
          console.error("Failed to generate tech stack:", err);
          setGenerationError("Failed to generate tech stack. Please try again.");
          setIsGenerating(false);
        });
    }
  }, [project, techStack, projectId, isGenerating, generationError, researchTechStack]);

  // Initialize selections from techStack when available
  useEffect(() => {
    if (techStack?.recommendations) {
      setSelections({
        frontend: techStack.recommendations.frontend.technology,
        backend: techStack.recommendations.backend.technology,
        database: techStack.recommendations.database.technology,
        auth: techStack.recommendations.auth.technology,
        hosting: techStack.recommendations.hosting.technology,
      });
    }
  }, [techStack?.recommendations]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TechCategory | null>(
    null
  );

  const handleChangeClick = (category: TechCategory) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleSelectAlternative = (tech: string) => {
    if (selectedCategory) {
      setSelections((prev) => ({
        ...prev,
        [selectedCategory]: tech,
      }));
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmStack({ projectId, confirmedStack: selections });
      router.push(`/project/${projectId}/validation`);
    } catch (error) {
      console.error("Failed to confirm stack:", error);
    }
  };

  // Loading state
  if (project === undefined || techStack === undefined) {
    return (
      <WizardLayout projectName="Loading..." currentStep={3}>
        <TechStackSkeleton />
      </WizardLayout>
    );
  }

  // Error state
  if (project === null) {
    return (
      <WizardLayout projectName="Error" currentStep={3}>
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
  if (techStack === null) {
    return (
      <WizardLayout projectName={project.appName} currentStep={project.currentStep}>
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
                Researching and generating tech stack recommendations...
              </p>
            </div>
          )}
        </div>
      </WizardLayout>
    );
  }

  const categories = Object.keys(techStack.recommendations) as TechCategory[];

  return (
    <WizardLayout
      projectName={project.appName}
      currentStep={project.currentStep}
    >
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">
            Tech Stack Recommendations
          </h2>
          <p className="mt-2 text-muted-foreground">
            Based on your project requirements, we recommend the following
            technologies. You can customize any choice.
          </p>
        </div>

        {/* Tech category cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <TechCategoryCard
              key={category}
              category={category}
              recommendation={techStack.recommendations[category]}
              onChangeClick={() => handleChangeClick(category)}
            />
          ))}
        </div>

        {/* Summary and confirm */}
        <TechStackSummary stack={selections} onConfirm={handleConfirm} />

        {/* Alternatives dialog */}
        <AlternativesDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          category={selectedCategory}
          currentTech={
            selectedCategory ? selections[selectedCategory] : ""
          }
          alternatives={
            selectedCategory
              ? techStack.recommendations[selectedCategory].alternatives
              : []
          }
          onSelect={handleSelectAlternative}
        />
      </div>
    </WizardLayout>
  );
}
