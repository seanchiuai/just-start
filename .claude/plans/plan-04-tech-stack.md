# Plan: Tech Stack Research & Recommendations

## Status: Not Started

## Overview
Research current best practices using Perplexity API and generate tech stack recommendations using Claude.

## Implementation Steps

### 1. TechStackRecommendation Schema
```typescript
// convex/schema.ts
techStackRecommendations: defineTable({
  projectId: v.id("prdProjects"),
  researchQueries: v.array(v.string()),
  researchResults: v.string(),
  recommendations: v.object({
    frontend: v.object({
      technology: v.string(),
      reasoning: v.string(),
      pros: v.array(v.string()),
      cons: v.array(v.string()),
      alternatives: v.array(v.string()),
    }),
    backend: v.object({...}),
    database: v.object({...}),
    auth: v.object({...}),
    hosting: v.object({...}),
    additional: v.array(v.object({
      category: v.string(),
      technology: v.string(),
      reasoning: v.string(),
    })),
  }),
  confirmedStack: v.optional(v.object({...})),
  generatedAt: v.number(),
  confirmedAt: v.optional(v.number()),
})
  .index("by_project", ["projectId"])
```

### 2. Perplexity API Integration
```typescript
// convex/ai/perplexity.ts

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        const error = new Error(
          `Perplexity API error ${response.status}: ${response.statusText}. ${errorBody}`
        );

        // Retry on 5xx errors or rate limits
        if (response.status >= 500 || response.status === 429) {
          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000;
            console.warn(`Retrying Perplexity request in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
            continue;
          }
        }
        throw error;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        const timeoutError = new Error("Perplexity API request timed out after 30s");
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw timeoutError;
      }

      // Retry on network errors
      if (attempt < maxRetries - 1 && error.message.includes("fetch")) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw error;
    }
  }
}

export async function researchTechStack(
  appName: string,
  description: string,
  answers: Record<string, string>
): Promise<string> {
  const queries = generateResearchQueries(appName, description, answers);

  const results = await Promise.all(
    queries.map(query =>
      fetchWithRetry("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [{ role: "user", content: query }],
        }),
      })
    )
  );

  return combineResearchResults(results);
}
```

### 3. Research Query Generation
```typescript
function generateResearchQueries(
  appName: string,
  description: string,
  answers: Record<string, string>
): string[] {
  return [
    `Best frontend framework for ${getAppType(answers)} in 2025`,
    `Recommended backend for ${getScaleRequirements(answers)}`,
    `Database comparison for ${getDataRequirements(answers)}`,
    `Authentication solutions for ${getAuthRequirements(answers)}`,
    `Deployment options for ${getDeploymentRequirements(answers)}`,
  ];
}
```

### 4. Claude Recommendation Generation
```typescript
// convex/ai/claude.ts
export async function generateRecommendations(
  project: Project,
  answers: Record<string, string>,
  research: string
): Promise<Recommendations> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: RECOMMENDATION_PROMPT(project, answers, research),
    }],
  });

  return parseRecommendationsFromResponse(response);
}
```

### 5. Recommendation Prompt
```typescript
const RECOMMENDATION_PROMPT = (project, answers, research) => `
You are a senior software architect helping plan "${project.appName}".

App Description: ${project.appDescription}

User Requirements:
${formatAnswers(answers)}

Current Research:
${research}

Generate tech stack recommendations with:
1. Specific technology for each category (frontend, backend, database, auth, hosting)
2. Reasoning specific to THIS project (not generic)
3. 3-4 pros specific to their use case
4. 2-3 cons they should be aware of
5. 2 alternatives if they prefer different tradeoffs

Also suggest 2-3 additional tools (form validation, monitoring, etc.) that would benefit this specific project.

Return JSON matching the schema...
`;
```

### 6. Research Action
```typescript
// convex/techStack.ts
export const research = action({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    // Get project and answers
    const project = await ctx.runQuery(api.prdProjects.get, { projectId: args.projectId });
    const questionSet = await ctx.runQuery(api.questions.getByProject, { projectId: args.projectId });

    // Research with Perplexity
    const research = await researchTechStack(
      project.appName,
      project.appDescription,
      questionSet.answers
    );

    // Generate recommendations with Claude
    const recommendations = await generateRecommendations(
      project,
      questionSet.answers,
      research
    );

    // Save results
    await ctx.runMutation(internal.techStack.save, {
      projectId: args.projectId,
      researchQueries,
      researchResults: research,
      recommendations,
    });
  },
});
```

### 7. Tech Stack Page UI
- [ ] Create `app/(protected)/project/[projectId]/tech-stack/page.tsx`
- [ ] Loading state with progress updates
- [ ] Display each category in expandable card
- [ ] Show technology, reasoning, pros/cons
- [ ] Allow swapping technologies
- [ ] Confirm selection button

### 8. UI Components

#### ResearchLoader
```typescript
// components/features/tech-stack/research-loader.tsx
- Progress steps:
  - "Researching frontend frameworks..."
  - "Analyzing backend options..."
  - "Comparing databases..."
  - "Finding auth solutions..."
  - "Evaluating hosting..."
  - "Generating recommendations..."
- Estimated time: 15-20 seconds
```

#### TechCategoryCard
```typescript
// components/features/tech-stack/tech-category-card.tsx
- Category name (Frontend, Backend, etc.)
- Selected technology with logo
- Reasoning paragraph
- Collapsible pros/cons lists
- "Change" button to see alternatives
- Alternative options selector
```

#### AlternativesDialog
```typescript
// components/features/tech-stack/alternatives-dialog.tsx
- Modal showing alternatives
- Side-by-side comparison
- Select alternative button
- Compatibility warnings if applicable
```

#### TechStackSummary
```typescript
// components/features/tech-stack/tech-stack-summary.tsx
- Visual summary of all selections
- Confirm button
- "Run Compatibility Check" CTA
```

### 9. Confirm Stack
```typescript
// convex/techStack.ts
export const confirm = mutation({
  args: {
    projectId: v.id("projects"),
    confirmedStack: v.object({...}),
  },
  handler: async (ctx, args) => {
    const techStack = await ctx.db.query(...);

    await ctx.db.patch(techStack._id, {
      confirmedStack: args.confirmedStack,
      confirmedAt: Date.now(),
    });

    await ctx.runMutation(internal.projects.updateStep, {
      projectId: args.projectId,
      step: 4,
      status: "confirmation",
    });
  },
});
```

## UI/UX Design

### Layout
- Cards for each tech category
- Clear hierarchy: recommended → alternatives
- Progress indicator (Step 3 of 5)

### Styling
- Technology logos where possible
- Color-coded pros (green) / cons (amber)
- Subtle animations for expandable sections

### States
- Researching (loading)
- Ready (recommendations displayed)
- Modifying (changing selections)
- Confirmed (locked in)

## Testing Checklist
- [ ] Research queries are relevant
- [ ] Recommendations make sense for project
- [ ] Pros/cons are project-specific
- [ ] Can swap technologies
- [ ] Alternatives show compatibility warnings
- [ ] Stack confirms correctly
- [ ] Progress updates after confirmation

## Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.32.0"
}
```

## Estimated Effort
Tech stack research: ~5-6 hours
