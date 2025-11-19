"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function QuestionsLoader() {
  return (
    <div className="space-y-8">
      {/* Status message */}
      <div className="text-center">
        <p className="text-muted-foreground animate-fade-in">
          Analyzing your app description...
        </p>
      </div>

      {/* Skeleton cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`space-y-4 animate-fade-in stagger-${i}`}
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="h-10 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
