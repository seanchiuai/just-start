# Changelog

## [Unreleased] - 2025-11-19

### Documentation Update - Codebase Status Analysis

**Analysis Complete:** Used parallel agents to analyze components, routes, Convex, styles, and config.

**Updated Documentation:**

**component-patterns.md:**
- Added barrel exports pattern (landing/index.ts)
- Added Convex query type casting pattern with `as Doc<>[]`
- Added component status section (all working)
- Added interface export pattern (FolderNode)

**convex-patterns.md:**
- Added Node.js runtime separation pattern (prd.ts vs prd.actions.ts)
- Added progress tracking pattern for AI actions
- Added current implementation status section
- Documented legacy tables (todos, numbers) for removal
- Listed required environment variables
- Documented AI wrapper files (convex/ai/)

**frontend-architecture.md:**
- Updated (auth) route group as not implemented
- Added comprehensive route status section
- Listed deprecated routes for removal (bookmarks, tasks, search-demo, font-test, server)
- Noted API routes are unused (Convex-only backend)

**styling-guide.md:**
- Added Technical Editorial design system documentation
- Documented ink/paper/gold color palette with RGB values
- Added typography section (Fraunces, JetBrains Mono)
- Added custom animations (fade-in, slide-in, scale-in, stagger)
- Added custom card styles (card-editorial, card-minimal)
- Noted Tailwind 4 CSS-first configuration
- Listed incomplete patterns (texture-grain, bg-dotgrid, unused utilities)

**type-definitions.md:**
- Added Convex query type casting section with examples

**icon-usage.md:**
- Added deprecation note for @tabler/icons-react

**state-management.md:**
- Updated Convex query example with type casting pattern

**api-routes-guide.md:**
- Added status note: no API routes, backend via Convex

**Key Findings:**
- All components working ✅
- 5 deprecated routes to remove 🗑️
- 2 legacy Convex tables to remove (todos, numbers)
- @tabler/icons-react to remove
- Type casting needed for some Convex queries
- Several unused CSS patterns defined but not used

---

### Integration Phase - Mock Data Replacement

**IMPORTANT: Run `npx convex dev` to regenerate types after pulling these changes.**

**Completed:**
- Created shared types file `lib/types/prd.ts` with all PRD-related types
- Created `components/ui/query-loader.tsx` with loading skeletons
- Integrated Questions page with Convex queries/mutations
- Integrated Tech Stack page with Convex queries/mutations
- Integrated Validation page with Convex queries/mutations
- Integrated PRD page with Convex queries/mutations/actions
- Deleted all mock files from `lib/mocks/`
- Updated all component imports to use new types file

**Pages Updated:**
- `app/(protected)/project/[projectId]/questions/page.tsx` - Uses `api.questions.getByProject`, `api.questions.saveAnswers`
- `app/(protected)/project/[projectId]/tech-stack/page.tsx` - Uses `api.techStack.getByProject`, `api.techStack.confirm`
- `app/(protected)/project/[projectId]/validation/page.tsx` - Uses `api.compatibility.getByProject`, `api.compatibility.acknowledgeWarnings`
- `app/(protected)/project/[projectId]/prd/page.tsx` - Uses `api.prd.getByProject`, `api.prd.exportJSON`, `api.prd.exportMarkdown`, `api.prd.createShareLink`

**Types Added to `lib/types/prd.ts`:**
- Project types: `PrdProject`, `QuestionSet`, `TechStackRecommendations`, `CompatibilityCheck`, `PRD`
- Status types: `ProjectStatus`, `ValidationStatus`, `ValidationSeverity`, `QuestionCategory`
- Content types: `Question`, `TechRecommendation`, `ValidationIssue`, `PRDContent`, `UserPersona`, `Feature`
- UI mappings: `statusColors`, `statusLabels`, `severityColors`, `categoryColors`, `categoryLabels`, `prdSections`

**Note:** Some type errors remain in Convex files due to missing codegen. Run `npx convex dev` to resolve.

---

### Security Fixes

**Export Action Authorization:**
- `exportJSON` and `exportMarkdown` now require authentication
- Added ownership verification using `verifyOwnership` internal query
- Prevents unauthorized access to other users' PRDs

**Secure Token Generation:**
- Replaced `Math.random()` with `crypto.randomBytes(32)`
- Tokens now use URL-safe base64 encoding (256 bits entropy)
- Cryptographically secure share links

