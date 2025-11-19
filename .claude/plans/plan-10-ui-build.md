# Plan: UI Build Phase

## Status: Not Started

## Overview
Build all frontend UI components for the PRD generation wizard flow. This plan assumes Plans 1-2 (Schema/Dashboard, App Input) are complete and focuses on implementing the visual interface for Plans 3-8.

## Prerequisites
- Plans 01-02 completed (schema, dashboard, new project page)
- Build passes with no errors
- Basic project structure in place

## Implementation Order

### Phase 1: Shared Components & Layout

#### 1.1 Progress Indicator
```typescript
// components/features/progress/progress-indicator.tsx
- 5-step horizontal stepper
- Visual states: completed (check), current (active), pending (gray)
- Step labels: Description, Questions, Tech Stack, Validation, PRD
- Clickable for completed steps (jump back)
- Responsive: horizontal on desktop, vertical on mobile
```

#### 1.2 Generation Status Display
```typescript
// components/features/progress/generation-status.tsx
- Animated loading spinner
- Stage message (e.g., "Analyzing your description...")
- Progress bar with percentage
- Estimated time remaining
- Uses Convex real-time subscription
```

#### 1.3 Step Navigation
```typescript
// components/features/progress/step-navigation.tsx
- Back/Next buttons
- Disabled states based on validation
- Loading state during submission
- Keyboard shortcuts (Cmd+Enter to submit)
```

#### 1.4 Page Header
```typescript
// components/features/project/page-header.tsx
- Project name display
- Current step indicator
- Back to dashboard link
- Optional action buttons
```

### Phase 2: Questions Page (Plan 03 UI)

#### 2.1 Questions Loader
```typescript
// components/features/questions/questions-loader.tsx
- Skeleton cards while generating
- Animated status messages:
  - "Analyzing your description..."
  - "Identifying key areas..."
  - "Generating questions..."
- Estimated: 5-10 seconds
```

#### 2.2 Question Card
```typescript
// components/features/questions/question-card.tsx
- Category badge (Features, Scale, Audience, etc.)
- Question text (large, readable)
- Radio group for options
- Selected state highlighting
- "Other" option with text input
- Default option indicator
```

#### 2.3 Questions Form
```typescript
// components/features/questions/questions-form.tsx
- All question cards in vertical stack
- Progress counter: "3 of 5 answered"
- "Use all defaults" quick action
- Form validation
- Submit button with loading state
```

#### 2.4 Questions Page
```typescript
// app/(protected)/project/[projectId]/questions/page.tsx
- Fetch questions via useQuery
- Show loader if generating
- Display form when ready
- Handle submission
- Navigate to tech-stack on complete
```

### Phase 3: Tech Stack Page (Plan 04 UI)

#### 3.1 Research Loader
```typescript
// components/features/tech-stack/research-loader.tsx
- Multi-step progress:
  - "Researching frontend frameworks..."
  - "Analyzing backend options..."
  - "Comparing databases..."
  - "Finding auth solutions..."
  - "Generating recommendations..."
- Estimated: 15-20 seconds
```

#### 3.2 Tech Category Card
```typescript
// components/features/tech-stack/tech-category-card.tsx
- Category header (Frontend, Backend, etc.)
- Selected technology with logo/icon
- Reasoning paragraph
- Expandable pros/cons lists
- Color-coded: pros (green), cons (amber)
- "Change" button to see alternatives
```

#### 3.3 Alternatives Dialog
```typescript
// components/features/tech-stack/alternatives-dialog.tsx
- Modal with alternative options
- Side-by-side comparison view
- Key differences highlighted
- Select button for each
- Compatibility warnings if applicable
```

#### 3.4 Tech Stack Summary
```typescript
// components/features/tech-stack/tech-stack-summary.tsx
- Visual grid of all selections
- Category icons
- Selected technology names
- "Confirm Stack" CTA
- "Edit" to go back to cards
```

#### 3.5 Additional Tools Section
```typescript
// components/features/tech-stack/additional-tools.tsx
- Recommended tools list (monitoring, email, etc.)
- Simple cards with name, purpose
- Optional toggle to include/exclude
```

