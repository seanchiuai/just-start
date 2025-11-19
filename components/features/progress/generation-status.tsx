"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface GenerationStatusProps {
  stage: string;
  progress: number;
  message: string;
  isComplete?: boolean;
  estimatedTime?: string;
}

export function GenerationStatus({
  stage,
  progress,
  message,
  isComplete = false,
  estimatedTime,
}: GenerationStatusProps) {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  // Typewriter effect for message
  useEffect(() => {
    setDisplayedMessage("");
    let index = 0;
    const timer = setInterval(() => {
      if (index < message.length) {
        setDisplayedMessage(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [message]);

  // Blinking cursor effect
  useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4">
      {/* Stage indicator */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
            isComplete
              ? "bg-success text-white"
              : "bg-primary/10 text-primary"
          )}
        >
          {isComplete ? (
            <Check className="h-4 w-4" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg font-medium">{stage}</h3>
        </div>
      </div>

      {/* Typewriter message */}
      <div className="min-h-[24px]">
        <p className="text-muted-foreground">
          {displayedMessage}
          {!isComplete && showCursor && (
            <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary align-middle" />
          )}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress
          value={progress}
          className="h-1"
          indicatorClassName="bg-primary"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>{Math.round(progress)}%</span>
          {estimatedTime && <span>{estimatedTime}</span>}
        </div>
      </div>
    </div>
  );
}
