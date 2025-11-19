"use client";

import { cn } from "@/lib/utils";

interface ValidationLoaderProps {
  progress: number;
  status: string;
}

export function ValidationLoader({ progress, status }: ValidationLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* Circular progress */}
      <div className="relative">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-2xl font-semibold">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Status message */}
      <p className="text-muted-foreground animate-fade-in">{status}</p>
    </div>
  );
}
