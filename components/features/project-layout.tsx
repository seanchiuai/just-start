"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

interface ProjectLayoutProps {
  children: (project: NonNullable<ReturnType<typeof useQuery<typeof api.prdProjects.get>>>) => React.ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const maxWidthClasses = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export function ProjectLayout({ children, maxWidth = "3xl" }: ProjectLayoutProps) {
  const params = useParams();

  // Validate projectId exists and is a non-empty string
  const rawProjectId = params.projectId;
  const isValidProjectId = rawProjectId && typeof rawProjectId === "string" && rawProjectId.trim() !== "";

  // Always call hooks unconditionally - skip query if projectId is invalid
  const project = useQuery(
    api.prdProjects.get,
    isValidProjectId ? { projectId: rawProjectId as Id<"prdProjects"> } : "skip"
  );

  // Now we can do early returns after hooks
  if (!isValidProjectId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Invalid Project ID</h2>
          <p className="text-muted-foreground">The project ID in the URL is missing or invalid.</p>
        </div>
      </div>
    );
  }

  if (project === undefined) {
    return <div className="p-8">Loading...</div>;
  }

  if (!project) {
    return <div className="p-8">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className={`container mx-auto px-4 py-8 ${maxWidthClasses[maxWidth]}`}>
        {children(project)}
      </main>
    </div>
  );
}