**Compatibility Validation:**
- Removed Perplexity API dependency from validation
- Now uses only Anthropic Claude for compatibility analysis
- More comprehensive analysis with single API call

---

### Implemented - Plans 03-07: Backend AI Integration

**AI Wrapper Files (`convex/ai/`):**
- `claude.ts` - Claude API wrapper for questions, recommendations, compatibility, PRD generation
- `perplexity.ts` - Perplexity API wrapper for tech stack research only

**Plan 03 - AI Questions (`convex/questions.ts`):**
- `generate` action - Generates 4-6 clarifying questions using Claude Sonnet
- `save` internal mutation - Saves questions to database
- `saveAnswers` mutation - Saves user answers, updates project status
- `getByProject` query - Gets questions for a project with auth

**Plan 04 - Tech Stack (`convex/techStack.ts`):**
- `research` action - Uses Perplexity for research, Claude for recommendations
- `save` internal mutation - Saves recommendations to database
- `confirm` mutation - Confirms user's tech stack selection
- `getByProject` query - Gets recommendations with auth

**Plan 05 - Validation (`convex/compatibility.ts`):**
- `validate` action - Uses Claude only for compatibility analysis
- `save` internal mutation - Saves compatibility check results
- `acknowledgeWarnings` mutation - Allows proceeding with warnings
- `getByProject` query - Gets validation results with auth

**Plan 06 - PRD Generation (`convex/prd.ts`):**
- `generate` action - Generates PRD using Claude with all project context
- `save` internal mutation - Saves PRD (as JSON string)
- `getByProject`, `get` queries - Gets PRD with auth

**Plan 07 - Export & Sharing (`convex/prd.ts`):**
- `createShareLink` mutation - Generates share token with 7-day expiry
- `revokeShareLink` mutation - Revokes share link
- `getShared` query - Public query for shared PRDs (no auth)
- `exportJSON`, `exportMarkdown` actions - Export PRD in different formats
- `prdToMarkdown` helper - Converts PRD JSON to Markdown

**prdProjects.ts Updates:**
- Added `updateStatusInternal` - Internal status update for actions
- Added `updateGenerationStatus` - Real-time progress updates
- Added `clearGenerationStatus` - Clear progress when done

**Share Page (`app/share/[token]/page.tsx`):**
- Public page for viewing shared PRDs
- Displays PRD content (overview, goals, personas, tech stack, features)
- Handles expired/invalid tokens
- CTA to create own PRD

**Key Features:**
- All actions use progress status updates for real-time feedback
- Retry logic with exponential backoff for API calls
- Auth checks on all public queries/mutations
- Internal queries/mutations for action-to-db communication

---

### Plan 09 - Landing Page & Marketing

**New Components (`components/landing/`):**
- `hero-section.tsx` - "Stop Coding. Start Planning." headline, CTAs, trust badges
- `problem-section.tsx` - Pain points grid (abandoned projects, wrong features, etc.)
- `solution-section.tsx` - Benefits list, idea-to-PRD transformation visual
- `how-it-works-section.tsx` - 4-step process with icons and timeline
- `features-section.tsx` - 6 feature cards (AI questions, research, validation, etc.)
- `prd-preview-section.tsx` - Interactive PRD example with tabbed sections
- `testimonials-section.tsx` - 3 testimonials with metrics
- `pricing-section.tsx` - Free/Pro tiers with feature comparison
- `cta-section.tsx` - Final conversion section with social proof
- `footer.tsx` - Links and copyright

**SEO & Metadata:**
- Updated `app/layout.tsx` with Just Start metadata (title, description, keywords)
- Added OpenGraph and Twitter card meta tags
- Added JSON-LD structured data for SoftwareApplication schema
- Product: "Just Start - AI-Powered PRD Generator"

**Page Updates:**
- `app/page.tsx` - Full landing page with all sections
- Authenticated users redirect to `/dashboard`
- Unauthenticated users see marketing landing page

**Design:**
- Clean, minimal style following styling-guide.md
- Mobile-first responsive design
- Proper icon usage from lucide-react
- Consistent with shadcn/ui component patterns

---

### Code Quality Fixes

