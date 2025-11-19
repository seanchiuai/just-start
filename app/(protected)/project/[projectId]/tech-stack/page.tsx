"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export default function TechStackPage() {
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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack - {project.appName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Tech stack recommendations will appear here. This step is implemented in plan-04.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
