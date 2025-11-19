# CRITICAL: Questions Not Generated After Project Creation

## Severity: CRITICAL
This bug blocks the entire PRD generation workflow.

## Summary
When a user creates a new project, they are redirected to the questions page but no questions exist. The `questions.generate` action is never called after project creation.

## Steps to Reproduce
1. Navigate to dashboard
2. Click "New Project"
3. Fill in app name and description
4. Click "Create Project"
5. User is redirected to `/project/[projectId]/questions`
6. Page shows: "Questions have not been generated for this project yet."

## Expected Behavior
After project creation, questions should be automatically generated using the Claude AI integration, and the user should see the generated questions to answer.

## Actual Behavior
- Project is created successfully in "draft" status at step 1
- User is redirected to questions page
- No questions exist because `api.questions.generate` was never called
- User has no way to proceed in the workflow

## Root Cause Analysis

### Location
`/app/(protected)/project/new/page.tsx` - lines 40-45

### Code Issue
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ...
  try {
    const projectId = await createProject({
      appName: appName.trim(),
      appDescription: appDescription.trim(),
    });
    router.push(`/project/${projectId}/questions`);  // Redirects immediately
  } catch (err) {
    // ...
  }
};
```

The code:
1. Calls `createProject` mutation - this only inserts the project in the database
2. Immediately redirects to the questions page
3. **Never calls `api.questions.generate` action**

### Available Action Not Used
The `questions.generate` action exists in `convex/questions.ts` (line 194) and is designed to:
1. Fetch project details
2. Call Claude AI to generate questions
3. Save questions to database
4. Update project status to "questions" at step 2

But this action is never invoked in the project creation flow.

## Impact
- All new projects are stuck in "draft" status
- Users cannot progress through the PRD generation workflow
- Core functionality of the application is broken

## Recommended Fix
After creating the project, call the `questions.generate` action before redirecting:

```typescript
import { useAction } from "convex/react";

// In component:
const generateQuestions = useAction(api.questions.generate);

const handleSubmit = async (e: React.FormEvent) => {
  // ...
  try {
    const projectId = await createProject({
      appName: appName.trim(),
      appDescription: appDescription.trim(),
    });

    // Generate questions using Claude AI
    await generateQuestions({ projectId });

    router.push(`/project/${projectId}/questions`);
  } catch (err) {
    // ...
  }
};
```

## Additional Considerations
1. The question generation is an async AI operation - consider showing a loading state
2. May want to redirect to questions page immediately and show generation progress there
3. Consider error handling if question generation fails
4. Update project status to step 2 after successful generation

## Related Files
- `/app/(protected)/project/new/page.tsx` - New project creation page
- `/convex/prdProjects.ts` - Project creation mutation
- `/convex/questions.ts` - Question generation action
- `/convex/ai/claude.ts` - Claude AI integration for generating questions

## Date Discovered
2025-11-19
