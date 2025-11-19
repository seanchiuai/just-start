# Frontend Architecture

## App Router Structure (Next.js 15)

### Directory Layout
```text
/app
├── (auth)/          # Public routes (login, signup)
├── (protected)/     # Protected routes (require auth)
│   ├── dashboard/   # User dashboard with saved projects
│   ├── project/     # Multi-step wizard flow
│   │   ├── new/     # Start new project
│   │   ├── [id]/    # Resume/view project by ID
│   │   │   ├── questions/      # Step 2: Answer AI questions
│   │   │   ├── tech-stack/     # Step 3: Review recommendations
│   │   │   ├── confirmation/   # Step 4: Confirm selections
│   │   │   ├── validation/     # Step 5: Compatibility checks
│   │   │   └── prd/            # Step 6: View generated PRD
│   └── settings/    # User settings
├── layout.tsx       # Root layout
└── page.tsx         # Landing page
```

### Route Groups
- `(auth)`: Public authentication pages (login, signup)
- `(protected)`: Wizard flow & dashboard (requires Clerk auth)

### File Conventions
- `page.tsx`: Route UI
- `layout.tsx`: Shared layout for route segment
- `loading.tsx`: Loading UI
- `error.tsx`: Error UI
- `not-found.tsx`: 404 UI

### Routing Patterns
- Use `@/*` imports for all internal modules
- Server components by default, add `"use client"` when needed
- Client components required for:
  - Event handlers (onClick, onChange, etc.)
  - Hooks (useState, useEffect, etc.)
  - Browser APIs
  - Convex hooks (useQuery, useMutation, useAction)

### Navigation
```tsx
import Link from "next/link";
import { useRouter } from "next/navigation";

// Declarative
<Link href="/dashboard">Dashboard</Link>

// Programmatic
const router = useRouter();
router.push("/dashboard");
```

### Data Fetching
- Use Convex hooks in client components
- Server components can fetch directly (use client components for Convex)
- Streaming with Suspense boundaries for AI processing

## Wizard Flow Architecture

### Step-by-Step PRD Generation
```
Step 1: App Input     → User enters name + description
Step 2: Questions     → AI generates 4-6 clarifying questions
Step 3: Tech Stack    → Perplexity research + Claude recommendations
Step 4: Confirmation  → User confirms/modifies selections
Step 5: PRD Output    → Claude Opus generates comprehensive PRD
```

### State Management for Wizard
- Project state persisted to Convex after each step
- `status` field tracks progress: `'draft' | 'questions' | 'research' | 'confirmation' | 'completed'`
- Real-time updates during AI processing via Convex subscriptions

### Progress Saving Pattern
```tsx
"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function WizardStep() {
  const updateStep = useMutation(api.projects.updateStep);

  const handleNext = async (data: StepData) => {
    // Save answers and advance step
    await updateStep({
      projectId,
      step: currentStep + 1,
      data
    });
  };
}
```

## File Locations
- Pages: `/app/**/*.tsx`
- Components: `/components/**/*.tsx`
- UI Components: `/components/ui/**/*.tsx`
- Wizard Steps: `/components/wizard/**/*.tsx`
- Hooks: `/hooks/**/*.ts`
- Utils: `/lib/**/*.ts`
- Backend: `/convex/**/*.ts`
