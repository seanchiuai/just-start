# Plan: UI Build Phase

## Status: Completed

## Overview
Build all frontend UI components for the PRD generation wizard. **Designed for parallel execution** - each page track can be built independently using mock data, then integrated with Convex backend.

## Prerequisites
- Plans 01-02 completed (schema, dashboard, new project page)
- Plan 01 provides schema types for mock data

---

## Parallelization Strategy

### Mock Data Approach
Each UI track builds components with TypeScript interfaces and mock data. No Convex queries until integration phase. This enables:
- Multiple engineers working simultaneously
- UI polish before backend is ready
- Clear component contracts

### Execution Tracks

```text
                    ┌── Track A: Questions UI ──────┐
                    │                               │
Phase 1 ──────────> ├── Track B: Tech Stack UI ────┤
(Foundation)        │                               │
   │                ├── Track C: Validation UI ────┼──> Phase 3
   │                │                               │   (Integration)
   │                ├── Track D: PRD UI ───────────┤
   │                │                               │
   │                ├── Track E: Dashboard UI ─────┤
   │                │                               │
   │                └── Track F: Export/Share UI ──┘
   │
   └── Backend Plans (03-07) can run in parallel ──────>
```

### Engineer Allocation

**2 Engineers:**
| Engineer | Work |
|----------|------|
| A | Phase 1 → Tracks A, B, C |
| B | Tracks D, E, F → Phase 3 |

**3 Engineers:**
| Engineer | Work |
|----------|------|
| A | Phase 1 → Tracks A, B |
| B | Tracks C, D |
| C | Tracks E, F → Phase 3 |

**4 Engineers:**
| Engineer | Work |
|----------|------|
| A | Phase 1 (blocks all) |
| B | Tracks A, B |
| C | Tracks C, D |
| D | Tracks E, F → Phase 3 |

---

## Design Direction: Technical Editorial

**Concept**: Editorial elegance meets engineering precision. Premium design publication crossed with technical documentation.

**Typography**: `Fraunces` display + `JetBrains Mono` technical + `system-ui` body

**Colors**: Ink/paper/gold accent palette (see CSS variables below)

**Textures**: Dot-grid backgrounds, subtle grain overlays

**Motion**: Typewriter effects, staggered reveals, meaningful hover states

### Design Tokens
```css
:root {
  /* Typography */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Colors */
  --color-ink: #1a1f2e;
  --color-ink-light: #3d4559;
  --color-ink-muted: #6b7280;
  --color-paper: #fafaf9;
  --color-paper-warm: #f5f4f0;
  --color-paper-dark: #e8e6e1;
  --color-accent: #c9a227;
  --color-accent-muted: #d4b85a;
  --color-success: #2d6a4f;
  --color-warning: #b45309;
  --color-critical: #9f1239;
  --color-info: #1e40af;
}
```

---

## Phase 1: Foundation (BLOCKING)

**Must complete before parallel tracks begin.**

### 1.1 Global Styles & Tokens
```typescript
// globals.css + tailwind.config.ts
- Import fonts (Fraunces, JetBrains Mono)
- CSS custom properties
- Texture utilities (bg-dotgrid, texture-grain)
- Animation keyframes (fadeInUp, typewriter, pulse)
```

### 1.2 Shared UI Primitives
```typescript
// components/ui/
- Button variants (primary gold, secondary, ghost)
- Card with paper-warm background
- Badge (category colors)
- Progress bar (gold accent)
- Skeleton loader
- Copy button with feedback
```

### 1.3 Progress Indicator
```typescript
// components/features/progress/progress-indicator.tsx
Props: { currentStep: number; totalSteps: number }

- Horizontal timeline, numbered circles (JetBrains Mono)
- Completed: filled ink + check
- Current: gold ring, pulsing
- Pending: hollow, muted
- Dotted connecting lines (blueprint feel)
```

### 1.4 Generation Status Display
```typescript
// components/features/progress/generation-status.tsx
Props: { stage: string; progress: number; message: string }

- Typewriter animation for message
- Three-dot loader → morphs to checkmark
- Thin gold progress bar
- Monospace estimated time
```

### 1.5 Page Layout Shell
```typescript
// components/features/project/wizard-layout.tsx
Props: { children; projectName: string; currentStep: number }

- Max-width container, dot-grid background
- Header: project name (Fraunces) + progress indicator
- Back to dashboard link
- Content area with paper-warm background
```