#### 3.6 Tech Stack Page
```typescript
// app/(protected)/project/[projectId]/tech-stack/page.tsx
- Show loader during research
- Display recommendations
- Handle stack modifications
- Confirm and navigate to validation
```

### Phase 4: Validation Page (Plan 05 UI)

#### 4.1 Validation Loader
```typescript
// components/features/validation/validation-loader.tsx
- Progress steps:
  - "Checking version compatibility..."
  - "Verifying integrations..."
  - "Analyzing production readiness..."
  - "Generating report..."
- Estimated: 10-15 seconds
```

#### 4.2 Validation Status Banner
```typescript
// components/features/validation/validation-status.tsx
- Large status indicator:
  - Approved: green check, "Ready to generate PRD"
  - Warnings: amber warning, "X warnings found"
  - Critical: red X, "Critical issues detected"
- Summary paragraph
- Issue count by severity
```

#### 4.3 Issue Card
```typescript
// components/features/validation/issue-card.tsx
- Severity badge (info/warning/critical)
- Component tag (e.g., "Frontend")
- Issue title and description
- Recommendation text
- Expandable for details
```

#### 4.4 Issues List
```typescript
// components/features/validation/issues-list.tsx
- Grouped by severity
- Collapsible sections
- Empty state for no issues
```

#### 4.5 Validation Actions
```typescript
// components/features/validation/validation-actions.tsx
- Approved: "Generate PRD" button
- Warnings: "Proceed anyway" + "Modify Stack"
- Critical: "Modify Stack" only
- Acknowledgment checkbox for warnings
```

#### 4.6 Validation Page
```typescript
// app/(protected)/project/[projectId]/validation/page.tsx
- Run validation on mount
- Display results
- Handle user actions
- Navigate based on decision
```

### Phase 5: PRD Page (Plan 06 UI)

#### 5.1 PRD Loader
```typescript
// components/features/prd/prd-loader.tsx
- Extended progress display:
  - "Compiling project requirements..." (10%)
  - "Defining user personas..." (30%)
  - "Structuring architecture..." (50%)
  - "Writing feature specs..." (70%)
  - "Finalizing document..." (90%)
- Progress bar
- Estimated: 30-60 seconds
```

#### 5.2 PRD Navigation Sidebar
```typescript
// components/features/prd/prd-navigation.tsx
- Table of contents
- Section links:
  - Project Overview
  - Purpose & Goals
  - User Personas
  - Tech Stack
  - MVP Features
  - Nice-to-Have
  - Architecture
  - UI/UX
- Current section indicator
- Sticky on scroll
```

#### 5.3 PRD Section Components
```typescript
// components/features/prd/sections/
- project-overview.tsx
- purpose-goals.tsx
- user-personas.tsx
- tech-stack-details.tsx
- features-list.tsx
- architecture.tsx
- ui-ux.tsx

Each section:
- Formatted content display
- Copy section button
- Expandable/collapsible
```

#### 5.4 PRD Viewer
```typescript
// components/features/prd/prd-viewer.tsx
- Two-column layout: nav + content
- Smooth scroll between sections
- Print-friendly styles
- Responsive: single column on mobile
```

#### 5.5 PRD Actions Bar
```typescript
// components/features/prd/prd-actions.tsx
- Fixed at top or bottom
- Export dropdown
- Share button
- Download all button
- Edit/Regenerate option
```

#### 5.6 PRD Page
```typescript
// app/(protected)/project/[projectId]/prd/page.tsx
- Generate PRD on mount (if not exists)
- Display viewer when ready
- Handle export/share actions
```

### Phase 6: Export & Sharing UI (Plan 07 UI)

#### 6.1 Export Dropdown
```typescript
// components/features/prd/export-dropdown.tsx
- Dropdown menu
- Options:
  - JSON (with file icon)
  - Markdown (with file icon)
  - PDF (with file icon)
- Loading indicator per format
- Success toast on download
```

#### 6.2 Share Dialog
```typescript
// components/features/prd/share-dialog.tsx
- Modal dialog
- "Generate Link" button
- Display generated URL
- Copy button with feedback
- Expiration date display
- "Revoke Link" option
```

#### 6.3 Copy Button
```typescript
// components/ui/copy-button.tsx
- Click to copy
- "Copied!" feedback (2s)
- Returns to "Copy" state
- Works with any text
```

