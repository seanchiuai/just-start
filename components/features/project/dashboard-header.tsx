"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  totalProjects: number;
  inProgressCount: number;
}

export function DashboardHeader({
  totalProjects,
  inProgressCount,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-display text-xl font-semibold">Your Projects</h2>
        {totalProjects > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-mono">{totalProjects}</span> total
            {inProgressCount > 0 && (
              <>
                {" "}
                • <span className="font-mono">{inProgressCount}</span> in progress
              </>
            )}
          </p>
        )}
      </div>
      <Button asChild className="bg-primary hover:bg-primary/90">
        <Link href="/project/new">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Link>
      </Button>
    </div>
  );
}
