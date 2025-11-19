"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TechCategory } from "@/lib/types/prd";

interface AlternativesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: TechCategory | null;
  currentTech: string;
  alternatives: string[];
  onSelect: (tech: string) => void;
}

export function AlternativesDialog({
  open,
  onOpenChange,
  category,
  currentTech,
  alternatives,
  onSelect,
}: AlternativesDialogProps) {
  const handleSelect = (tech: string) => {
    onSelect(tech);
    onOpenChange(false);
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            Change {category.charAt(0).toUpperCase() + category.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Select an alternative technology for this category.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {/* Current selection */}
          <button
            type="button"
            onClick={() => handleSelect(currentTech)}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-all",
              "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{currentTech}</span>
              <span className="text-xs font-mono text-primary">CURRENT</span>
            </div>
          </button>

          {/* Alternatives */}
          {alternatives.map((alt) => (
            <button
              type="button"
              key={alt}
              onClick={() => handleSelect(alt)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all",
                "hover:bg-muted/50 border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{alt}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Alternative option - research needed
              </p>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-warning">
            Note: Changing technologies may affect compatibility with other stack choices.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