**Effort: 4-5 hours**

---

## Track A: Questions UI (PARALLEL)

### Mock Data
```typescript
// lib/mocks/questions.ts
export const mockQuestions: Question[] = [
  {
    id: 1,
    question: "What is the primary purpose of your app?",
    options: ["Productivity", "Social", "E-commerce", "Education"],
    default: "Productivity",
    category: "features"
  },
  // ... 4-5 more
];

export const mockAnswers: Record<string, string> = {
  "1": "Productivity",
  "2": "Small teams"
};
```

### Components

#### Questions Loader
```typescript
// components/features/questions/questions-loader.tsx
- Three skeleton cards with shimmer
- Typewriter status message
- Staggered fade-in
```

#### Question Card
```typescript
// components/features/questions/question-card.tsx
Props: { question: Question; value: string; onChange: (v: string) => void }

- Category badge (mono, uppercase, colored by type)
- Question text (Fraunces, 20px)
- Custom radio group (gold fill on select)
- "(recommended)" label on default
- "Other" option with slide-down input
```

#### Questions Form
```typescript
// components/features/questions/questions-form.tsx
Props: { questions: Question[]; onSubmit: (answers) => void }

- Vertical stack with space-y-8
- Progress counter: "3 of 5" (monospace)
- "Use all defaults" link
- Submit button (gold)
```

#### Questions Page (with mock)
```typescript
// app/(protected)/project/[projectId]/questions/page.tsx
- Import mockQuestions
- Render QuestionsForm
- Console.log on submit (integration later)
```

**Effort: 4-5 hours**

---

## Track B: Tech Stack UI (PARALLEL)

### Mock Data
```typescript
// lib/mocks/tech-stack.ts
export const mockRecommendations: TechStackRecommendations = {
  frontend: {
    technology: "Next.js 15",
    reasoning: "Best for SEO and server components...",
    pros: ["Server Components", "Great DX", "Vercel integration"],
    cons: ["Learning curve", "Newer ecosystem"],
    alternatives: ["Remix", "Nuxt"]
  },
  backend: { /* ... */ },
  database: { /* ... */ },
  auth: { /* ... */ },
  hosting: { /* ... */ }
};
```

### Components

#### Research Loader
```typescript
// components/features/tech-stack/research-loader.tsx
- Vertical timeline of steps
- Gold dot pulsing on current
- Checkmarks replace dots on complete
- Timeline draws down progressively
```

#### Tech Category Card
```typescript
// components/features/tech-stack/tech-category-card.tsx
Props: { category: string; recommendation: TechRecommendation; onChangeClick: () => void }

- Category: monospace, uppercase
- Tech name: Fraunces, 24px
- Reasoning: 2-3 lines
- Expandable pros (green) / cons (orange)
- "Change" text button
```

#### Alternatives Dialog
```typescript
// components/features/tech-stack/alternatives-dialog.tsx
Props: { category: string; alternatives: string[]; onSelect: (tech: string) => void }

- Modal with paper background
- Options as cards with key differentiator
- Compatibility warnings (warning color)
```

#### Tech Stack Summary
```typescript
// components/features/tech-stack/tech-stack-summary.tsx
Props: { stack: ConfirmedStack; onConfirm: () => void }

- Grid layout (2x3 desktop)
- Visual connections between items
- "Confirm Stack" gold CTA
```

#### Tech Stack Page (with mock)
```typescript
// app/(protected)/project/[projectId]/tech-stack/page.tsx
- Import mockRecommendations
- Manage local state for selections
- Render cards + summary
```

**Effort: 5-6 hours**

---

## Track C: Validation UI (PARALLEL)

### Mock Data
```typescript
// lib/mocks/validation.ts
export const mockValidationResult: CompatibilityCheck = {
  status: "warnings",
  issues: [
    {
      severity: "warning",
      component: "Database",
      issue: "Convex requires specific Node.js version",
      recommendation: "Ensure Node 18+ in production"
    },
    {
      severity: "info",
      component: "Auth",
      issue: "Clerk webhook needs configuration",
      recommendation: "Set up webhook in Clerk dashboard"
    }
  ],
  summary: "2 warnings found. Review before proceeding."
};
```

### Components

#### Validation Loader
```typescript
// components/features/validation/validation-loader.tsx
- Circular progress (not bar)
- Large monospace percentage in center
- Gold ring fills
- Typewriter status below
```

