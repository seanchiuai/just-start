"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryLoaderProps {
  /** Show loading state */
  isLoading?: boolean;
  /** Show error state */
  error?: string | null;
  /** Custom loading message */
  loadingMessage?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Children to render when data is available */
  children: React.ReactNode;
  /** Custom className for container */
  className?: string;
}

export function QueryLoader({
  isLoading,
  error,
  loadingMessage = "Loading...",
  errorMessage,
  children,
  className,
}: QueryLoaderProps) {
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            {errorMessage || error}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Skeleton components for specific use cases
export function QuestionsFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-8 bg-muted rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechStackSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border p-6">
            <div className="h-5 bg-muted rounded w-1/3 mb-4" />
            <div className="h-6 bg-muted rounded w-2/3 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ValidationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse rounded-lg border p-6">
        <div className="h-6 bg-muted rounded w-1/4 mb-4" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border p-4">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PRDSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
