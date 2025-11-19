# Component Patterns

## Component Structure

### Functional Components (Required)
```tsx
"use client"; // Only if needed

import { ComponentProps } from "@/types";

export function MyComponent({ prop1, prop2 }: ComponentProps) {
  return <div>Content</div>;
}
```

### Props Patterns
```tsx
// Interface for props
interface ButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

// With HTML attributes
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
```

## Hooks Usage

### Convex Hooks (Client Only)
```tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function TodoList() {
  const todos = useQuery(api.todos.list);
  const addTodo = useMutation(api.todos.create);

  if (todos === undefined) return <div>Loading...</div>;

  return <div>{/* UI */}</div>;
}
```

### React Hooks
```tsx
import { useState, useEffect, useMemo, useCallback } from "react";

// State
const [count, setCount] = useState(0);

// Effects
useEffect(() => {
  // Side effects
}, [dependencies]);

// Memoization
const value = useMemo(() => expensiveCalc(), [deps]);
const callback = useCallback(() => {}, [deps]);
```

## Component Size
- Keep components <200 LOC
- Extract logic to custom hooks
- Split large components into smaller ones

## Patterns

### Composition
```tsx
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Conditional Rendering
```tsx
// Ternary
{isLoading ? <Spinner /> : <Content />}

// AND operator
{error && <ErrorMessage error={error} />}

// Early return
if (!data) return <Loading />;
return <Content data={data} />;
```

### Event Handlers
```tsx
"use client";

function Form() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submit
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## shadcn/ui Patterns
- Use pre-built components from `/components/ui`
- Customize via className prop
- Compose components for complex UI

## Wizard Step Component Pattern

### Multi-Step Form Structure

```tsx
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface WizardStepProps {
  projectId: Id<"projects">;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
}

function WizardStep({ projectId, currentStep, totalSteps, onNext, onBack }: WizardStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const saveProgress = useMutation(api.projects.updateStep);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      await saveProgress({ projectId, step: currentStep + 1 });
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} />
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {/* Step-specific content here */}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        <Button onClick={handleNext} disabled={isLoading}>
          {isLoading ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  );
}
```

### AI Processing Status Component

```tsx
"use client";

import { CheckCircle, Loader2, Circle } from "lucide-react";

interface ProcessingStatusProps {
  stages: string[];
  currentStage: number;
}

function ProcessingStatus({ stages, currentStage }: ProcessingStatusProps) {
  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <div key={stage} className="flex items-center gap-3">
          {index < currentStage ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : index === currentStage ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
          <span className={index <= currentStage ? "text-foreground" : "text-muted-foreground"}>
            {stage}
          </span>
        </div>
      ))}
    </div>
  );
}

// Usage for PRD generation
<ProcessingStatus
  stages={[
    "Analyzing description...",
    "Generating questions...",
    "Researching tech stacks...",
    "Validating compatibility...",
    "Writing PRD..."
  ]}
  currentStage={2}
/>
```

### Tech Stack Selection Card

```tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface TechStackCardProps {
  category: string;
  recommendation: {
    technology: string;
    reasoning: string;
    pros: string[];
    cons: string[];
  };
  alternatives: string[];
  selected: string;
  onSelect: (tech: string) => void;
}

function TechStackCard({
  category,
  recommendation,
  alternatives,
  selected,
  onSelect
}: TechStackCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{category}</CardTitle>
        <CardDescription>{recommendation.reasoning}</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selected} onValueChange={onSelect}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={recommendation.technology}>
              {recommendation.technology} (Recommended)
            </SelectItem>
            {alternatives.map(alt => (
              <SelectItem key={alt} value={alt}>{alt}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected === recommendation.technology && (
          <div className="mt-4 space-y-2">
            <div>
              <h4 className="text-sm font-medium text-green-600">Pros</h4>
              <ul className="text-sm text-muted-foreground">
                {recommendation.pros.map(pro => (
                  <li key={pro}>• {pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-600">Cons</h4>
              <ul className="text-sm text-muted-foreground">
                {recommendation.cons.map(con => (
                  <li key={con}>• {con}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```
