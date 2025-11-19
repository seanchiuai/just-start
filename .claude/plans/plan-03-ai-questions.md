# Plan: AI-Generated Clarification Questions

## Status: Not Started

## Overview
Generate 4-6 clarifying questions using Claude Sonnet based on the user's app description.

## Implementation Steps

### 1. QuestionSet Schema
```typescript
// convex/schema.ts
questionSets: defineTable({
  projectId: v.id("projects"),
  questions: v.array(v.object({
    id: v.number(),
    question: v.string(),
    options: v.array(v.string()),
    default: v.string(),
    category: v.string(), // "features", "audience", "scale", "workflow", "technical"
  })),
  answers: v.optional(v.record(v.string(), v.string())), // map of question_id → answer
  generatedAt: v.number(),
  answeredAt: v.optional(v.number()),
})
  .index("by_project", ["projectId"])
```

### 2. Claude API Integration
```typescript
// convex/ai/claude.ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateQuestions(
  appName: string,
  appDescription: string
): Promise<Question[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: QUESTION_GENERATION_PROMPT(appName, appDescription),
    }],
  });

  return parseQuestionsFromResponse(response);
}
```

### 3. Question Generation Prompt
```typescript
const QUESTION_GENERATION_PROMPT = (name: string, desc: string) => `
You are helping a user plan their app "${name}".

Description: ${desc}

Generate 4-6 multiple-choice questions to clarify the most critical gaps.
Each question should:
- Address one specific aspect (features, audience, scale, workflow, or technical)
- Have 3-5 options that cover common choices
- Include a sensible default option
- Be written in clear, non-technical language

Focus on questions that will most impact tech stack and architecture decisions.

Return JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["Option A", "Option B", "Option C"],
      "default": "Option A",
      "category": "features"
    }
  ]
}
`;
```

### 4. Convex Action for Generation
```typescript
// convex/questions.ts
export const generate = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(internal.projects.get, {
      projectId: args.projectId
    });

    const questions = await generateQuestions(
      project.appName,
      project.appDescription
    );

    await ctx.runMutation(internal.questions.save, {
      projectId: args.projectId,
      questions,
    });

    await ctx.runMutation(internal.projects.updateStep, {
      projectId: args.projectId,
      step: 2,
      status: "questions",
    });
  },
});
```

### 5. Questions Page UI
- [ ] Create `app/(protected)/project/[projectId]/questions/page.tsx`
- [ ] Show loading state while generating
- [ ] Display questions as cards
- [ ] Each question has radio/select for options
- [ ] Show selected/default option
- [ ] Allow custom answers via "Other" option
- [ ] Submit all answers button

### 6. UI Components

#### QuestionsLoader
```typescript
// components/features/questions/questions-loader.tsx
- Animated loading indicator
- Status messages:
  - "Analyzing your description..."
  - "Identifying key questions..."
  - "Generating options..."
- Estimated time: "Usually takes 5-10 seconds"
```

#### QuestionCard
```typescript
// components/features/questions/question-card.tsx
- Question text
- Category badge (Features, Scale, etc.)
- Radio group for options
- "Other" option with text input
- Default highlighted
```

#### QuestionsForm
```typescript
// components/features/questions/questions-form.tsx
- All question cards
- Progress: "4 of 6 answered"
- "Use all defaults" quick action
- Submit button
- "Go back" to edit description
```

### 7. Save Answers
```typescript
// convex/questions.ts
export const saveAnswers = mutation({
  args: {
    projectId: v.id("projects"),
    answers: v.record(v.string(), v.string()), // { "1": "Option A", "2": "Option B", ... }
  },
  handler: async (ctx, args) => {
    const questionSet = await ctx.db
      .query("questionSets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    await ctx.db.patch(questionSet._id, {
      answers: args.answers,
      answeredAt: Date.now(),
    });

    await ctx.runMutation(internal.projects.updateStep, {
      projectId: args.projectId,
      step: 3,
      status: "research",
    });
  },
});
```

### 8. Error Handling
- Retry on API failure (3 attempts, exponential backoff)
- Show friendly error if generation fails
- Allow regeneration

## UI/UX Design

### Layout
- Questions displayed vertically
- Clear visual hierarchy
- Progress indicator (Step 2 of 5)

### Interactions
- Selecting option saves immediately (optimistic)
- Default option pre-selected but not locked
- Smooth transitions between questions

### States
- Loading (generating)
- Ready (questions displayed)
- Answering (in progress)
- Complete (all answered)
- Error (generation failed)

## Testing Checklist
- [ ] Questions generate from description
- [ ] Questions are relevant to the app
- [ ] All options are reasonable
- [ ] Answers save correctly
- [ ] Can use custom "Other" answers
- [ ] Can go back to edit description
- [ ] Progress updates after submission
- [ ] Handles API errors gracefully

## Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.32.0"
}
```

## Estimated Effort
Question generation: ~4-5 hours
