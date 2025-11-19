"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";

export function EmptyDashboard() {
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