- Added `type="button"` to prevent form submissions: prd-navigation, share-dialog, alternatives-dialog
- Fixed concurrent export guard in export-dropdown
- Added null guard for question-card isOtherSelected
- Removed invalid stagger classes in questions-loader
- Fixed border-l color classes in issue-card (use hsl() syntax)
- Added accessibility to validation-loader (role, aria-label)
- Added error handling and fixed props spread order in copy-button
- Wired up onCreateFirst prop in empty-dashboard
- Fixed validation summary count (2 → 3)
- Added useEffect to question-card to initialize otherValue from value prop
- Changed "Other" fallback to empty string in question-card handlers
- Moved export-dropdown setTimeout to useEffect with cleanup to prevent memory leaks

---

### Completed - Plan 10: UI Build Phase

**Technical Editorial Design System:**
- Fraunces + JetBrains Mono fonts, ink/paper/gold palette
- Animations: typewriter, pulse-ring, fade-in-up
- Textures: dot-grid backgrounds, grain overlays
- Updated globals.css with design tokens

**Components Created:**
- Foundation: progress, radio-group, collapsible, copy-button, progress-indicator, generation-status, wizard-layout
- Questions: loader, card, form (Track A)
- Tech Stack: loader, category-card, alternatives-dialog, summary (Track B)
- Validation: loader, status, issue-card, actions (Track C)
- PRD: navigation, sections, viewer, actions (Track D)
- Dashboard: project-card, empty-dashboard, dashboard-header (Track E)
- Export/Share: export-dropdown, share-dialog, share page (Track F)

**Mock Data:** questions, tech-stack, validation, prd, projects

**Dependencies:** @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-collapsible, motion

---

### Plans

- Restructured `plan-10-ui-build.md` for parallel execution
  - Mock data approach: UI builds without Convex dependency
  - 6 parallel tracks (A-F) after foundation phase
  - Integration phase syncs UI with backend
  - 4 engineers: ~12-15 hours elapsed (vs ~33-40 sequential)
  - Design system: Fraunces + JetBrains Mono, ink/paper/gold palette

- Updated `plan-execution-flow.md` with new parallel strategy
  - Plans 01-02 marked complete (not tested)
  - UI stream, Backend stream, Landing page all run in parallel
  - Backend is critical path (~21-25 hours)
  - Engineer allocation tables for 2-5+ engineers

---

## [Unreleased] - 2025-11-18

### Code Quality Fixes

**TypeScript/Type Safety:**
- Dashboard: Added `ProjectStatus` type, typed `statusColors`/`statusLabels` as `Record<ProjectStatus, string>`
- Schema: Typed `answers` as `Record<string, string>`, typed recommendations with full tech stack schema
- Schema: Typed `severity` enum as `critical | moderate | low`, added PRD content documentation
- Fixed `use-mobile.ts` to return `boolean | undefined` to prevent hydration mismatch

**Component Extraction:**
- Created `Textarea` component (`components/ui/textarea.tsx`)
- Created `ProjectLayout` component for shared project page structure
- Refactored all project pages to use `ProjectLayout`

**Convex Function Improvements:**
- `listByUser`: Returns `null` for auth failures vs empty array for no projects
- `updateLastAccessed`: Added ownership verification
- `remove`: Parallel deletion using `Promise.all` for performance
- Added proper ownership checks to prevent unauthorized access

**Bug Fixes:**
- Protected layout: Fixed redirect() during render - now uses useEffect/useRouter
- New project: Added error logging in catch block
- ProjectLayout: Fixed conditional React hook - useQuery now called before early returns with 'skip' option

**prd-generator.js:**
- Added API key validation on startup
- Added 60s timeout with AbortController for API calls
- Added retry limit (MAX_RETRIES=3) for compatibility resolution

**Docs:**
- Added validation route to frontend-architecture.md directory tree

---

### Completed - Plan 01: Schema Setup & Dashboard

**Schema Changes:**
- Added `users` table with Clerk sync, subscription tracking
- Added `prdProjects` table for project management with status workflow
- Added `questionSets`, `techStackRecommendations`, `compatibilityChecks`, `prds` tables
- Named project table `prdProjects` to avoid conflict with existing `projects` table

**Convex Functions:**
- `convex/users.ts` - User management (CRUD, credits, subscription)
- `convex/prdProjects.ts` - Project CRUD, status updates, ownership checks
- `convex/http.ts` - Clerk webhook endpoint for user sync

