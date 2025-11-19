"use client";

import { Layout, Server, Database, Shield, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TechCategory } from "@/lib/types/prd";

interface TechStackSummaryProps {
  stack: Record<TechCategory, string>;
  onConfirm: () => void;
}

const categoryIcons: Record<TechCategory, React.ElementType> = {
  frontend: Layout,
  backend: Server,
  database: Database,
  auth: Shield,
  hosting: Cloud,
};

const categoryOrder: TechCategory[] = [
  "frontend",
  "backend",
  "database",
  "auth",
  "hosting",
];

export function TechStackSummary({ stack, onConfirm }: TechStackSummaryProps) {
  return (
    <Card className="card-editorial">
      <CardContent className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4">
          Your Tech Stack
        </h3>

        {/* Stack grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {categoryOrder.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <div
                key={category}
                className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30"
              >
                <Icon className="h-5 w-5 text-muted-foreground mb-2" />
                <span className="text-xs font-mono uppercase text-muted-foreground">
                  {category}
                </span>
                <span className="text-sm font-medium mt-1 truncate max-w-full">
                  {stack[category]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Visual connections */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-1">
            {categoryOrder.map((category, index) => (
              <div key={category} className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
                {index < categoryOrder.length - 1 && (
                  <div className="h-0.5 w-4 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Confirm button */}
        <Button
          onClick={onConfirm}
          size="lg"
          className="w-full bg-primary hover:bg-primary/90"
        >
          Confirm Stack & Validate
        </Button>
      </CardContent>
    </Card>
  );
}
