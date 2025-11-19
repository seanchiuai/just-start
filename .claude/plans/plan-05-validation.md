# Plan: Compatibility Validation

## Status: Not Started

## Overview
Validate the confirmed tech stack for compatibility issues before PRD generation.

## Implementation Steps

### 1. CompatibilityCheck Schema
```typescript
// convex/schema.ts
compatibilityChecks: defineTable({
  projectId: v.id("projects"),
  status: v.union(
    v.literal("approved"),
    v.literal("warnings"),
    v.literal("critical")
  ),
  issues: v.array(v.object({
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("critical")
    ),
    component: v.string(),
    issue: v.string(),
    recommendation: v.string(),
  })),
  summary: v.string(),
  checkedAt: v.number(),
})
  .index("by_project", ["projectId"])
```

### 2. Validation Queries
```typescript
// convex/ai/perplexity.ts
export async function validateCompatibility(
  stack: ConfirmedStack
): Promise<ValidationResult> {
  const queries = [
    `${stack.frontend} compatibility with ${stack.backend} 2025`,
    `${stack.auth} integration with ${stack.backend}`,
    `${stack.database} best practices with ${stack.frontend}`,
    `${stack.hosting} deployment requirements for ${stack.frontend}`,
    `Common issues with ${stack.frontend} ${stack.backend} ${stack.database} stack`,
  ];

  const results = await Promise.all(
    queries.map(query => perplexitySearch(query))
  );

  return analyzeCompatibility(stack, results);
}
```

### 3. Compatibility Analysis
```typescript
// convex/ai/claude.ts
export async function analyzeCompatibilityIssues(
  stack: ConfirmedStack,
  research: string
): Promise<Issue[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: COMPATIBILITY_PROMPT(stack, research),
    }],
  });

  return parseIssuesFromResponse(response);
}

const COMPATIBILITY_PROMPT = (stack, research) => `
Analyze this tech stack for compatibility issues:

Stack:
- Frontend: ${stack.frontend}
- Backend: ${stack.backend}
- Database: ${stack.database}
- Auth: ${stack.auth}
- Hosting: ${stack.hosting}

Research findings:
${research}

Identify:
1. Version compatibility issues
2. Integration challenges
3. Deprecated technologies
4. Production readiness concerns
5. Missing requirements

For each issue, provide:
- severity: "info" | "warning" | "critical"
- component: affected technology
- issue: clear description
- recommendation: how to resolve

Critical issues should block PRD generation.
Warnings should be acknowledged but can proceed.
Info items are nice-to-know.

Return JSON array of issues...
`;
```

### 4. Validation Action
```typescript
// convex/compatibility.ts
export const validate = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const techStack = await ctx.runQuery(...);
    const stack = techStack.confirmedStack;

    // Research compatibility
    const research = await validateCompatibility(stack);

    // Analyze issues
    const issues = await analyzeCompatibilityIssues(stack, research);

    // Determine status
    const hasCritical = issues.some(i => i.severity === "critical");
    const hasWarnings = issues.some(i => i.severity === "warning");
    const status = hasCritical ? "critical" : hasWarnings ? "warnings" : "approved";

    // Generate summary
    const summary = generateSummary(status, issues);

    // Save results
    await ctx.runMutation(internal.compatibility.save, {
      projectId: args.projectId,
      status,
      issues,
      summary,
    });

    // Update project status
    if (status !== "critical") {
      await ctx.runMutation(internal.projects.updateStep, {
        projectId: args.projectId,
        step: 5,
        status: "validation",
      });
    }
  },
});
```

### 5. Validation Page UI
- [ ] Create `app/(protected)/project/[projectId]/validation/page.tsx`
- [ ] Loading state during validation
- [ ] Status banner (approved/warnings/critical)
- [ ] Issues list grouped by severity
- [ ] Recommendations for each issue
- [ ] Proceed or modify buttons

### 6. UI Components

#### ValidationLoader
```typescript
// components/features/validation/validation-loader.tsx
- Progress steps:
  - "Checking version compatibility..."
  - "Verifying integrations..."
  - "Analyzing production readiness..."
  - "Generating report..."
- Estimated time: 10-15 seconds
```

#### ValidationStatus
```typescript
// components/features/validation/validation-status.tsx
- Large status indicator:
  - Approved: green checkmark
  - Warnings: amber warning
  - Critical: red X
- Summary text
- Issue count by severity
```

#### IssueCard
```typescript
// components/features/validation/issue-card.tsx
- Severity badge (color-coded)
- Component tag
- Issue description
- Recommendation
- "Learn more" link (optional)
```

#### ValidationActions
```typescript
// components/features/validation/validation-actions.tsx
- If approved: "Generate PRD" button
- If warnings: "Proceed anyway" + "Modify stack"
- If critical: "Modify stack" only (no proceed)
- Acknowledgment checkbox for warnings
```

### 7. Modify Stack Flow
- If user wants to modify after seeing issues
- Navigate back to tech stack page
- Pre-populate with current selections
- Re-run validation after changes

## UI/UX Design

### Layout
- Status prominently displayed
- Issues in clear list
- Actions at bottom

### Styling
- Severity colors:
  - Info: blue
  - Warning: amber
  - Critical: red
- Clear visual hierarchy
- Expandable issue details

### States
- Validating (loading)
- Approved (green)
- Warnings (amber)
- Critical (red)

## Testing Checklist
- [ ] Validation runs on confirmed stack
- [ ] Issues are relevant and accurate
- [ ] Severity levels are appropriate
- [ ] Critical issues block PRD generation
- [ ] Warnings can be acknowledged
- [ ] Can go back to modify stack
- [ ] Re-validation works after changes

## Estimated Effort
Compatibility validation: ~3-4 hours
