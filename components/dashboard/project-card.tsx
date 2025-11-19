"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

import { ProjectStatus, statusColors, statusLabels } from "@/lib/types/prd";

export function ProjectCard({
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