**Frontend:**
- `/app/(protected)/layout.tsx` - Protected routes layout
- `/app/(protected)/dashboard/page.tsx` - User dashboard with project list, stats, empty state
- `/app/(protected)/project/new/page.tsx` - New project form
- `/app/(protected)/project/[projectId]/*` - Placeholder pages for questions, tech-stack, validation, prd

**Dependencies:**
- Added: `@anthropic-ai/sdk`, `react-hook-form`, `@hookform/resolvers`, `zod`, `jspdf`, `jszip`, `svix`

**Fixes:**
- Fixed pre-existing type errors in chat-sidebar, memory-panel, semantic-search, sidebar, folder-tree
- Updated middleware to protect `/dashboard` and `/project` routes

**Next Steps:** Plan 02 (app input form) or Plan 03 (AI questions)

---

### Added - Implementation Plans

Created implementation plans in `.claude/plans/` (based on existing Next.js/Convex/Clerk template):

1. **plan-01-schema-dashboard.md** - Schema setup, dependencies, dashboard page
2. **plan-02-app-input.md** - App description form, validation
3. **plan-03-ai-questions.md** - Claude Sonnet question generation
4. **plan-04-tech-stack.md** - Perplexity research, Claude recommendations
5. **plan-05-validation.md** - Tech stack compatibility checks
6. **plan-06-prd-generation.md** - Claude Opus PRD generation
7. **plan-07-export-sharing.md** - JSON/MD/PDF export, shareable links
8. **plan-08-progress-realtime.md** - Auto-save, resume, real-time status
9. **plan-09-landing-page.md** - Marketing page, SEO

**Execution order:** 01 → 02-06 (wizard flow) → 07-09 (polish)

---

### Documentation - PRD Alignment

Updated all docs to align with Just Start PRD (AI-powered PRD generator):

**frontend-architecture.md:**
- Added wizard flow route structure (`/project/[id]/questions|tech-stack|confirmation|prd`)
- Added step-by-step PRD generation flow documentation
- Added state management patterns for multi-step wizard
- Added progress saving pattern with Convex mutations

**convex-patterns.md:**
- Added Just Start data models section with full schema
- Added tables: `projects`, `questionSets`, `techStackRecommendations`, `compatibilityChecks`, `prds`
- Added AI integration patterns with Claude Sonnet/Opus actions
- Added Perplexity API research patterns

**component-patterns.md:**
- Added wizard step component pattern with progress indicator
- Added AI processing status component for real-time updates
- Added tech stack selection card with pros/cons display
- Added multi-step form navigation patterns

### Status Notes

**Current codebase** contains bookmark manager features (folders, semantic search, chat) that need refactoring for PRD generator.

**Required implementation:**
- 🚧 Wizard flow pages (questions, tech-stack, confirmation, prd)
- 🚧 AI integration (Claude Sonnet/Opus, Perplexity)
- 🚧 PRD export (JSON, Markdown, PDF)
- 🚧 Shareable PRD links with expiration

---

## [Unreleased] - 2025-11-17

### Added - Tech Stack Agents

**New Agents:**
- `agent-openai.md`: OpenAI embeddings (text-embedding-3-small) + chat completions (gpt-4o-mini) with cost optimization, error handling, retry logic
- `agent-shadcn.md`: shadcn/ui + Tailwind CSS 4 patterns, component usage, responsive design, dark mode, accessibility
- `agent-unfurl.md`: Unfurl.js metadata extraction (OG, Twitter Cards, oEmbed), image storage, fallback strategy
- `agent-microlink.md`: Microlink API for complex sites (Instagram, Twitter), smart fallback, quota management
- `agent-vercel.md`: Next.js deployment, environment variables, preview/prod workflows, analytics, monitoring

**Removed:**
- `agent-ui.md`: Replaced by more comprehensive `agent-shadcn.md`

**Each agent includes:**
- Installation steps and configuration
- Complete code examples with TypeScript
- Best practices and patterns
- Error handling strategies
- Testing checklists
- Resource links

## [Unreleased] - 2025-11-17

### Added - AI Chat System with RAG

**Backend:**
- `convex/chat.ts`: AI chat orchestration with OpenAI integration
- `convex/chatMessages.ts`: Chat message CRUD operations
- `convex/memory.ts`: User memory storage for context persistence
- `convex/schema.ts`: Added chatMessages and userMemory tables

