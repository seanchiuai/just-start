# Plan: Schema Setup & Dashboard

## Status: Completed

## Overview
Extend existing Convex schema with Just Start tables and create the user dashboard.

## Implementation Steps

### 1. Install Additional Dependencies
```bash
npm install @anthropic-ai/sdk react-hook-form @hookform/resolvers zod jspdf jszip
```

### 2. Convex Schema (convex/schema.ts)
Add these tables to existing schema:

```typescript
// Users - extend if exists or create
users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  name: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  prdsGenerated: v.number(),
  subscription: v.object({
    tier: v.string(),
    credits: v.number(),
  }),
})
  .index("by_clerk_id", ["clerkId"]),

// Projects
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
  generationStatus: v.optional(v.object({
    stage: v.string(),
    progress: v.number(),
    message: v.string(),
    updatedAt: v.number(),
  })),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastAccessedAt: v.number(),
})
  .index("by_user", ["userId"]),

// Question Sets
questionSets: defineTable({
  projectId: v.id("projects"),
  questions: v.array(v.object({
    id: v.number(),
    question: v.string(),
    options: v.array(v.string()),
    default: v.string(),
    category: v.string(),
  })),
  answers: v.optional(v.any()),
  generatedAt: v.number(),
  answeredAt: v.optional(v.number()),
})
  .index("by_project", ["projectId"]),

// Tech Stack Recommendations
techStackRecommendations: defineTable({
  projectId: v.id("projects"),
  researchQueries: v.array(v.string()),
  researchResults: v.string(),
  recommendations: v.any(),
  confirmedStack: v.optional(v.any()),
  generatedAt: v.number(),
  confirmedAt: v.optional(v.number()),
})
  .index("by_project", ["projectId"]),

// Compatibility Checks
compatibilityChecks: defineTable({
  projectId: v.id("projects"),
  status: v.union(
    v.literal("approved"),
    v.literal("warnings"),
    v.literal("critical")
  ),
  issues: v.array(v.object({
    severity: v.string(),
    component: v.string(),
    issue: v.string(),
    recommendation: v.string(),
  })),
  summary: v.string(),
  checkedAt: v.number(),
})
  .index("by_project", ["projectId"]),

// PRDs
prds: defineTable({
  projectId: v.id("projects"),
  userId: v.id("users"),
  content: v.any(),
  version: v.number(),
  generatedAt: v.number(),
  exportedAt: v.optional(v.number()),
  shareToken: v.optional(v.string()),
  shareExpiresAt: v.optional(v.number()),
})
  .index("by_project", ["projectId"])
  .index("by_user", ["userId"])
  .index("by_share_token", ["shareToken"]),
```

### 3. User Webhook (if not exists)
Create `app/api/webhooks/clerk/route.ts` to sync users to Convex on signup.

### 4. Dashboard Page
Create `app/(protected)/dashboard/page.tsx`:

```typescript
// Features:
- List user's projects with status
- "Create New Project" CTA
- Usage stats (PRDs generated)
- Empty state for new users
- Resume incomplete projects
```

### 5. Project Routes Structure
```
app/(protected)/
├── dashboard/page.tsx
├── project/
│   ├── new/page.tsx
│   └── [projectId]/
│       ├── questions/page.tsx
│       ├── tech-stack/page.tsx
│       ├── validation/page.tsx
│       └── prd/page.tsx
```

### 6. Environment Variables
Add to `.env.local`:
```env
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=
```

Add to Convex dashboard:
```
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=
```

## UI Components

### ProjectCard
- Project name, description preview
- Status badge, progress indicator
- Last accessed, continue button

### EmptyDashboard
- Welcome message
- "Start your first project" CTA

## Testing Checklist
- [ ] Schema deploys without errors
- [ ] User syncs on signup
- [ ] Dashboard loads projects
- [ ] Can navigate to create project
- [ ] Empty state shows for new users

## Estimated Effort
~2-3 hours
