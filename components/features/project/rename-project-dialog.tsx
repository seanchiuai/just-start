"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: Id<"prdProjects"> | null;
  onSuccess?: () => void;
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: RenameProjectDialogProps) {
  const [name, setName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const project = useQuery(
    api.prdProjects.get,
    projectId ? { projectId } : "skip"
  );
  const updateName = useMutation(api.prdProjects.updateName);

  // Initialize name when project loads or projectId changes
  React.useEffect(() => {
    if (projectId && project) {
      setName(project.appName);
    } else if (projectId && !project) {
      // Reset to empty while loading new project
      setName("");
    }
  }, [project, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) return;

    if (!name.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }

    if (name.length > 100) {
      toast.error("Project name must be 100 characters or less");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateName({ projectId, appName: name.trim() });
      toast.success("Project renamed successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setName("");
      }
    }
  };

  const isLoading = !project && projectId !== null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              {isLoading ? "Loading project..." : "Enter a new name for this project."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                disabled={isSubmitting || isLoading}
                autoFocus
                placeholder={isLoading ? "Loading..." : ""}
              />
              <p className="text-xs text-muted-foreground">
                {name.length}/100 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading || !name.trim()}>
              {isSubmitting ? "Renaming..." : "Rename Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

