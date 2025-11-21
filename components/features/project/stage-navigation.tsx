"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Check, Circle, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StageNavigationProps {
  projectId: Id<"prdProjects">;
  currentStep: number;
  className?: string;
}

interface Stage {
  id: number;
  name: string;
  path: string;
}

const stages: Stage[] = [
  { id: 1, name: "Input", path: "input" },
  { id: 2, name: "Questions", path: "questions" },
  { id: 3, name: "Tech Stack", path: "tech-stack" },
  { id: 4, name: "Validation", path: "validation" },
  { id: 5, name: "PRD", path: "prd" },
];

export function StageNavigation({
  projectId,
  currentStep,
  className = "",
}: StageNavigationProps) {
  const router = useRouter();
  const resetFromStage = useMutation(api.prdProjects.resetFromStage);
  
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleStageClick = (stage: Stage) => {
    // Can't click future stages
    if (stage.id > currentStep) return;
    
    // If clicking current stage, just navigate
    if (stage.id === currentStep) {
      router.push(`/project/${projectId}/${stage.path}`);
      return;
    }
    
    // If going backwards, show confirmation dialog
    setSelectedStage(stage);
    setShowDialog(true);
  };

  const handleConfirmNavigation = async () => {
    if (!selectedStage) return;
    
    setIsResetting(true);
    try {
      // Reset from the selected stage
      await resetFromStage({
        projectId,
        stage: selectedStage.id,
      });
      
      // Navigate to the selected stage
      router.push(`/project/${projectId}/${selectedStage.path}`);
    } catch (error) {
      console.error("Failed to reset stage:", error);
    } finally {
      setIsResetting(false);
      setShowDialog(false);
      setSelectedStage(null);
    }
  };

  const getStageStatus = (stageId: number) => {
    if (stageId < currentStep) return "completed";
    if (stageId === currentStep) return "current";
    return "future";
  };

  const getStageIcon = (stageId: number) => {
    const status = getStageStatus(stageId);
    if (status === "completed") {
      return <Check className="h-4 w-4" />;
    }
    if (status === "current") {
      return <Circle className="h-4 w-4 fill-current" />;
    }
    return <Lock className="h-4 w-4" />;
  };

  const getStageStyles = (stageId: number) => {
    const status = getStageStatus(stageId);
    const isClickable = stageId <= currentStep;
    
    const baseStyles = "flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium";
    
    if (status === "completed") {
      return `${baseStyles} ${
        isClickable
          ? "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer"
          : "bg-green-50 text-green-700"
      }`;
    }
    if (status === "current") {
      return `${baseStyles} bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100`;
    }
    return `${baseStyles} bg-gray-50 text-gray-400 cursor-not-allowed`;
  };

  return (
    <>
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            <button
              onClick={() => handleStageClick(stage)}
              disabled={stage.id > currentStep}
              className={getStageStyles(stage.id)}
            >
              {getStageIcon(stage.id)}
              <span>{stage.name}</span>
            </button>
            {index < stages.length - 1 && (
              <div className="mx-1 text-muted-foreground">→</div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Go back to {selectedStage?.name}?</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                Going back to <strong>{selectedStage?.name}</strong> will delete all progress after this stage.
              </p>
              {selectedStage && (
                <p className="text-destructive font-medium">
                  This will delete:{" "}
                  {selectedStage.id <= 1 && "Questions, Tech Stack, Validation, and PRD"}
                  {selectedStage.id === 2 && "Tech Stack, Validation, and PRD"}
                  {selectedStage.id === 3 && "Validation and PRD"}
                  {selectedStage.id === 4 && "PRD"}
                </p>
              )}
              <p>
                You&apos;ll need to regenerate these stages after making your changes.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setSelectedStage(null);
              }}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmNavigation}
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : "Yes, go back"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

