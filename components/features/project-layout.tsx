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
  const projectId = params.projectId as Id<"prdProjects">;
  const project = useQuery(api.prdProjects.get, { projectId });

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
