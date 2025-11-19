"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectLayout } from "@/components/features/project-layout";

export default function QuestionsPage() {
  return (
    <ProjectLayout>
      {(project) => (
        <Card>
          <CardHeader>
            <CardTitle>Questions - {project.appName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AI-generated questions will appear here. This step is implemented in plan-03.
            </p>
          </CardContent>
        </Card>
      )}
    </ProjectLayout>
  );
}
