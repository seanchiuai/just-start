"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ValidationStatus } from "@/lib/types/prd";

interface ValidationActionsProps {
  status: ValidationStatus;
  onProceed: () => void;
  onModify: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function ValidationActions({
  status,
  onProceed,
  onModify,
  disabled = false,
  disabledMessage,
}: ValidationActionsProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (status === "approved") {
    return (
      <div className="flex justify-end">
        <Button
          onClick={onProceed}
          size="lg"
          className="bg-primary hover:bg-primary/90"
          disabled={disabled}
        >
          {disabled && disabledMessage ? disabledMessage : "Generate PRD"}
        </Button>
      </div>
    );
  }

  if (status === "critical") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-critical">
          Critical issues must be resolved before generating your PRD.
        </p>
        <div className="flex justify-end">
          <Button onClick={onModify} variant="outline">
            Modify Tech Stack
          </Button>
        </div>
      </div>
    );
  }

  // Warnings status
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id="acknowledge"
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked === true)}
        />
        <Label
          htmlFor="acknowledge"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          I understand these warnings and want to proceed with PRD generation
        </Label>
      </div>

      <div className="flex justify-between">
        <Button onClick={onModify} variant="outline">
          Modify Tech Stack
        </Button>
        <Button
          onClick={onProceed}
          disabled={!acknowledged || disabled}
          className="bg-primary hover:bg-primary/90"
        >
          {disabled && disabledMessage ? disabledMessage : "Proceed Anyway"}
        </Button>
      </div>
    </div>
  );
}
