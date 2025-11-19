"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectLayout } from "@/components/features/project-layout";

export default function TechStackPage() {
  return (
    <ProjectLayout>
      {(project) => (
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
      )}
    </ProjectLayout>
  );
}
