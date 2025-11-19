# Plan: App Idea Input & Analysis

## Status: Completed

**Implementation:** Feature is implemented at `app/(protected)/project/new/page.tsx`

## Overview
Create the first step of the wizard where users enter their app name and description.

## Implementation Steps

### 1. Convex Project Schema
```typescript
// convex/schema.ts
projects: defineTable({
  userId: v.id("users"),
  appName: v.string(),
  appDescription: v.string(),
  status: v.union(
    v.literal("draft"),
    v.literal("questions"),
    v.literal("research"),
    v.literal("confirmation"),
    v.literal("validation"),
    v.literal("completed")
  ),
  currentStep: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastAccessedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_status", ["userId", "status"])
```

### 2. Project Mutations
```typescript
// convex/projects.ts
export const create = mutation({
  args: {
    appName: v.string(),
    appDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      appName: args.appName,
      appDescription: args.appDescription,
      status: "draft",
      currentStep: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastAccessedAt: Date.now(),
    });

    return projectId;
  },
});

export const updateStep = mutation({
  args: {
    projectId: v.id("projects"),
    step: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      currentStep: args.step,
      status: args.status,
      updatedAt: Date.now(),
      lastAccessedAt: Date.now(),
    });
  },
});
```

### 3. Create Project Page
- [ ] Create `app/(protected)/project/new/page.tsx`
- [ ] Form with app name (required, 3-50 chars)
- [ ] Description textarea (required, 50-2000 chars)
- [ ] Character count indicator
- [ ] Form validation with Zod + React Hook Form

### 4. Form Schema
```typescript
const projectSchema = z.object({
  appName: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be under 50 characters"),
  appDescription: z
    .string()
    .min(50, "Please provide at least 50 characters")
    .max(2000, "Description must be under 2000 characters"),
});
```

### 5. UI Components

#### NewProjectForm
```typescript
// components/features/project/new-project-form.tsx
- App name input with label
- Description textarea with:
  - Placeholder with example
  - Character count (current/max)
  - Helper text explaining what to include
- Submit button with loading state
- Error messages
```

#### DescriptionTips
```typescript
// components/features/project/description-tips.tsx
- Collapsible tips panel
- Suggestions for what to include:
  - Core problem being solved
  - Target users
  - Key features
  - Expected scale
  - Any technical constraints
```

### 6. Analysis Feedback (Pre-submission)
- [ ] Show real-time feedback as user types
- [ ] Indicators for:
  - Problem statement detected
  - Target audience mentioned
  - Features described
  - Technical requirements noted
- [ ] "Your description is strong" / "Consider adding..." messages

### 7. Redirect Flow
- On successful creation → redirect to `/project/[projectId]/questions`
- Show toast: "Project created! Generating questions..."

## UI/UX Design

### Layout
- Centered form, max-width 600px
- Clean, focused interface
- Progress indicator showing Step 1 of 5

### Styling
- Large, comfortable input fields
- Soft validation (not aggressive)
- Encouraging microcopy
- Example descriptions toggle

### States
- Empty (initial)
- Typing (with live feedback)
- Submitting (loading)
- Error (validation)
- Success (redirect)

## Testing Checklist
- [ ] Form validates on submit
- [ ] Cannot submit empty fields
- [ ] Character limits enforced
- [ ] Project creates in Convex
- [ ] Redirects to questions page
- [ ] Project appears in dashboard
- [ ] Can edit draft project

## Estimated Effort
Input form: ~2-3 hours
