# Application Workflow Documentation

Complete guide to the Just Start application's backend and frontend workflow, from API calls to user interactions.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [Database Schema](#database-schema)
4. [Complete PRD Workflow](#complete-prd-workflow)
5. [API Call Sequences](#api-call-sequences)
6. [Real-time Updates](#real-time-updates)
7. [Component Data Flow](#component-data-flow)
8. [AI Integration](#ai-integration)

---

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Next.js    │    │    Clerk     │    │   Convex Client      │  │
│  │   App Router │    │   Auth UI    │    │   (React Hooks)      │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘  │
│         │                   │                       │               │
└─────────┼───────────────────┼───────────────────────┼───────────────┘
          │                   │                       │
          │                   │ JWT Token             │ WebSocket
          │                   │                       │
┌─────────┼───────────────────┼───────────────────────┼───────────────┐
│         │                   │         BACKEND       │               │
│         ▼                   ▼                       ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Vercel     │    │    Clerk     │    │      Convex          │  │
│  │   Hosting    │    │   Backend    │    │      Backend         │  │
│  └──────────────┘    └──────┬───────┘    └──────────┬───────────┘  │
│                             │                       │               │
│                             │ JWT Validation        │               │
│                             ▼                       │               │
│                      ┌──────────────┐               │               │
│                      │  auth.config │◄──────────────┤               │
│                      └──────────────┘               │               │
│                                                     │               │
│                      ┌──────────────────────────────┴───────────┐  │
│                      │                                          │  │
│                      ▼                                          ▼  │
│               ┌──────────────┐                    ┌──────────────┐  │
│               │   Queries    │                    │   Actions    │  │
│               │  Mutations   │                    │  (Node.js)   │  │
│               └──────┬───────┘                    └──────┬───────┘  │
│                      │                                   │          │
│                      │                                   │          │
│                      ▼                                   ▼          │
│               ┌──────────────┐              ┌────────────────────┐ │
│               │   Convex DB  │              │   External APIs    │ │
│               │  (Document)  │              │  ┌──────┐ ┌──────┐ │ │
│               └──────────────┘              │  │Claude│ │Perpl.│ │ │
│                                             │  └──────┘ └──────┘ │ │
│                                             └────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15 | React framework with App Router |
| Styling | Tailwind 4 + shadcn/ui | UI components & design system |
| Auth | Clerk | Authentication & user management |
| Backend | Convex | Real-time database & serverless functions |
| AI | Claude (Anthropic) | Question generation, recommendations, PRD |
| AI | Perplexity | Tech stack research |

---

## Authentication Flow

### Clerk + Convex JWT Integration

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │     │  Clerk  │     │ Convex  │     │   DB    │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Sign In       │               │               │
     │──────────────►│               │               │
     │               │               │               │
     │ JWT Token     │               │               │
     │◄──────────────│               │               │
     │               │               │               │
     │ API Request + JWT             │               │
     │──────────────────────────────►│               │
     │               │               │               │
     │               │ Validate JWT  │               │
     │               │◄──────────────│               │
     │               │               │               │
     │               │ Valid         │               │
     │               │──────────────►│               │
     │               │               │               │
     │               │               │ Query/Mutate  │
     │               │               │──────────────►│
     │               │               │               │
     │               │               │ Result        │
     │               │               │◄──────────────│
     │               │               │               │
     │ Response                      │               │
     │◄──────────────────────────────│               │
     │               │               │               │
```

### Provider Setup

```typescript
// app/layout.tsx
<ClerkProvider>
  <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
    {children}
  </ConvexProviderWithClerk>
</ClerkProvider>
```

### Auth Verification Pattern

```typescript
// Every Convex query/mutation
const identity = await ctx.auth.getUserIdentity();
if (!identity) return null; // Or throw

const user = await ctx.db.query("users")
  .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
  .unique();

if (!user) return null;
// Proceed with authorized operation
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ _id             │
│ clerkId (idx)   │
│ email           │
│ name?           │
│ prdsGenerated   │
│ subscription    │
│ createdAt       │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│  prdProjects    │
├─────────────────┤
│ _id             │
│ userId (idx)    │◄───────────────┐
│ appName         │                │
│ appDescription  │                │
│ status          │                │
│ currentStep     │                │
│ generationStatus│                │
│ createdAt       │                │
└────────┬────────┘                │
         │                         │
         │ 1:1                     │
         ├─────────────────────┬───┴───────────────┬──────────────────┐
         ▼                     ▼                   ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐
│  questionSets   │  │techStackRecomm. │  │compatibilityChk │  │    prds      │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤  ├──────────────┤
│ _id             │  │ _id             │  │ _id             │  │ _id          │
│ projectId (idx) │  │ projectId (idx) │  │ projectId (idx) │  │ projectId    │
│ questions[]     │  │ researchQueries │  │ status          │  │ userId (idx) │
│ answers?        │  │ researchResults │  │ issues[]        │  │ content      │
│ generatedAt     │  │ recommendations │  │ summary         │  │ version      │
│ answeredAt?     │  │ confirmedStack? │  │ checkedAt       │  │ shareToken?  │
└─────────────────┘  │ generatedAt     │  └─────────────────┘  │ shareExpires?│
                     └─────────────────┘                       └──────────────┘
```

### Project Status Flow

```
┌─────────┐    ┌───────────┐    ┌──────────┐    ┌──────────────┐    ┌────────────┐    ┌───────────┐
│  draft  │───►│ questions │───►│ research │───►│ confirmation │───►│ validation │───►│ completed │
└─────────┘    └───────────┘    └──────────┘    └──────────────┘    └────────────┘    └───────────┘
     │               │               │                │                   │                │
     ▼               ▼               ▼                ▼                   ▼                ▼
  Step 1          Step 2         (Auto)           Step 3              Step 4           Step 5
/project/new   /questions    AI generates      /tech-stack        /validation         /prd
                            tech research
```

---

## Complete PRD Workflow

### End-to-End Sequence Diagram

```
┌─────┐  ┌─────────┐  ┌─────────┐  ┌───────┐  ┌──────────┐  ┌─────────┐
│User │  │Frontend │  │ Convex  │  │Claude │  │Perplexity│  │   DB    │
└──┬──┘  └────┬────┘  └────┬────┘  └───┬───┘  └────┬─────┘  └────┬────┘
   │          │            │           │           │             │
   │ STEP 1: Create Project            │           │             │
   │──────────────────────►│           │           │             │
   │          │ create()   │           │           │             │
   │          │───────────►│           │           │             │
   │          │            │───────────────────────────────────► │
   │          │            │           │           │   save      │
   │          │◄───────────│           │           │             │
   │          │ projectId  │           │           │             │
   │          │            │           │           │             │
   │          │ generate() │           │           │             │
   │          │───────────►│           │           │             │
   │          │            │──────────►│           │             │
   │          │            │ questions │           │             │
   │          │            │◄──────────│           │             │
   │          │            │───────────────────────────────────► │
   │          │            │           │           │   save      │
   │◄─────────│────────────│           │           │             │
   │ redirect to /questions│           │           │             │
   │          │            │           │           │             │
   │ STEP 2: Answer Questions          │           │             │
   │          │ getByProject()         │           │             │
   │          │───────────►│           │           │             │
   │          │◄───────────│───────────────────────────────────► │
   │◄─────────│            │           │           │   fetch     │
   │ display  │            │           │           │             │
   │          │            │           │           │             │
   │ submit   │            │           │           │             │
   │──────────►            │           │           │             │
   │          │ saveAnswers()          │           │             │
   │          │───────────►│           │           │             │
   │          │            │───────────────────────────────────► │
   │          │            │           │           │ save+update │
   │          │◄───────────│           │           │             │
   │          │            │           │           │             │
   │          │ research() │           │           │             │
   │          │───────────►│           │           │             │
   │          │            │──────────────────────►│             │
   │          │            │           │   search  │             │
   │          │            │◄──────────────────────│             │
   │          │            │──────────►│           │             │
   │          │            │ recommend │           │             │
   │          │            │◄──────────│           │             │
   │          │            │───────────────────────────────────► │
   │          │◄───────────│           │           │   save      │
   │◄─────────│            │           │           │             │
   │ redirect │            │           │           │             │
   │          │            │           │           │             │
   │ STEP 3: Confirm Tech Stack        │           │             │
   │          │ getByProject()         │           │             │
   │          │───────────►│───────────────────────────────────► │
   │◄─────────│◄───────────│           │           │   fetch     │
   │ display  │            │           │           │             │
   │          │            │           │           │             │
   │ confirm  │            │           │           │             │
   │──────────►            │           │           │             │
   │          │ confirm()  │           │           │             │
   │          │───────────►│           │           │             │
   │          │            │───────────────────────────────────► │
   │          │            │           │           │ save+update │
   │          │            │           │           │             │
   │          │ validate() │           │           │             │
   │          │───────────►│           │           │             │
   │          │            │──────────►│           │             │
   │          │            │ analyze   │           │             │
   │          │            │◄──────────│           │             │
   │          │            │───────────────────────────────────► │
   │          │◄───────────│           │           │   save      │
   │◄─────────│            │           │           │             │
   │ redirect │            │           │           │             │
   │          │            │           │           │             │
   │ STEP 4: Review Validation         │           │             │
   │          │ getByProject()         │           │             │
   │          │───────────►│───────────────────────────────────► │
   │◄─────────│◄───────────│           │           │   fetch     │
   │ display  │            │           │           │             │
   │          │            │           │           │             │
   │ proceed  │            │           │           │             │
   │──────────►            │           │           │             │
   │          │ acknowledge()          │           │             │
   │          │───────────►│───────────────────────────────────► │
   │          │            │           │           │   update    │
   │          │            │           │           │             │
   │          │ generate() │           │           │             │
   │          │───────────►│           │           │             │
   │          │            │──────────►│           │             │
   │          │            │ full PRD  │           │             │
   │          │            │◄──────────│           │             │
   │          │            │───────────────────────────────────► │
   │          │◄───────────│           │           │   save      │
   │◄─────────│            │           │           │             │
   │ redirect │            │           │           │             │
   │          │            │           │           │             │
   │ STEP 5: View PRD      │           │           │             │
   │          │ getByProject()         │           │             │
   │          │───────────►│───────────────────────────────────► │
   │◄─────────│◄───────────│           │           │   fetch     │
   │ display  │            │           │           │             │
   │          │            │           │           │             │
```

---

## API Call Sequences

### Step 1: Project Creation

```typescript
// User action: Submit new project form
// File: app/(protected)/project/new/page.tsx

// 1. Create project in database
const projectId = await createProject({
  appName,
  appDescription
});

// 2. Generate questions using Claude
await generateQuestions({ projectId });

// 3. Redirect to questions page
router.push(`/project/${projectId}/questions`);
```

**Backend Flow:**

```
prdProjects.create()
├── Verify user identity
├── Create user if not exists (from Clerk data)
├── Insert prdProject document
│   ├── status: "draft"
│   └── currentStep: 1
└── Return projectId

questions.generate()
├── Get project details
├── Call Claude generateQuestions()
│   ├── System prompt: "Generate 4-6 clarifying questions..."
│   └── Response: Question[]
├── Save to questionSets table
└── Update project status to "questions"
```

### Step 2: Answering Questions

```typescript
// User action: Submit question answers
// File: app/(protected)/project/[projectId]/questions/page.tsx

// Convex hooks
const questions = useQuery(api.questions.getByProject, { projectId });

// On submit
await saveAnswers({ projectId, answers });
router.push(`/project/${projectId}/tech-stack`);
```

**Backend Flow:**

```
questions.saveAnswers()
├── Verify user owns project
├── Update questionSets.answers
├── Update prdProjects
│   ├── status: "research"
│   └── currentStep: 3
└── Trigger techStack.research() automatically

techStack.research()
├── Get project + questions + answers
├── Call Perplexity researchTechStack()
│   ├── Generate 5 research queries
│   └── Execute searches, aggregate results
├── Call Claude generateRecommendations()
│   └── Create 5-layer recommendations
└── Save to techStackRecommendations
```

### Step 3: Tech Stack Confirmation

```typescript
// User action: Confirm tech stack selections
// File: app/(protected)/project/[projectId]/tech-stack/page.tsx

const techStack = useQuery(api.techStack.getByProject, { projectId });

// On confirm
await confirmStack({
  projectId,
  stack: selections // { frontend, backend, database, auth, hosting }
});
router.push(`/project/${projectId}/validation`);
```

**Backend Flow:**

```
techStack.confirm()
├── Verify user owns project
├── Update techStackRecommendations.confirmedStack
├── Update prdProjects
│   ├── status: "confirmation"
│   └── currentStep: 4
└── Trigger compatibility.validate()

compatibility.validate()
├── Get confirmed tech stack
├── Call Claude analyzeCompatibilityIssues()
│   └── Return CompatibilityIssue[]
├── Determine status (approved/warnings/critical)
└── Save to compatibilityChecks
```

### Step 4: Validation Acknowledgment

```typescript
// User action: Proceed past validation
// File: app/(protected)/project/[projectId]/validation/page.tsx

const validation = useQuery(api.compatibility.getByProject, { projectId });

// On proceed
await acknowledgeWarnings({ projectId });
// This triggers PRD generation in background
router.push(`/project/${projectId}/prd`);
```

**Backend Flow:**

```
compatibility.acknowledgeWarnings()
├── Verify user owns project
├── Update prdProjects
│   ├── status: "validation"
│   └── currentStep: 5
└── Trigger prd.generate()

prd.actions.generate()
├── Get all context (project, questions, techStack, compatibility)
├── Call Claude generatePRD()
│   └── Generate comprehensive PRD document
├── Save to prds table
│   └── content: JSON.stringify(prdContent)
├── Update user.prdsGenerated++
└── Update prdProjects.status to "completed"
```

### Step 5: PRD Actions

```typescript
// User actions: Export or Share
// File: app/(protected)/project/[projectId]/prd/page.tsx

const prd = useQuery(api.prd.getByProject, { projectId });

// Export as JSON
const result = await exportJSON({ prdId: prd._id });
// Downloads file on client

// Create share link
const { token, expiresAt } = await createShareLink({ prdId: prd._id });
// Copy link to clipboard
```

---

## Real-time Updates

### Generation Status Tracking

```
┌──────────────────────────────────────────────────────────────────┐
│                    Real-time Progress Flow                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Action Execution                Frontend UI                    │
│   ┌─────────────┐                 ┌─────────────┐                │
│   │ Start       │ updateStatus()  │ Subscribe   │                │
│   │ generation  │────────────────►│ to project  │                │
│   └─────────────┘                 └─────────────┘                │
│         │                               │                        │
│         ▼                               ▼                        │
│   ┌─────────────┐                 ┌─────────────┐                │
│   │ Stage 1     │ progress: 25%   │ Show        │                │
│   │ "Analyzing" │────────────────►│ progress    │                │
│   └─────────────┘                 │ bar: 25%    │                │
│         │                         └─────────────┘                │
│         ▼                               │                        │
│   ┌─────────────┐                       ▼                        │
│   │ Stage 2     │ progress: 50%   ┌─────────────┐                │
│   │ "Calling AI"│────────────────►│ Update      │                │
│   └─────────────┘                 │ bar: 50%    │                │
│         │                         └─────────────┘                │
│         ▼                               │                        │
│   ┌─────────────┐                       ▼                        │
│   │ Stage 3     │ progress: 100%  ┌─────────────┐                │
│   │ "Complete"  │────────────────►│ Hide        │                │
│   └─────────────┘                 │ progress    │                │
│         │                         └─────────────┘                │
│         ▼                                                        │
│   ┌─────────────┐                                                │
│   │ Clear       │                                                │
│   │ status      │                                                │
│   └─────────────┘                                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Convex Reactive Queries

```typescript
// Frontend subscription pattern
const project = useQuery(api.prdProjects.get, { projectId });

// Automatically re-renders when:
// - Any field on project document changes
// - Including generationStatus updates

// Backend update during action
await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
  projectId,
  status: {
    stage: "generating_questions",
    progress: 50,
    message: "Analyzing your app description...",
    updatedAt: Date.now()
  }
});
```

---

## Component Data Flow

### Dashboard → Project Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Dashboard Page                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ useQuery(api.users.getCurrentUser)                  │    │
│  │ useQuery(api.prdProjects.listByUser)               │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Dashboard UI                       │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐              │    │
│  │  │ Stats   │  │ Stats   │  │ Stats   │              │    │
│  │  │ PRDs    │  │ Plan    │  │ Credits │              │    │
│  │  └─────────┘  └─────────┘  └─────────┘              │    │
│  │                                                      │    │
│  │  ┌──────────────┐                                   │    │
│  │  │ New Project  │──────────► /project/new           │    │
│  │  └──────────────┘                                   │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────┐     │    │
│  │  │ Project Grid                               │     │    │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐│     │    │
│  │  │  │ProjectCard│ │ProjectCard│ │ProjectCard││     │    │
│  │  │  └─────┬─────┘ └───────────┘ └───────────┘│     │    │
│  │  └────────┼──────────────────────────────────┘     │    │
│  │           │                                         │    │
│  │           ▼ Click                                   │    │
│  │   Smart routing based on status:                    │    │
│  │   • draft → /project/[id]/questions                 │    │
│  │   • completed → /project/[id]/prd                   │    │
│  │   • other → /project/[id]/[status]                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Questions Page Component Tree

```
┌─────────────────────────────────────────────────────────────┐
│                     Questions Page                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ useQuery(api.prdProjects.get, { projectId })        │    │
│  │ useQuery(api.questions.getByProject, { projectId }) │    │
│  │ useMutation(api.questions.saveAnswers)              │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  WizardLayout                        │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │ ProgressIndicator (Step 2 of 5)               │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │              QuestionsForm                    │  │    │
│  │  │  Local State: answers: Record<string, string> │  │    │
│  │  │                                               │  │    │
│  │  │  ┌─────────────────────────────────────────┐  │  │    │
│  │  │  │ "Use all recommended" button            │  │  │    │
│  │  │  └─────────────────────────────────────────┘  │  │    │
│  │  │                                               │  │    │
│  │  │  questions.map(q =>                          │  │    │
│  │  │    ┌─────────────────────────────────────┐   │  │    │
│  │  │    │         QuestionCard                │   │  │    │
│  │  │    │  ┌───────────────┐                  │   │  │    │
│  │  │    │  │ Category Badge│                  │   │  │    │
│  │  │    │  └───────────────┘                  │   │  │    │
│  │  │    │  ┌───────────────┐                  │   │  │    │
│  │  │    │  │ Question Text │                  │   │  │    │
│  │  │    │  └───────────────┘                  │   │  │    │
│  │  │    │  ┌───────────────┐                  │   │  │    │
│  │  │    │  │   RadioGroup  │                  │   │  │    │
│  │  │    │  │  ○ Option 1   │ onChange →       │   │  │    │
│  │  │    │  │  ● Option 2   │ setAnswers()     │   │  │    │
│  │  │    │  │  ○ Option 3   │                  │   │  │    │
│  │  │    │  └───────────────┘                  │   │  │    │
│  │  │    └─────────────────────────────────────┘   │  │    │
│  │  │  )                                           │  │    │
│  │  │                                               │  │    │
│  │  │  ┌─────────────────────────────────────────┐  │  │    │
│  │  │  │ Submit → saveAnswers(answers)          │  │  │    │
│  │  │  │        → router.push(/tech-stack)      │  │  │    │
│  │  │  └─────────────────────────────────────────┘  │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### PRD Page Component Tree

```
┌─────────────────────────────────────────────────────────────┐
│                        PRD Page                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ useQuery(api.prdProjects.get, { projectId })        │    │
│  │ useQuery(api.prd.getByProject, { projectId })       │    │
│  │ useAction(api.prd.exportJSON)                       │    │
│  │ useAction(api.prd.exportMarkdown)                   │    │
│  │ useMutation(api.prd.createShareLink)                │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    PRDViewer                         │    │
│  │                                                      │    │
│  │  ┌──────────────┬────────────────────────────────┐  │    │
│  │  │  Sidebar     │         Content Area           │  │    │
│  │  │              │                                │  │    │
│  │  │ PRDNavigation│  ┌────────────────────────┐    │  │    │
│  │  │  ○ Overview  │  │   OverviewSection      │    │  │    │
│  │  │  ○ Goals     │  │   id="overview"        │    │  │    │
│  │  │  ● Personas  │  └────────────────────────┘    │  │    │
│  │  │  ○ Tech      │  ┌────────────────────────┐    │  │    │
│  │  │  ○ Features  │  │   GoalsSection         │    │  │    │
│  │  │  ○ Arch      │  │   id="goals"           │    │  │    │
│  │  │  ○ UI/UX     │  └────────────────────────┘    │  │    │
│  │  │              │  ┌────────────────────────┐    │  │    │
│  │  │ activeSection│  │   PersonasSection      │    │  │    │
│  │  │ tracks scroll│  │   id="personas"        │    │  │    │
│  │  │              │  └────────────────────────┘    │  │    │
│  │  │              │           ...                  │  │    │
│  │  └──────────────┴────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │          PRDActions (floating)                │  │    │
│  │  │  ┌─────────────┐    ┌───────────────┐        │  │    │
│  │  │  │Export ▼     │    │ Share         │        │  │    │
│  │  │  │ ○ JSON      │    │ createShareLink│        │  │    │
│  │  │  │ ○ Markdown  │    │ → copy URL    │        │  │    │
│  │  │  └─────────────┘    └───────────────┘        │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## AI Integration

### Claude API Integration

```
┌──────────────────────────────────────────────────────────────┐
│              Claude AI Functions (convex/ai/claude.ts)       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Model: claude-sonnet-4-20250514                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ generateQuestions(appName, appDescription)             │ │
│  │                                                        │ │
│  │ Input:  App name + description                        │ │
│  │ Output: Question[] (4-6 questions)                    │ │
│  │         { id, question, options[], default, category } │ │
│  │                                                        │ │
│  │ Used in: questions.generate action                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ generateRecommendations(appName, desc, answers, res)   │ │
│  │                                                        │ │
│  │ Input:  App details + Perplexity research results     │ │
│  │ Output: TechRecommendations                           │ │
│  │         { frontend, backend, database, auth, hosting } │ │
│  │         Each: { tech, reasoning, pros[], cons[], alt[] }│ │
│  │                                                        │ │
│  │ Used in: techStack.research action                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ analyzeCompatibilityIssues(stack)                      │ │
│  │                                                        │ │
│  │ Input:  Confirmed tech stack selections               │ │
│  │ Output: CompatibilityIssue[]                          │ │
│  │         { severity, component, issue, recommendation } │ │
│  │                                                        │ │
│  │ Used in: compatibility.validate action                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ generatePRD(name, desc, answers, stack, recs, notes)   │ │
│  │                                                        │ │
│  │ Input:  All project context                           │ │
│  │ Output: PRDContent                                    │ │
│  │         { projectOverview, purposeAndGoals,           │ │
│  │           userPersonas, techStack, features,          │ │
│  │           technicalArchitecture, uiuxConsiderations } │ │
│  │                                                        │ │
│  │ Used in: prd.actions.generate action                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Perplexity API Integration

```
┌──────────────────────────────────────────────────────────────┐
│          Perplexity Functions (convex/ai/perplexity.ts)      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Model: sonar-pro                                           │
│  Retry: 3 attempts with exponential backoff (1s, 2s, 4s)    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ researchTechStack(appName, description, answers)       │ │
│  │                                                        │ │
│  │ Flow:                                                 │ │
│  │ 1. Analyze app characteristics                        │ │
│  │ 2. Generate 5 contextual research queries             │ │
│  │    • App type/scale                                   │ │
│  │    • Data requirements                                │ │
│  │    • Auth needs                                       │ │
│  │    • Deployment considerations                        │ │
│  │    • Integration requirements                         │ │
│  │ 3. Execute searches for each query                    │ │
│  │ 4. Aggregate results                                  │ │
│  │                                                        │ │
│  │ Output: { queries: string[], results: string }        │ │
│  │                                                        │ │
│  │ Used in: techStack.research action                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### AI Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Complete AI Pipeline                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Questions                                               │
│  ┌───────────┐                     ┌───────────┐                │
│  │User Input │ ─────────────────►  │  Claude   │                │
│  │Name + Desc│                     │ Questions │                │
│  └───────────┘                     └─────┬─────┘                │
│                                          │                       │
│                                          ▼                       │
│                                    4-6 Questions                 │
│                                                                  │
│  Step 3: Tech Stack Research                                     │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐                │
│  │  Answers  │───►│ Perplexity│───►│  Claude   │                │
│  │           │    │  Research │    │  Recommend│                │
│  └───────────┘    └─────┬─────┘    └─────┬─────┘                │
│                         │                │                       │
│                         ▼                ▼                       │
│                   Research Data    5 Recommendations             │
│                                                                  │
│  Step 4: Validation                                              │
│  ┌───────────┐                     ┌───────────┐                │
│  │ Confirmed │ ─────────────────►  │  Claude   │                │
│  │   Stack   │                     │  Validate │                │
│  └───────────┘                     └─────┬─────┘                │
│                                          │                       │
│                                          ▼                       │
│                                 Compatibility Issues             │
│                                                                  │
│  Step 5: PRD Generation                                          │
│  ┌───────────────────┐             ┌───────────┐                │
│  │ All Context       │             │  Claude   │                │
│  │ • App details     │────────────►│  Generate │                │
│  │ • Answers         │             │   PRD     │                │
│  │ • Tech stack      │             └─────┬─────┘                │
│  │ • Recommendations │                   │                       │
│  │ • Validation notes│                   ▼                       │
│  └───────────────────┘          Complete PRD Document            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

### Key Architectural Decisions

1. **Real-time by Default** - Convex provides automatic reactivity; UI updates instantly when data changes
2. **Separation of Concerns** - Queries for reads, Mutations for writes, Actions for external APIs
3. **Row-level Security** - Every operation verifies user ownership
4. **Progressive Enhancement** - Each workflow step saves state; users can resume at any point
5. **AI Orchestration** - Claude handles generation/analysis, Perplexity handles research only

### Data Ownership Chain

```
User (Clerk ID)
  └── prdProjects
        ├── questionSets
        ├── techStackRecommendations
        ├── compatibilityChecks
        └── prds
```

### API Patterns

| Type | Auth | Use Case |
|------|------|----------|
| Public Query | Clerk JWT | Client-initiated reads |
| Internal Query | None | Action-initiated reads |
| Public Mutation | Clerk JWT | Client-initiated writes |
| Internal Mutation | None | Action-initiated writes |
| Action | Optional | AI calls, crypto, Node.js APIs |

### File Quick Reference

| Area | Key Files |
|------|-----------|
| Pages | `app/(protected)/project/[projectId]/*` |
| Components | `components/features/{prd,questions,tech-stack,validation}/` |
| Backend | `convex/{prdProjects,questions,techStack,compatibility,prd}.ts` |
| AI | `convex/ai/{claude,perplexity}.ts` |
| Types | `lib/types/prd.ts` |
| Auth | `convex/auth.config.ts`, `middleware.ts` |
