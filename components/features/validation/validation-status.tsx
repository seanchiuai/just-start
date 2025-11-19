"use client";

import { Check, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ValidationStatus as ValidationStatusType,
  ValidationSeverity,
  validationStatusConfig,
} from "@/lib/types/prd";

interface ValidationStatusProps {
  status: ValidationStatusType;
  summary: string;
  counts: Record<ValidationSeverity, number>;
}

const statusIcons: Record<ValidationStatusType, React.ElementType> = {
  approved: Check,
  warnings: AlertTriangle,
  critical: XCircle,
};

export function ValidationStatus({
  status,
  summary,
  counts,
}: ValidationStatusProps) {
  const config = validationStatusConfig[status];
  const Icon = statusIcons[status];

  return (
    <div
      className={cn(
        "rounded-lg p-6 border",
        config.bgColor,
        status === "approved" && "border-success/30",
        status === "warnings" && "border-warning/30",
        status === "critical" && "border-critical/30"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            status === "approved" && "bg-success text-white",
            status === "warnings" && "bg-warning text-white",
            status === "critical" && "bg-critical text-white"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={cn("font-display text-xl font-semibold", config.color)}>
            {config.label}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>

          {/* Issue counts */}
          {(counts.low > 0 || counts.moderate > 0 || counts.critical > 0) && (
            <div className="flex gap-2 mt-3">
              {counts.critical > 0 && (
                <Badge variant="secondary" className="bg-critical/20 text-critical font-mono text-xs">
                  {counts.critical} critical
                </Badge>
              )}
              {counts.moderate > 0 && (
                <Badge variant="secondary" className="bg-warning/20 text-warning font-mono text-xs">
                  {counts.moderate} moderate
                </Badge>
              )}
              {counts.low > 0 && (
                <Badge variant="secondary" className="bg-info/20 text-info font-mono text-xs">
                  {counts.low} low
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
