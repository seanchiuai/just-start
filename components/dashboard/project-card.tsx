"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, MoreVertical } from "lucide-react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ProjectStatus, statusColors, statusLabels } from "@/lib/types/prd";

export function ProjectCard({
    project,
    onRename,
    onDelete,
}: {
    project: Doc<"prdProjects">;
    onRename?: (projectId: Id<"prdProjects">) => void;
    onDelete?: (project: Doc<"prdProjects">) => void;
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
        <Card className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{project.appName}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                            {project.appDescription}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={color}>
                            {label}
                        </Badge>
                        {(onRename || onDelete) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                    >
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {onRename && (
                                        <DropdownMenuItem onClick={() => onRename(project._id)}>
                                            <IconEdit className="mr-2 h-4 w-4" />
                                            Rename
                                        </DropdownMenuItem>
                                    )}
                                    {onRename && onDelete && <DropdownMenuSeparator />}
                                    {onDelete && (
                                        <DropdownMenuItem
                                            onClick={() => onDelete(project)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <IconTrash className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
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
