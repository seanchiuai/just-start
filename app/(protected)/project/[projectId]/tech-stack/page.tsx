"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout } from "@/components/features/project/wizard-layout";
import { TechCategoryCard } from "@/components/features/tech-stack/tech-category-card";
import { AlternativesDialog } from "@/components/features/tech-stack/alternatives-dialog";
import { TechStackSummary } from "@/components/features/tech-stack/tech-stack-summary";
import {
  mockRecommendations,
  TechCategory,
  TechStackRecommendations,
} from "@/lib/mocks/tech-stack";

export default function TechStackPage() {
  const router = useRouter();

  // Mock project data - will be replaced with Convex query during integration
  const mockProject = {
    appName: "TaskFlow",
    currentStep: 3,
  };

  // Track selected technologies
  const [selections, setSelections] = useState<Record<TechCategory, string>>({
    frontend: mockRecommendations.frontend.technology,
    backend: mockRecommendations.backend.technology,
    database: mockRecommendations.database.technology,
    auth: mockRecommendations.auth.technology,
    hosting: mockRecommendations.hosting.technology,
  });

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

  const handleConfirm = () => {
    // Log for development - will be replaced with Convex mutation
    console.log("Confirmed stack:", selections);

    // Navigate to validation
    // router.push(`/project/${projectId}/validation`);
  };

  const categories = Object.keys(mockRecommendations) as TechCategory[];

  return (
    <WizardLayout
      projectName={mockProject.appName}
      currentStep={mockProject.currentStep}
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
              recommendation={mockRecommendations[category]}
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
              ? mockRecommendations[selectedCategory].alternatives
              : []
          }
          onSelect={handleSelectAlternative}
        />
      </div>
    </WizardLayout>
  );
}
