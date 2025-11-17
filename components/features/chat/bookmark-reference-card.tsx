"use client";

import { ExternalLink, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkReferenceCardProps {
  title: string;
  url: string;
  description?: string;
}

export function BookmarkReferenceCard({
  title,
  url,
  description,
}: BookmarkReferenceCardProps) {
  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group w-full rounded-lg border bg-card p-3 text-left transition-all",
        "hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Favicon or fallback icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="line-clamp-1 text-sm font-medium">{title}</h4>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          {description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {description}
            </p>
          )}
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {new URL(url).hostname}
          </p>
        </div>
      </div>
    </button>
  );
}
