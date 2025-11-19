"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

type ProjectStatus = "draft" | "questions" | "research" | "confirmation" | "validation" | "completed";

const statusColors: Record<ProjectStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  questions: "bg-blue-100 text-blue-700",
  research: "bg-purple-100 text-purple-700",
  confirmation: "bg-yellow-100 text-yellow-700",
  validation: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
};

const statusLabels: Record<ProjectStatus, string> = {
  draft: "Draft",
  questions: "Questions",
  research: "Research",
  confirmation: "Confirmation",
  validation: "Validation",
  completed: "Completed",
};

function ProjectCard({
  project,
}: {
  project: Doc<"prdProjects">;
}) {
  const lastAccessed = new Date(project.lastAccessedAt).toLocaleDateString();

  // Safe status lookup with fallback
  const status = project.status as ProjectStatus;
  const color = statusColors[status] ?? "bg-gray-100 text-gray-700";
  const label = statusLabels[status] ?? "Unknown";

  const getProjectLink = () => {
    if (project.status === "completed") {
      return `/project/${project._id}/prd`;
    }
    if (project.status === "draft") {
      return `/project/${project._id}/questions`;
    }
    return `/project/${project._id}/${project.status}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{project.appName}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {project.appDescription}
            </CardDescription>
          </div>
          <Badge className={color}>
            {label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {lastAccessed}
          </div>
          <Button asChild size="sm">
            <Link href={getProjectLink()}>
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyDashboard() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          Start your first project and let AI help you create a comprehensive PRD
        </p>
        <Button asChild>
          <Link href="/project/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Project
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrentUser);
  const projects = useQuery(api.prdProjects.listByUser) as Doc<"prdProjects">[] | undefined;

  const isLoading = user === undefined || projects === undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Just Start</h1>
            <p className="text-sm text-muted-foreground">PRD Generator</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="/project/new">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        {user && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>PRDs Generated</CardDescription>
                <CardTitle className="text-3xl">{user.prdsGenerated}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Plan</CardDescription>
                <CardTitle className="text-3xl capitalize">
                  {user.subscription.tier}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Credits Remaining</CardDescription>
                <CardTitle className="text-3xl">
                  {user.subscription.credits}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Projects */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Your Projects</h2>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : !projects || projects.length === 0 ? (
          <EmptyDashboard />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
