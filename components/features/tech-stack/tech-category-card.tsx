"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { TechRecommendation, TechCategory, categoryDescriptions } from "@/lib/mocks/tech-stack";

interface TechCategoryCardProps {
  category: TechCategory;
  recommendation: TechRecommendation;
  onChangeClick: () => void;
}

export function TechCategoryCard({
  category,
  recommendation,
  onChangeClick,
}: TechCategoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="card-editorial">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {category}
            </p>
            <h3 className="font-display text-2xl font-semibold mt-1">
              {recommendation.technology}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onChangeClick}
            className="text-primary hover:text-primary/80"
          >
            Change
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {categoryDescriptions[category]}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reasoning */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {recommendation.reasoning}
        </p>

        {/* Expandable pros/cons */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              <span>View pros & cons</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 pt-4 animate-fade-in">
            {/* Pros */}
            <div>
              <h4 className="text-sm font-medium text-success mb-2">Pros</h4>
              <ul className="space-y-1">
                {recommendation.pros.map((pro) => (
                  <li key={pro} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-success">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div>
              <h4 className="text-sm font-medium text-warning mb-2">Cons</h4>
              <ul className="space-y-1">
                {recommendation.cons.map((con) => (
                  <li key={con} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-warning">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
