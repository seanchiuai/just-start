# Changelog

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
