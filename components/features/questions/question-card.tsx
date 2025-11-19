"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  Question,
  categoryColors,
  categoryLabels,
} from "@/lib/types/prd";

interface QuestionCardProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const [showOther, setShowOther] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  // Initialize otherValue from incoming value prop when it's a custom value
  useEffect(() => {
    if (value != null && value !== "" && !question.options.includes(value)) {
      setOtherValue(value);
    }
  }, [value, question.options]);

  const handleValueChange = (newValue: string) => {
    if (newValue === "other") {
      setShowOther(true);
      onChange(otherValue || "");
    } else {
      setShowOther(false);
      onChange(newValue);
    }
  };

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOtherValue = e.target.value;
    setOtherValue(newOtherValue);
    onChange(newOtherValue || "");
  };

  const isOtherSelected = showOther || (value != null && value !== "" && !question.options.includes(value));

  return (
    <div className="space-y-4">
      {/* Category badge */}
      <Badge
        variant="secondary"
        className={cn(
          "font-mono text-xs uppercase tracking-wider",
          categoryColors[question.category]
        )}
      >
        {categoryLabels[question.category]}
      </Badge>

      {/* Question text */}
      <h3 className="font-display text-xl font-medium leading-tight">
        {question.question}
      </h3>

      {/* Options */}
      <RadioGroup
        value={isOtherSelected ? "other" : value}
        onValueChange={handleValueChange}
        className="space-y-2"
      >
        {question.options.map((option) => (
          <div key={option} className="flex items-center">
            <Label
              htmlFor={`${question.id}-${option}`}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                "hover:bg-muted/50",
                value === option
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <RadioGroupItem
                value={option}
                id={`${question.id}-${option}`}
                className="shrink-0"
              />
              <span className="flex-1">{option}</span>
              {option === question.default && (
                <span className="text-xs text-muted-foreground font-mono">
                  (recommended)
                </span>
              )}
            </Label>
          </div>
        ))}

        {/* Other option */}
        <div className="flex items-center">
          <Label
            htmlFor={`${question.id}-other`}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
              "hover:bg-muted/50",
              isOtherSelected
                ? "border-primary bg-primary/5"
                : "border-border"
            )}
          >
            <RadioGroupItem
              value="other"
              id={`${question.id}-other`}
              className="shrink-0"
            />
            <span className="flex-1">Other</span>
          </Label>
        </div>
      </RadioGroup>

      {/* Other input field */}
      {isOtherSelected && (
        <div className="pl-6 animate-fade-in">
          <Input
            placeholder="Please specify..."
            value={otherValue}
            onChange={handleOtherChange}
            className="mt-2"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