**Frontend:**
- `components/features/chat/chat-sidebar.tsx`: Main chat interface
- `components/features/chat/chat-input.tsx`: Message input with auto-resize
- `components/features/chat/chat-message.tsx`: Message display component
- `components/features/chat/chat-header.tsx`: Chat header UI
- `components/features/chat/bookmark-reference-card.tsx`: Bookmark reference cards in chat
- `components/features/chat/memory-panel.tsx`: User memory management panel

**Key Features:**
- Bookmark-aware AI responses via RAG
- User memory for personalized context
- Real-time chat with streaming support
- Project context awareness

### Added - Vector Embeddings & Semantic Search

**Backend:**
- `convex/embeddings.ts`: OpenAI integration for 1536-dim embeddings (text-embedding-3-small)
- `convex/bookmarks.ts`: Full CRUD operations with embedding support
- `convex/search.ts`: Vector search queries using Convex's built-in vector search
- Retry logic with exponential backoff for OpenAI rate limits (429 errors)

**Frontend:**
- `components/features/semantic-search.tsx`: Semantic search UI component
- `components/features/add-bookmark-example.tsx`: Example bookmark creation with auto-embedding
- `app/search-demo/page.tsx`: Demo page showing semantic search in action

**Configuration:**
- `.env.local`: Added OPENAI_API_KEY placeholder
- `.env.example`: Environment variable template
- `package.json`: Added `openai` and `tiktoken` dependencies

**Documentation:**
- `VECTOR_SEARCH_SETUP.md`: Complete setup and usage guide

**Key Features:**
- Async embedding generation (non-blocking bookmark creation)
- Semantic search across bookmarks by userId/projectId/folderId
- Batch embedding generation for existing bookmarks
- Graceful error handling (bookmark saves even if embedding fails)
- Cost-effective (~$0.000002 per bookmark)

### Added - Project & Folder Organization System

**Backend (Convex):**
- `convex/projects.ts`: CRUD operations, default project management, validation
- `convex/folders.ts`: Nested folder operations, circular reference prevention, tree building
- `convex/init.ts`: User initialization mutation
- Updated schema with indexes for efficient queries

**Frontend Components:**
- `ProjectSwitcher`: Dropdown for switching/creating projects
- `FolderTree` + `FolderTreeItem`: Recursive folder tree with expand/collapse
- `NewProjectDialog` + `NewFolderDialog`: Creation dialogs with validation
- `/bookmarks` route with custom sidebar layout
- Added dialog component from shadcn/ui

**Key Features:**
- Full hierarchical bookmark organization
- Projects table with default project support
- Folders table with nested structure (max 5 levels deep)
- Auto-initialization: Default "Main" project + "Uncategorized" folder on first login
- Defense-in-depth: 5-level UI limit, 50-depth circular reference checks, 100-depth breadcrumb safeguard

### Quality & Performance Improvements

- **Type Safety**: Replaced all `any` types with proper Convex types (QueryCtx, MutationCtx, Doc<T>)
- **Cycle Detection**: Added layered guards to prevent infinite loops in folder hierarchy traversal
  - getFolderDepth: Iterative with visited set (primary 5-level enforcement)
  - wouldCreateCircularReference: 50-depth technical limit + cycle detection (10x safety buffer)
  - getFolderPath: 100-depth safeguard for breadcrumb traversal
  - getSubtreeDepth: Recursive depth parameter
- **Performance**: Parallelized delete operations, added compound indexes
  - `by_user_name` on projects for efficient duplicate checks
  - `by_project_parent` on folders for sibling queries
  - Parallel deletes in deleteProject (bookmarks + folders)
- **TOCTOU Fixes**: Replaced full-table scans with targeted index queries
- **UX**: RenameFolderDialog component with validation
- **Default Project Deletion**: Auto-promotes fallback project instead of blocking

### Important Notes

- **Setup Required**: Run `npx convex dev` to deploy schema and generate types
- **OpenAI API Key**: Must be configured in `.env.local` (dev) and Convex dashboard (prod)
- All operations secured with row-level filtering by userId
- Real-time updates via Convex subscriptions (automatic)
- **Depth Limits**: 5-level user-facing limit with layered safeguards (50/100-depth technical limits)