#### 6.4 Share Page (Public)
```typescript
// app/share/[token]/page.tsx
- Public route (no auth required)
- Fetch shared PRD
- Display read-only view
- "Just Start" branding
- "Create Your Own PRD" CTA
- Handle expired/invalid links
```

#### 6.5 Shared PRD View
```typescript
// components/features/prd/shared-prd-view.tsx
- Read-only PRD display
- No export options
- Branding header
- CTA to sign up
```

### Phase 7: Dashboard Enhancements

#### 7.1 Project Card
```typescript
// components/features/project/project-card.tsx
- Project name and description preview
- Status badge with color
- Progress indicator (Step X of 5)
- Last accessed timestamp
- "Continue" button
- Delete option with confirmation
```

#### 7.2 Empty Dashboard
```typescript
// components/features/project/empty-dashboard.tsx
- Friendly illustration/icon
- Welcome message
- "Start Your First Project" CTA
- Brief feature highlights
```

#### 7.3 Dashboard Stats
```typescript
// components/features/project/dashboard-stats.tsx
- Total PRDs generated
- Projects in progress
- Completed projects
- Optional: usage/credits display
```

## Styling Guidelines

### Colors
- Primary: Blue for CTAs
- Success: Green for approved/completed
- Warning: Amber for warnings
- Error: Red for critical/errors
- Muted: Gray for disabled/secondary

### Typography
- Headings: font-semibold, tracking-tight
- Body: text-sm or text-base
- Labels: text-xs, text-muted-foreground
- Code: font-mono, bg-muted

### Spacing
- Cards: p-4 or p-6
- Sections: space-y-4 or space-y-6
- Inline elements: gap-2 or gap-3

### Animations
- Transitions: 200ms ease
- Loading: animate-pulse or animate-spin
- Hover: subtle scale or background change

## Component Dependencies

```json
{
  "required": [
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-progress",
    "@radix-ui/react-radio-group",
    "@radix-ui/react-tabs",
    "@radix-ui/react-collapsible"
  ],
  "icons": "lucide-react",
  "forms": ["react-hook-form", "@hookform/resolvers", "zod"]
}
```

## Testing Checklist

### General
- [ ] All pages load without errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states display correctly
- [ ] Error states handled gracefully
- [ ] Keyboard navigation works
- [ ] Focus states visible

### Questions Page
- [ ] Loader shows during generation
- [ ] Questions display correctly
- [ ] Can select options
- [ ] Can enter custom "Other" values
- [ ] Form validates before submit
- [ ] Submits and navigates correctly

### Tech Stack Page
- [ ] Loader shows during research
- [ ] Recommendations display
- [ ] Can expand pros/cons
- [ ] Can change selections
- [ ] Alternatives dialog works
- [ ] Confirmation saves and navigates

### Validation Page
- [ ] Loader shows during validation
- [ ] Status banner displays correctly
- [ ] Issues grouped by severity
- [ ] Actions work based on status
- [ ] Can go back to modify stack

### PRD Page
- [ ] Loader shows during generation
- [ ] Navigation sidebar works
- [ ] All sections display
- [ ] Copy section works
- [ ] Export formats download correctly
- [ ] Share link generates and copies

### Dashboard
- [ ] Projects list correctly
- [ ] Status badges accurate
- [ ] Continue buttons navigate correctly
- [ ] Delete works with confirmation
- [ ] Empty state shows for new users

## Estimated Effort

| Phase | Components | Effort |
|-------|------------|--------|
| Phase 1: Shared | 4 components | 2-3 hours |
| Phase 2: Questions | 4 components | 3-4 hours |
| Phase 3: Tech Stack | 6 components | 4-5 hours |
| Phase 4: Validation | 6 components | 3-4 hours |
| Phase 5: PRD | 6 components | 5-6 hours |
| Phase 6: Export/Share | 5 components | 3-4 hours |
| Phase 7: Dashboard | 3 components | 2-3 hours |

**Total: ~22-29 hours**

## Notes

- Build components in order (phases depend on earlier ones)
- Test each phase before moving to next
- Use shadcn/ui primitives where possible
- Follow docs/component-patterns.md and docs/styling-guide.md
- Commit after each component/page completion
