# CLAUDE.md

## Workflow

Check `PRD.json` for product requirements → `.claude/skills/` → `.claude/agents/` → `.claude/plans/`.

**Agents:** clerk (auth), convex (backend), deployment (Vercel), nextjs (frontend), anthropic (AI), perplexity (research)

## Stack & Patterns

Next.js 15 • Tailwind 4 + shadcn/ui • Clerk → JWT → Convex • TypeScript strict • `@/*` imports • Claude + Perplexity AI

Auth: `ConvexProviderWithClerk` | Schema: `convex/schema.ts` | Protection: `middleware.ts`

**Clerk+Convex:** Create "convex" JWT in Clerk → set `CLERK_JWT_ISSUER_DOMAIN` → config `convex/auth.config.ts`

**AI Integration:** `convex/ai/claude.ts` (questions, recommendations, validation, PRD) | `convex/ai/perplexity.ts` (tech research)

## Structure

```plaintext
/app/(auth|protected)    - Auth and protected routes
/app/share/[token]       - Public share pages
/components/features/    - Feature modules (prd/, questions/, tech-stack/, validation/, progress/, project/, landing/)
/components/ui/          - Base UI (includes query-loader.tsx for loading states)
/convex                  - Backend (ai/, schema, queries, mutations, actions)
/convex/ai/              - AI wrappers (claude.ts, perplexity.ts)
/lib/types/              - Shared types (prd.ts has all PRD-related types)
/docs                    - All docs here, CHANGELOG.md for critical notes
/.claude/plans/          - Implementation plans (01-10)
```

## Key Files

**AI Integration:**

- `convex/prd.ts` - PRD queries/mutations (export, share, get)
- `convex/prd.actions.ts` - Node.js actions (generate, exportJSON, exportMarkdown)
- `convex/questions.ts` - AI question generation
- `convex/techStack.ts` - Tech research & recommendations
- `convex/compatibility.ts` - Validation checks

**Shared Types:** `lib/types/prd.ts` - All PRD types, status enums, color mappings

**Loading States:** `components/ui/query-loader.tsx` - Standardized loading skeletons

## Reference Docs (Read for Specific Tasks)

**Creating/modifying pages or routes:**

- Read `docs/frontend-architecture.md` - App Router structure, routing patterns, file locations

**Creating/modifying components:**

- Read `docs/component-patterns.md` - Component structure, props, hooks, patterns
- Read `docs/icon-usage.md` - Icon selection, sizing, colors from lucide-react

**Styling components:**

- Read `docs/styling-guide.md` - Tailwind 4 colors, spacing, animations, responsive patterns

**Convex queries/mutations:**

- Read `docs/convex-patterns.md` - Schema, auth, queries, mutations, security patterns

**Creating/modifying API routes:**

- Read `docs/api-routes-guide.md` - Route structure, AI integration, validation, error handling

**Managing state:**

- Read `docs/state-management.md` - Local state, Convex, Context, localStorage patterns

**TypeScript types/interfaces:**

- Read `docs/type-definitions.md` - Type patterns, interfaces, generics, Convex types

**Always update docs/** when making significant changes. Update the above files in the `docs/` folder when patterns, APIs, or architecture changes significantly.

## Rules

**TS:** Strict, no `any`, `@/*` imports | **React:** Functional, `"use client"`, Convex hooks, <200 LOC | **Style:** Tailwind, mobile-first | **Security:** OWASP Top 10, row-level filter, secrets in `.env.local` | **Quality:** >80% coverage, lint clean, build pass

**Convex:** Follow `docs/convex-patterns.md` exactly | Separate Node.js actions (API calls) from Convex runtime | **Env:** Get key from user → add to `.env.local` | **Impl:** UI first → functionality. Modular code.

**Security:** Use `crypto.randomBytes()` for tokens, verify ownership on exports, auth on all public queries

**Pre-commit:** Build + tests + lint, >80% coverage, no vulnerabilities

## Recent Updates (2025-11-19)

**Plans 01-10 Complete:**

- Schema & dashboard, app input, AI questions, tech stack research, validation, PRD generation, export/sharing, progress updates, landing page, UI build

**Backend AI (Plans 03-07):**

- Claude for questions/recommendations/validation/PRD generation
- Perplexity for tech stack research only
- Retry logic with exponential backoff
- Real-time progress status updates

**UI Build (Plan 10):**

- Technical Editorial design system in `globals.css`
- Feature components: prd/, questions/, tech-stack/, validation/, progress/, project/
- Landing page components in `landing/`
- Share page at `/app/share/[token]/page.tsx`

**Mock Data Removed:** All `lib/mocks/` deleted, pages use Convex queries/mutations

## Important Notes

- Never add backwards compatibility
- Always sacrifice grammar for the sake of conciseness in your responses
- **MANDATORY:** Git commit after every change (small, medium, or big). No exceptions. Commit immediately after completing any change, fix, or update.
- Always constantly update /docs/CHANGELOG.md after pulling in new commits or making new commits. Keep logs concise. Only log information critical information my engineers need to know.
- When a plan finishes executing, update the plan folder itself (`.claude/plans/`) in addition to /docs/CHANGELOG.md
- Run `npx convex dev` after pulling to regenerate types
