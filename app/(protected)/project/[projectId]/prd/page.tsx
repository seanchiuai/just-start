"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { PRDViewer } from "@/components/features/prd/prd-viewer";
import { PRDActions } from "@/components/features/prd/prd-actions";
import { PRDSkeleton } from "@/components/ui/query-loader";
import type { PRDContent } from "@/lib/types/prd";

export default function PRDPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"prdProjects">;

  // Fetch project and PRD data
  const project = useQuery(api.prdProjects.get, { projectId });
  const prd = useQuery(api.prd.getByProject, { projectId });

  // Export actions (from prdActions.ts - Node.js runtime)
  const exportJSON = useAction(api.prdActions.exportJSON);
  const exportMarkdown = useAction(api.prdActions.exportMarkdown);

  // Share actions (from prdActions.ts - Node.js runtime)
  const createShareLink = useAction(api.prdActions.createShareLink);
  const generatePRD = useAction(api.prdActions.generate);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  // Fallback: trigger generation if PRD doesn't exist
  useEffect(() => {
    if (project && prd === null && !isGenerating && !generationError) {
      setIsGenerating(true);
      generatePRD({ projectId })
        .then(() => {
          setIsGenerating(false);
        })
        .catch((err) => {
          console.error("Failed to generate PRD:", err);
          
          // Check if it's a credit error
          const errorMessage = err?.message || String(err);
          if (errorMessage.includes("INSUFFICIENT_CREDITS")) {
            setGenerationError("You don't have enough credits to generate a PRD. Please upgrade your plan to continue.");
          } else {
            setGenerationError("Failed to generate PRD. Please try again.");
          }
          setIsGenerating(false);
        });
    }
  }, [project, prd, projectId, isGenerating, generationError, generatePRD]);

  // Parse PRD content safely with memoization
  const prdContent = useMemo(() => {
    if (!prd) return null;
    try {
      return JSON.parse(prd.content) as PRDContent;
    } catch (error) {
      console.error("Failed to parse PRD content:", error);
      return null;
    }
  }, [prd]);

  const handleExport = async (format: "json" | "markdown") => {
    if (!prd) return;
    try {
      const result =
        format === "json"
          ? await exportJSON({ prdId: prd._id })
          : await exportMarkdown({ prdId: prd._id });

      // Create download
      const blob = new Blob([result.content], {
        type: format === "json" ? "application/json" : "text/markdown",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleShare = async () => {
    if (!prd) return;
    try {
      const result = await createShareLink({ prdId: prd._id });
      const shareUrl = `${window.location.origin}/share/${result.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(
        `Share link copied! Expires: ${new Date(result.expiresAt).toLocaleDateString()}`
      );
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  // Loading state
  if (project === undefined || prd === undefined) {
    return (
      <div className="min-h-screen bg-background bg-dotgrid">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground"
              >
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <h1 className="font-display text-xl font-semibold">Loading...</h1>
              <div className="w-24" /> {/* Spacer */}
            </div>
          </div>
        </header>

        {/* Main content with skeleton */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-paper-warm rounded-lg border p-6 sm:p-8 shadow-sm">
              <PRDSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state - project not found or not authorized
  if (project === null) {
    return (
      <div className="min-h-screen bg-background bg-dotgrid">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground"
              >
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <h1 className="font-display text-xl font-semibold">Error</h1>
              <div className="w-24" /> {/* Spacer */}
            </div>
          </div>
        </header>

        {/* Error message */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-paper-warm rounded-lg border p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
                  <p className="text-sm text-destructive">
                    Project not found or you don&apos;t have access to this
                    project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Generating state or error state
  if (prd === null || !prdContent) {
    return (
      <div className="min-h-screen bg-background bg-dotgrid">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground"
              >
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <h1 className="font-display text-xl font-semibold">
                {project.appName} PRD
              </h1>
              <div className="w-24" /> {/* Spacer */}
            </div>
          </div>
        </header>

        {/* Generating or error message */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-paper-warm rounded-lg border p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col items-center justify-center py-12">
                {generationError ? (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4">
                    <p className="text-sm text-destructive">{generationError}</p>
                    <div className="flex gap-2 justify-center">
                      {!generationError.includes("credits") && (
                        <button
                          onClick={() => {
                            setGenerationError("");
                            setIsGenerating(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                        >
                          Retry
                        </button>
                      )}
                      <Link href="/dashboard">
                        <button className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors">
                          Back to Dashboard
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Generating your Product Requirements Document...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This may take 30-60 seconds
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-dotgrid">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <h1 className="font-display text-xl font-semibold">
              {project.appName} PRD
            </h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-paper-warm rounded-lg border p-6 sm:p-8 shadow-sm">
            <PRDViewer prd={prdContent} />
          </div>
        </div>
      </main>

      {/* Floating actions */}
      <PRDActions onExport={handleExport} onShare={handleShare} />
    </div>
  );
}
