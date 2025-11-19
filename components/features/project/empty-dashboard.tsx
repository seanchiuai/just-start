"use client";

import { FileText, Sparkles, Clock, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyDashboardProps {
  onCreateFirst?: () => void;
}

export function EmptyDashboard({ onCreateFirst }: EmptyDashboardProps) {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Questions",
      description: "Get intelligent clarifying questions tailored to your project",
    },
    {
      icon: Clock,
      title: "Save Hours",
      description: "Generate comprehensive PRDs in minutes, not days",
    },
    {
      icon: Users,
      title: "Developer Ready",
      description: "Output that developers can start building from immediately",
    },
  ];

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        {/* Icon */}
        <div className="rounded-full bg-primary/10 p-4 mb-6">
          <FileText className="h-8 w-8 text-primary" />
        </div>

        {/* Welcome message */}
        <h3 className="font-display text-2xl font-semibold text-center mb-2">
          Welcome to Just Start
        </h3>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          Transform your app idea into a comprehensive PRD through guided
          AI-powered questions and research.
        </p>

        {/* CTA */}
        <Button
          asChild={!onCreateFirst}
          size="lg"
          className="bg-primary hover:bg-primary/90 mb-8"
          onClick={onCreateFirst}
        >
          {onCreateFirst ? (
            "Start Your First Project"
          ) : (
            <Link href="/project/new">Start Your First Project</Link>
          )}
        </Button>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-4"
            >
              <feature.icon className="h-5 w-5 text-muted-foreground mb-2" />
              <h4 className="text-sm font-medium mb-1">{feature.title}</h4>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
