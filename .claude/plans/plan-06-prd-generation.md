# Plan: Comprehensive PRD Generation

## Status: Not Started

## Overview
Generate a structured JSON PRD using Claude Opus with all project context.

## Implementation Steps

### 1. PRD Schema
```typescript
// convex/schema.ts
prds: defineTable({
  projectId: v.id("projects"),
  userId: v.id("users"),
  content: v.object({
    projectOverview: v.object({
      productName: v.string(),
      description: v.string(),
      targetAudience: v.string(),
    }),
    purposeAndGoals: v.object({
      problemStatement: v.string(),
      solution: v.string(),
      keyObjectives: v.array(v.string()),
    }),
    userPersonas: v.array(v.object({
      name: v.string(),
      description: v.string(),
      useCases: v.array(v.string()),
    })),
    techStack: v.object({...}), // Full tech stack details
    features: v.object({
      mvpFeatures: v.array(v.object({
        name: v.string(),
        description: v.string(),
        priority: v.string(),
        acceptanceCriteria: v.array(v.string()),
      })),
      niceToHaveFeatures: v.array(v.object({...})),
      outOfScope: v.array(v.string()),
    }),
    technicalArchitecture: v.object({
      systemDesign: v.string(),
      dataModels: v.array(v.object({
        modelName: v.string(),
        fields: v.array(v.string()),
        relationships: v.array(v.string()),
      })),
      apiStructure: v.string(),
      thirdPartyIntegrations: v.array(v.string()),
    }),
    uiUxConsiderations: v.object({
      designApproach: v.string(),
      keyUserFlows: v.array(v.string()),
      styleGuidelines: v.string(),
    }),
  }),
  version: v.number(),
  generatedAt: v.number(),
  exportedAt: v.optional(v.number()),
  shareToken: v.optional(v.string()),
  shareExpiresAt: v.optional(v.number()),
  shareAccessCount: v.optional(v.number()),
  shareLastAccessedAt: v.optional(v.number()),
  shareRevokedAt: v.optional(v.number()),
})
  .index("by_project", ["projectId"])
  .index("by_user", ["userId"])
  .index("by_share_token", ["shareToken"])
```

### 2. PRD Generation Action
```typescript
// convex/prd.ts
export const generate = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Gather all context
    const project = await ctx.runQuery(internal.projects.get, {...});
    const questionSet = await ctx.runQuery(internal.questions.get, {...});
    const techStack = await ctx.runQuery(internal.techStack.get, {...});
    const compatibility = await ctx.runQuery(internal.compatibility.get, {...});

    // Generate PRD with Claude Opus
    const prdContent = await generatePRD(
      project,
      questionSet,
      techStack,
      compatibility
    );

    // Save PRD
    const prdId = await ctx.runMutation(internal.prd.save, {
      projectId: args.projectId,
      userId: project.userId,
      content: prdContent,
    });

    // Update project status
    await ctx.runMutation(internal.projects.updateStep, {
      projectId: args.projectId,
      step: 5,
      status: "completed",
    });

    return prdId;
  },
});
```

### 3. Claude Opus Integration
```typescript
// convex/ai/claude.ts
export async function generatePRD(
  project: Project,
  questionSet: QuestionSet,
  techStack: TechStack,
  compatibility: CompatibilityCheck
): Promise<PRDContent> {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-1-20250805", // Use Opus 4.1 for highest quality
    max_tokens: 8000,
    messages: [{
      role: "user",
      content: PRD_GENERATION_PROMPT(project, questionSet, techStack, compatibility),
    }],
  });

  return parsePRDFromResponse(response);
}
```

### 4. PRD Generation Prompt
```typescript
const PRD_GENERATION_PROMPT = (project, questionSet, techStack, compatibility) => `
Generate a comprehensive Product Requirements Document for "${project.appName}".

## Context

### Original Description
${project.appDescription}

### Clarified Requirements
${formatQuestionsAndAnswers(questionSet)}

### Confirmed Tech Stack
${formatTechStack(techStack.confirmedStack)}

### Tech Stack Reasoning
${formatTechReasoning(techStack.recommendations)}

### Compatibility Notes
${formatCompatibilityNotes(compatibility)}

## Instructions

Create a production-ready PRD that a developer can immediately use to start building.

Include:
1. **Project Overview**: Refined product name, description, and target audience
2. **Purpose & Goals**: Clear problem statement, solution, and 5-7 key objectives
3. **User Personas**: 2-3 detailed personas with realistic use cases
4. **Tech Stack**: Full details with project-specific pros/cons
5. **MVP Features**: 8-12 features with descriptions, priorities, and acceptance criteria
6. **Nice-to-Have Features**: 4-6 features for post-MVP
7. **Out of Scope**: Clear boundaries
8. **Technical Architecture**:
   - System design overview
   - Data models with fields and relationships
   - API structure
   - Third-party integrations
9. **UI/UX Considerations**:
   - Design approach
   - Key user flows
   - Style guidelines

Make it:
- Actionable (developer can start immediately)
- Specific (no generic advice)
- Realistic (appropriate for the scale)
- Complete (nothing left ambiguous)

Return valid JSON matching the PRD schema...
`;
```

### 5. PRD Page UI
- [ ] Create `app/(protected)/project/[projectId]/prd/page.tsx`
- [ ] Loading state with progress
- [ ] Display PRD in readable format
- [ ] Section navigation
- [ ] Export options
- [ ] Share functionality

### 6. UI Components

#### PRDLoader
```typescript
// components/features/prd/prd-loader.tsx
- Progress messages:
  - "Compiling project requirements..."
  - "Defining user personas..."
  - "Structuring technical architecture..."
  - "Writing feature specifications..."
  - "Finalizing document..."
- Estimated time: 30-60 seconds
- Progress percentage
```

#### PRDViewer
```typescript
// components/features/prd/prd-viewer.tsx
- Formatted PRD display
- Collapsible sections
- Syntax highlighting for tech terms
- Copy section button
- Print-friendly styles
```

#### PRDNavigation
```typescript
// components/features/prd/prd-navigation.tsx
- Table of contents sidebar
- Jump to section links
- Current section indicator
- Sticky on scroll
```

#### PRDActions
```typescript
// components/features/prd/prd-actions.tsx
- Export dropdown (JSON, Markdown, PDF)
- Share button (generate link)
- Download all button
- Edit/regenerate option
```

### 7. Real-time Status Updates
```typescript
// convex/prd.ts
export const updateGenerationStatus = mutation({
  args: {
    projectId: v.id("projects"),
    stage: v.string(),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      generationStatus: {
        stage: args.stage,
        progress: args.progress,
        updatedAt: Date.now(),
      },
    });
  },
});
```

## UI/UX Design

### Layout
- Two-column: navigation + content
- Clean typography for readability
- Progress indicator (Step 5 of 5)

### Styling
- Document-like appearance
- Clear section headers
- Code blocks for technical content
- Tables for structured data

### States
- Generating (loading with progress)
- Complete (PRD displayed)
- Exporting (download in progress)
- Sharing (link generated)

## Testing Checklist
- [ ] PRD generates from all context
- [ ] All sections are populated
- [ ] Content is project-specific
- [ ] Features have acceptance criteria
- [ ] Data models are complete
- [ ] Export formats work
- [ ] JSON is valid
- [ ] Markdown renders correctly

## Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.32.0"
}
```

## Estimated Effort
PRD generation: ~5-6 hours
