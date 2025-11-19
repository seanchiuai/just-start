"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ValidationIssue, severityColors } from "@/lib/types/prd";

interface IssueCardProps {
  issue: ValidationIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 bg-card p-4",
        issue.severity === "low" && "border-l-[hsl(var(--info))]",
        issue.severity === "moderate" && "border-l-[hsl(var(--warning))]",
        issue.severity === "critical" && "border-l-[hsl(var(--critical))]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="secondary"
              className={cn(
                "font-mono text-xs uppercase",
                severityColors[issue.severity]
              )}
            >
              {issue.severity}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">
              {issue.component}
            </span>
          </div>

          {/* Issue title */}
          <p className="font-medium">{issue.issue}</p>

          {/* Expandable recommendation */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-auto p-0 text-primary hover:text-primary/80"
              >
                <span className="text-sm">
                  {isOpen ? "Hide" : "Show"} recommendation
                </span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 pt-3 border-t animate-fade-in">
              <p className="text-sm text-muted-foreground">
                {issue.recommendation}
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
