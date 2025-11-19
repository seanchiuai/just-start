"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyDashboard } from "@/components/dashboard/empty-state";
import { DashboardSkeleton } from "@/components/dashboard/skeleton";

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
