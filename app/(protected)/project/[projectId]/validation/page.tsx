"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectLayout } from "@/components/features/project-layout";

export default function ValidationPage() {
  return (
    <ProjectLayout>
      {(project) => (
        <Card>
          <CardHeader>
            <CardTitle>Validation - {project.appName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Compatibility validation will appear here. This step is implemented in plan-05.
            </p>
          </CardContent>
        </Card>
      )}
    </ProjectLayout>
  );
}
