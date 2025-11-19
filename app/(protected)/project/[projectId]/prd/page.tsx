"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectLayout } from "@/components/features/project-layout";

export default function PRDPage() {
  return (
    <ProjectLayout maxWidth="4xl">
      {(project) => (
        <Card>
          <CardHeader>
            <CardTitle>PRD - {project.appName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Generated PRD will appear here. This step is implemented in plan-06.
            </p>
          </CardContent>
        </Card>
      )}
    </ProjectLayout>
  );
}
