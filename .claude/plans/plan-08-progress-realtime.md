# Plan: Progress Saving & Real-time Status

## Status: Not Started

## Overview
Auto-save progress, enable resume, and show real-time status updates during AI processing.

## Implementation Steps

### 1. Auto-Save Progress

#### Step-level Persistence
```typescript
// Already handled by project status in schema
// Each step mutation saves progress automatically
```

#### Answer Auto-Save
```typescript
// convex/questions.ts
export const saveAnswer = mutation({
  args: {
    projectId: v.id("projects"),
    questionId: v.number(),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const questionSet = await ctx.db
      .query("questionSets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    const currentAnswers = questionSet.answers || {};

    await ctx.db.patch(questionSet._id, {
      answers: {
        ...currentAnswers,
        [args.questionId]: args.answer,
      },
    });
  },
});
```

#### Tech Stack Auto-Save
```typescript
// convex/techStack.ts
export const saveSelection = mutation({
  args: {
    projectId: v.id("projects"),
    category: v.string(),
    technology: v.string(),
  },
  handler: async (ctx, args) => {
    const techStack = await ctx.db
      .query("techStackRecommendations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    const currentStack = techStack.confirmedStack || {};

    await ctx.db.patch(techStack._id, {
      confirmedStack: {
        ...currentStack,
        [args.category]: args.technology,
      },
    });
  },
});
```

### 2. Resume Flow

#### Dashboard Project List
```typescript
// convex/projects.ts
export const listByUser = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});
```

#### Resume Navigation
```typescript
// lib/navigation.ts
export function getResumeUrl(project: Project): string {
  switch (project.status) {
    case "draft":
      return `/project/new?edit=${project._id}`;
    case "questions":
      return `/project/${project._id}/questions`;
    case "research":
      return `/project/${project._id}/tech-stack`;
    case "confirmation":
      return `/project/${project._id}/tech-stack`;
    case "validation":
      return `/project/${project._id}/validation`;
    case "completed":
      return `/project/${project._id}/prd`;
    default:
      return `/project/${project._id}`;
  }
}
```

### 3. Real-time Status Updates

#### Status Schema
```typescript
// Add to projects table
generationStatus: v.optional(v.object({
  stage: v.string(),
  progress: v.number(), // 0-100
  message: v.string(),
  updatedAt: v.number(),
})),
```

#### Status Update During Actions
```typescript
// convex/prd.ts
export const generate = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Update status: starting
    await ctx.runMutation(internal.projects.updateStatus, {
      projectId: args.projectId,
      stage: "compiling",
      progress: 10,
      message: "Compiling project requirements...",
    });

    // Gather context
    const project = await ctx.runQuery(...);

    // Update status: personas
    await ctx.runMutation(internal.projects.updateStatus, {
      projectId: args.projectId,
      stage: "personas",
      progress: 30,
      message: "Defining user personas...",
    });

    // ... continue with updates at each stage

    // Update status: complete
    await ctx.runMutation(internal.projects.updateStatus, {
      projectId: args.projectId,
      stage: "complete",
      progress: 100,
      message: "PRD generated successfully!",
    });
  },
});
```

### 4. Progress Indicator Component

#### ProgressIndicator
```typescript
// components/features/progress/progress-indicator.tsx
interface Props {
  currentStep: number;
  totalSteps: number;
  status: string;
}

export function ProgressIndicator({ currentStep, totalSteps, status }: Props) {
  const steps = [
    { name: "Description", step: 1 },
    { name: "Questions", step: 2 },
    { name: "Tech Stack", step: 3 },
    { name: "Validation", step: 4 },
    { name: "PRD", step: 5 },
  ];

  return (
    <div className="flex items-center justify-between">
      {steps.map((s, i) => (
        <div key={s.step} className="flex items-center">
          <StepCircle
            step={s.step}
            current={currentStep}
            status={status}
          />
          {i < steps.length - 1 && (
            <StepConnector completed={currentStep > s.step} />
          )}
        </div>
      ))}
    </div>
  );
}
```

### 5. Real-time Status Display

#### GenerationStatus
```typescript
// components/features/progress/generation-status.tsx
export function GenerationStatus({ projectId }: { projectId: Id<"projects"> }) {
  const project = useQuery(api.projects.get, { projectId });
  const status = project?.generationStatus;

  if (!status) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm font-medium">{status.message}</span>
      </div>

      <Progress value={status.progress} />

      <p className="text-xs text-muted-foreground">
        Usually takes {getEstimatedTime(status.stage)}
      </p>
    </div>
  );
}
```

### 6. Estimated Times
```typescript
// lib/estimates.ts
export function getEstimatedTime(stage: string): string {
  const estimates: Record<string, string> = {
    questions: "5-10 seconds",
    research: "15-20 seconds",
    validation: "10-15 seconds",
    generation: "30-60 seconds",
  };

  return estimates[stage] || "a moment";
}
```

### 7. Jump Back Feature

#### Navigation Component
```typescript
// components/features/progress/step-navigation.tsx
export function StepNavigation({ project }: { project: Project }) {
  const currentStep = project.currentStep;

  const canGoBack = (step: number) => step < currentStep;

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((step) => (
        <button
          key={step}
          disabled={!canGoBack(step)}
          onClick={() => navigateToStep(project._id, step)}
          className={cn(
            "px-3 py-1 rounded",
            currentStep === step && "bg-primary text-primary-foreground",
            canGoBack(step) && "hover:bg-muted"
          )}
        >
          {step}
        </button>
      ))}
    </div>
  );
}
```

## UI Components

### ProjectCard (Dashboard)
```typescript
// components/features/project/project-card.tsx
- Project name
- Description preview
- Status badge
- Progress indicator
- Last accessed
- Continue button
- Delete option
```

### EmptyDashboard
```typescript
// components/features/project/empty-dashboard.tsx
- Friendly illustration
- "Start your first project" message
- CTA button
```

## UI/UX Design

### Progress Visualization
- Step circles with numbers
- Connecting lines
- Current step highlighted
- Completed steps with checkmarks

### Status Updates
- Smooth transitions
- Clear messaging
- Progress bar animation
- Time estimates

### Resume Experience
- Clear "Continue" buttons
- Status visible at glance
- Last accessed timestamp
- One-click resume

## Testing Checklist
- [ ] Progress saves after each step
- [ ] Answers auto-save on change
- [ ] Can close and resume later
- [ ] Resume goes to correct step
- [ ] Real-time status updates display
- [ ] Progress bar animates smoothly
- [ ] Can jump back to edit previous steps
- [ ] Re-running steps clears later data

## Estimated Effort
Progress & real-time: ~3-4 hours
