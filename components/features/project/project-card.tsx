"use client";

import { Clock, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  MockProject,
  statusColors,
  statusLabels,
  ProjectStatus,
} from "@/lib/mocks/projects";

interface ProjectCardProps {
  project: MockProject;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const lastAccessed = new Date(project.lastAccessedAt).toLocaleDateString();
  const progressPercent = (project.currentStep / 5) * 100;

  const getProjectLink = () => {
    if (project.status === "completed") {
      return `/project/${project._id}/prd`;
    }
    if (project.status === "draft") {
      return `/project/${project._id}/questions`;
    }
    return `/project/${project._id}/${project.status}`;
  };

  return (
    <Card className="card-editorial group hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold truncate">
              {project.appName}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {project.appDescription}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn("ml-2 shrink-0", statusColors[project.status])}
          >
            {statusLabels[project.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Progress indicator */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>Step {project.currentStep} of 5</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-1" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {lastAccessed}
          </div>

          <div className="flex items-center gap-1">
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(project._id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link href={getProjectLink()}>
                Continue
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