#### Validation Status Banner
```typescript
// components/features/validation/validation-status.tsx
Props: { status: "approved" | "warnings" | "critical"; summary: string; counts: Record<string, number> }

- Full-width banner
- Approved: green + check
- Warnings: orange + alert
- Critical: rose + X
- Status text (Fraunces), summary, counts (mono badges)
```

#### Issue Card
```typescript
// components/features/validation/issue-card.tsx
Props: { issue: Issue }

- Left border color by severity
- Severity badge (mono, uppercase)
- Component pill
- Issue title + recommendation
- Expandable details
```

#### Validation Actions
```typescript
// components/features/validation/validation-actions.tsx
Props: { status; onProceed; onModify }

- Approved: "Generate PRD" (gold)
- Warnings: checkbox + "Proceed anyway"
- Critical: "Modify Stack" only
```

#### Validation Page (with mock)
```typescript
// app/(protected)/project/[projectId]/validation/page.tsx
- Import mockValidationResult
- Show banner + issues + actions
```

**Effort: 3-4 hours**

---

## Track D: PRD UI (PARALLEL)

### Mock Data
```typescript
// lib/mocks/prd.ts
export const mockPRD: PRDContent = {
  projectOverview: {
    productName: "TaskFlow",
    description: "A collaborative task management app...",
    targetAudience: "Small development teams..."
  },
  purposeAndGoals: { /* ... */ },
  userPersonas: [ /* ... */ ],
  techStack: { /* ... */ },
  features: {
    mvpFeatures: [ /* ... */ ],
    niceToHaveFeatures: [ /* ... */ ],
    outOfScope: [ /* ... */ ]
  },
  technicalArchitecture: { /* ... */ },
  uiUxConsiderations: { /* ... */ }
};
```

### Components

#### PRD Loader
```typescript
// components/features/prd/prd-loader.tsx
- Document skeleton (mimics PRD structure)
- Typing lines animate in sections
- Section headers visible, content shimmers
- Progress bar at bottom
```

#### PRD Navigation
```typescript
// components/features/prd/prd-navigation.tsx
Props: { sections: string[]; activeSection: string; onNavigate: (s: string) => void }

- Sticky sidebar
- Section numbers (mono) + names
- Current: ink color + dot indicator
- Dotted line connecting items
- Mobile: horizontal tabs
```

#### PRD Sections
```typescript
// components/features/prd/sections/*.tsx
Each section component:
- Section number: large mono, muted ("01")
- Title: Fraunces, 28px
- Content: formatted, generous line-height
- Copy button appears on hover

Specific:
- user-personas.tsx: persona cards
- features-list.tsx: cards with priority badges
- architecture.tsx: diagram-like layout
- data-models.tsx: structured tables
```

#### PRD Viewer
```typescript
// components/features/prd/prd-viewer.tsx
Props: { prd: PRDContent }

- Two-column: nav (240px) + content
- Paper-warm content area
- Smooth scroll between sections
- Mobile: single column
```

#### PRD Actions Bar
```typescript
// components/features/prd/prd-actions.tsx
Props: { onExport; onShare }

- Floating bar, semi-transparent blur
- Icon buttons with tooltips
- Export, Share, Download All
```

#### PRD Page (with mock)
```typescript
// app/(protected)/project/[projectId]/prd/page.tsx
- Import mockPRD
- Render PRD viewer + actions
```

**Effort: 6-7 hours**

---

## Track E: Dashboard UI (PARALLEL)

### Mock Data
```typescript
// lib/mocks/projects.ts
export const mockProjects: Project[] = [
  {
    _id: "1",
    appName: "TaskFlow",
    appDescription: "Collaborative task management...",
    status: "completed",
    currentStep: 5,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
    lastAccessedAt: Date.now() - 3600000
  },
  {
    _id: "2",
    appName: "FitTrack",
    status: "questions",
    currentStep: 2,
    // ...
  }
];
```

### Components

#### Project Card
```typescript
// components/features/project/project-card.tsx
Props: { project: Project; onContinue; onDelete }

- Paper-warm card
- Name: Fraunces, truncated
- Description: 2 lines, muted
- Status pill (colored)
- Small progress indicator
- "Continue" button (gold)
- Delete icon on hover
- Timestamp (mono)
```

#### Empty Dashboard
```typescript
// components/features/project/empty-dashboard.tsx
Props: { onCreateFirst: () => void }

- Centered, minimal
- Line illustration (compass/blueprint)
- Welcome message (Fraunces)
- "Start your first project" CTA (gold)
- Brief value props (3 icons)
- SVG line-draw animation
```

