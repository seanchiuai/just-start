"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SharedPRDPage() {
  const params = useParams();
  const token = params.token as string;

  const sharedPrd = useQuery(api.prd.getShared, { token });

  // Loading state
  if (sharedPrd === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-xl font-bold">
              Just Start
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  // Not found or expired
  if (sharedPrd === null) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-xl font-bold">
              Just Start
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold">PRD Not Found</h1>
            <p className="text-muted-foreground">
              This shared PRD link may have expired or been revoked.
            </p>
            <Button asChild>
              <Link href="/">
                Create Your Own PRD
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Parse PRD content
  let prdContent;
  try {
    prdContent = JSON.parse(sharedPrd.content);
  } catch {
    prdContent = null;
  }

  if (!prdContent) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-xl font-bold">
              Just Start
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold">Error Loading PRD</h1>
            <p className="text-muted-foreground">
              There was an error loading this PRD content.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Just Start
          </Link>
          <Badge variant="secondary">
            <FileText className="h-3 w-3 mr-1" />
            Read Only
          </Badge>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {prdContent.projectOverview?.productName || sharedPrd.appName}
            </h1>
            <p className="text-muted-foreground">
              Version {sharedPrd.version} • Generated{" "}
              {new Date(sharedPrd.generatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Project Overview */}
          {prdContent.projectOverview && (
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{prdContent.projectOverview.description}</p>
                {prdContent.projectOverview.targetAudience && (
                  <div>
                    <strong>Target Audience:</strong>{" "}
                    {prdContent.projectOverview.targetAudience}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Purpose & Goals */}
          {prdContent.purposeAndGoals && (
            <Card>
              <CardHeader>
                <CardTitle>Purpose & Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prdContent.purposeAndGoals.problemStatement && (
                  <div>
                    <h4 className="font-semibold mb-2">Problem Statement</h4>
                    <p>{prdContent.purposeAndGoals.problemStatement}</p>
                  </div>
                )}
                {prdContent.purposeAndGoals.solution && (
                  <div>
                    <h4 className="font-semibold mb-2">Solution</h4>
                    <p>{prdContent.purposeAndGoals.solution}</p>
                  </div>
                )}
                {prdContent.purposeAndGoals.keyObjectives?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Objectives</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {prdContent.purposeAndGoals.keyObjectives.map(
                        (obj: string, i: number) => (
                          <li key={i}>{obj}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* User Personas */}
          {prdContent.userPersonas?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>User Personas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {prdContent.userPersonas.map(
                  (
                    persona: {
                      name?: string;
                      description?: string;
                      useCases?: string[];
                    },
                    i: number
                  ) => (
                    <div key={i} className="space-y-2">
                      <h4 className="font-semibold">{persona.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {persona.description}
                      </p>
                      {persona.useCases && persona.useCases.length > 0 && (
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {persona.useCases.map((useCase: string, j: number) => (
                            <li key={j}>{useCase}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}

          {/* Tech Stack */}
          {prdContent.techStack && (
            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(prdContent.techStack).map(([category, tech]) => {
                  const techData = tech as {
                    technology?: string;
                    reasoning?: string;
                    pros?: string[];
                    cons?: string[];
                  };
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Badge>
                        <span className="font-medium">
                          {techData.technology}
                        </span>
                      </div>
                      {techData.reasoning && (
                        <p className="text-sm text-muted-foreground">
                          {techData.reasoning}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* MVP Features */}
          {prdContent.features?.mvpFeatures?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>MVP Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prdContent.features.mvpFeatures.map(
                  (
                    feature: {
                      name?: string;
                      description?: string;
                      priority?: string;
                      acceptanceCriteria?: string[];
                    },
                    i: number
                  ) => (
                    <div key={i} className="space-y-2 pb-4 border-b last:border-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{feature.name}</h4>
                        {feature.priority && (
                          <Badge variant="secondary">{feature.priority}</Badge>
                        )}
                      </div>
                      <p className="text-sm">{feature.description}</p>
                      {feature.acceptanceCriteria &&
                        feature.acceptanceCriteria.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Acceptance Criteria:
                            </p>
                            <ul className="list-disc list-inside text-xs space-y-1">
                              {feature.acceptanceCriteria.map(
                                (criteria: string, j: number) => (
                                  <li key={j}>{criteria}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}

          {/* Technical Architecture */}
          {prdContent.technicalArchitecture && (
            <Card>
              <CardHeader>
                <CardTitle>Technical Architecture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prdContent.technicalArchitecture.systemDesign && (
                  <div>
                    <h4 className="font-semibold mb-2">System Design</h4>
                    <p className="text-sm">
                      {prdContent.technicalArchitecture.systemDesign}
                    </p>
                  </div>
                )}
                {prdContent.technicalArchitecture.apiStructure && (
                  <div>
                    <h4 className="font-semibold mb-2">API Structure</h4>
                    <p className="text-sm">
                      {prdContent.technicalArchitecture.apiStructure}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center space-y-4">
              <h3 className="text-lg font-semibold">
                Want to create your own PRD?
              </h3>
              <p className="text-sm text-muted-foreground">
                Just Start helps you think through your project and generate a
                comprehensive PRD in minutes.
              </p>
              <Button asChild>
                <Link href="/">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Generated by{" "}
          <Link href="/" className="text-primary hover:underline">
            Just Start
          </Link>
        </div>
      </footer>
    </div>
  );
}