#### Dashboard Header
```typescript
// components/features/project/dashboard-header.tsx
Props: { stats: { total: number; inProgress: number }; onNewProject: () => void }

- "Your Projects" (Fraunces)
- Stats inline (mono)
- "New Project" button (gold)
```

#### Dashboard Page (enhance existing)
```typescript
// app/(protected)/dashboard/page.tsx
- Use mockProjects for development
- Grid layout (2 col desktop)
- Staggered card entrance
```

**Effort: 3-4 hours**

---

## Track F: Export & Share UI (PARALLEL)

### Components

#### Export Dropdown
```typescript
// components/features/prd/export-dropdown.tsx
Props: { onExport: (format: string) => void }

- Dropdown menu
- Options: JSON, Markdown, PDF (with icons)
- File size estimates
- Loading spinner per format
- Success checkmark
```

#### Share Dialog
```typescript
// components/features/prd/share-dialog.tsx
Props: { shareUrl?: string; onGenerate; onRevoke }

- Modal with padding
- "Share your PRD" (Fraunces)
- Generated URL (mono, truncated)
- Copy button (gold)
- Expiration info
- Revoke option (warning text)
- URL types out on generate
```

#### Share Page
```typescript
// app/share/[token]/page.tsx

- Public route
- Minimal header with logo
- Read-only PRD viewer
- Footer CTA: "Create your own"
- Expired/invalid states
```

**Effort: 3-4 hours**

---

## Phase 3: Integration (AFTER PARALLEL TRACKS + BACKEND)

### Connect Convex Queries
Replace mock data imports with real Convex hooks:

```typescript
// Before (mock)
import { mockQuestions } from "@/lib/mocks/questions";
const questions = mockQuestions;

// After (real)
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
const questions = useQuery(api.questions.getByProject, { projectId });
```

### Integration Tasks
- [ ] Questions page: `api.questions.getByProject`, `api.questions.saveAnswers`
- [ ] Tech Stack page: `api.techStack.getByProject`, `api.techStack.confirm`
- [ ] Validation page: `api.compatibility.getByProject`
- [ ] PRD page: `api.prd.getByProject`, `api.prd.generate`
- [ ] Dashboard: `api.prdProjects.listByUser`
- [ ] Export: `api.prd.exportJSON`, `api.prd.exportMarkdown`
- [ ] Share: `api.prd.createShareLink`, `api.prd.getShared`

### Error Handling
- Add loading states (already built with loaders)
- Add error boundaries
- Add retry logic for failed queries
- Add optimistic updates for mutations

### Real-time Updates
- Wire up `generationStatus` subscriptions
- Progress updates during AI processing

**Effort: 4-5 hours**

---

## Component Dependencies

```json
{
  "fonts": [
    "@fontsource/fraunces",
    "@fontsource/jetbrains-mono"
  ],
  "animation": "motion",
  "radix": [
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-progress",
    "@radix-ui/react-radio-group",
    "@radix-ui/react-collapsible",
    "@radix-ui/react-tooltip"
  ],
  "icons": "lucide-react",
  "forms": ["react-hook-form", "@hookform/resolvers", "zod"]
}
```

---

## Effort Summary

| Phase/Track | Effort | Can Parallel |
|-------------|--------|--------------|
| Phase 1: Foundation | 4-5 hrs | No (blocking) |
| Track A: Questions | 4-5 hrs | Yes |
| Track B: Tech Stack | 5-6 hrs | Yes |
| Track C: Validation | 3-4 hrs | Yes |
| Track D: PRD | 6-7 hrs | Yes |
| Track E: Dashboard | 3-4 hrs | Yes |
| Track F: Export/Share | 3-4 hrs | Yes |
| Phase 3: Integration | 4-5 hrs | After tracks |

**Total: ~33-40 hours**
**With 4 parallel engineers: ~12-15 hours elapsed**

---

## Design Principles Checklist

Before marking any component complete:

- [ ] Uses Fraunces for display, JetBrains Mono for technical
- [ ] Uses ink/paper/accent palette
- [ ] Has dot-grid or grain texture where fitting
- [ ] Has entrance animation, meaningful hover
- [ ] Clear visual hierarchy
- [ ] Feels like "Just Start", not generic SaaS
- [ ] Works with mock data (no Convex dependency)
