# Plan: UI Build Phase

## Status: Not Started

## Overview
Build all frontend UI components for the PRD generation wizard flow. This plan assumes Plans 1-2 (Schema/Dashboard, App Input) are complete.

## Design Direction: Technical Editorial

**Concept**: Treat each PRD like a beautifully typeset architectural specification. The interface feels like a premium design publication crossed with engineering precision—sophisticated but purposeful, refined but technical.

**Tone**: Confident, precise, unhurried. This is a tool for people who want to think deeply before building.

**What makes it unforgettable**: The contrast between editorial elegance and technical precision. Refined typography meets monospace accents. Generous whitespace meets dot-grid textures. Every element says "we take planning seriously."

---

## Design System

### Typography

**Display Font**: `Fraunces` (variable, optical sizing)
- Headings, hero text, section titles
- Use optical sizing: `font-optical-sizing: auto`
- Slightly condensed tracking on large sizes: `tracking-tight`

**Body Font**: `Söhne` or fallback to `system-ui`
- Clean, readable, professional
- 16px base, 1.6 line-height for long text

**Technical Font**: `JetBrains Mono`
- Code snippets, tech stack names, status labels
- Category badges, step numbers, timestamps
- Creates visual "technical" moments throughout

```css
/* Font setup in globals.css */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Söhne', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Color Palette

**Primary**: Deep slate/navy instead of generic blue
```css
:root {
  --color-ink: #1a1f2e;           /* Primary text, buttons */
  --color-ink-light: #3d4559;     /* Secondary text */
  --color-ink-muted: #6b7280;     /* Muted text */

  --color-paper: #fafaf9;         /* Background */
  --color-paper-warm: #f5f4f0;    /* Cards, sections */
  --color-paper-dark: #e8e6e1;    /* Borders, dividers */

  --color-accent: #c9a227;        /* Gold/amber - CTAs, highlights */
  --color-accent-muted: #d4b85a;  /* Hover states */

  --color-success: #2d6a4f;       /* Deep forest green */
  --color-warning: #b45309;       /* Burnt orange */
  --color-critical: #9f1239;      /* Deep rose */

  --color-info: #1e40af;          /* Deep blue for info */
}
```

**Dark mode**: Invert with warm dark background (#1a1918), cream text (#f5f4f0)

### Texture & Atmosphere

**Dot grid pattern**: Subtle planning/graph paper feel
```css
.bg-dotgrid {
  background-image: radial-gradient(#d4d4d4 1px, transparent 1px);
  background-size: 20px 20px;
}
```

**Noise texture**: Very subtle grain overlay for warmth
```css
.texture-grain {
  position: relative;
}
.texture-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.svg');
  opacity: 0.03;
  pointer-events: none;
}
```

### Motion Principles

1. **Orchestrated entrances**: Staggered reveals on page load (not random)
2. **Typewriter effect**: For AI generation status messages
3. **Smooth morphs**: Progress indicators that transform, not jump
4. **Meaningful hover**: Cards lift with shadow, buttons pulse subtly
5. **Exit animations**: Elements fade/slide out before new ones enter

```css
/* Base transition */
.transition-default {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Stagger children */
.stagger-children > * {
  animation: fadeInUp 500ms ease-out both;
}
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 75ms; }
.stagger-children > *:nth-child(3) { animation-delay: 150ms; }
/* ... continue */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Implementation Phases

### Phase 1: Design Foundation

#### 1.0 Global Styles & Tokens
```typescript
// Update globals.css and tailwind.config
- Import fonts (Fraunces, JetBrains Mono)
- Define CSS custom properties
- Add texture utilities (bg-dotgrid, texture-grain)
- Add animation keyframes
- Define component base styles
```

#### 1.1 Progress Indicator
```typescript
// components/features/progress/progress-indicator.tsx

Visual Design:
- Horizontal timeline with numbered circles
- Numbers in JetBrains Mono, bold
- Completed steps: filled ink circle with check
- Current step: gold accent ring, pulsing subtly
- Pending steps: hollow circle, muted
- Connecting lines: dotted, not solid (blueprint feel)
- Step labels below in small caps

Layout:
- Desktop: horizontal, full width
- Mobile: vertical, left-aligned
- Generous spacing between steps

Animation:
- Progress line fills as steps complete
- Current step has subtle pulse animation
- Numbers morph smoothly on state change
```

#### 1.2 Generation Status Display
```typescript
// components/features/progress/generation-status.tsx

Visual Design:
- Centered, minimal container
- Large status message in Fraunces italic
- Typewriter animation for message text
- Custom loading indicator: three dots that morph into a line
- Progress bar: thin, gold accent color
- Estimated time in monospace, small

Animation:
- Message types out letter by letter
- Progress bar has subtle shimmer effect
- Dots pulse in sequence (not sync)

States:
- Generating: animated dots + typewriter message
- Complete: checkmark morphs from dots
- Error: X with shake animation
```

#### 1.3 Step Navigation
```typescript
// components/features/progress/step-navigation.tsx

Visual Design:
- Back: text button with arrow, muted color
- Next/Submit: solid button, gold accent background
- Buttons have subtle shadow that lifts on hover
- Loading state: button text fades, spinner appears

Layout:
- Fixed to bottom on mobile (sticky footer)
- Right-aligned on desktop
- Back on left, Next on right

Animation:
- Hover: lift with shadow increase
- Click: press down (scale 0.98)
- Loading: spinner fades in, text fades out
```

#### 1.4 Page Layout Shell
```typescript
// components/features/project/project-layout.tsx

Visual Design:
- Max-width container with generous padding
- Subtle dot-grid background
- Header: project name (Fraunces), step indicator
- Back link with arrow, top-left
- Content area with paper-warm background

Layout:
- Desktop: centered, max-w-3xl
- PRD page: two-column (nav + content)
- Mobile: full-width with safe padding
```

---

### Phase 2: Questions Page

#### 2.1 Questions Loader
```typescript
// components/features/questions/questions-loader.tsx

Visual Design:
- Three skeleton cards with shimmer
- Status message center below (typewriter)
- Subtle floating animation on skeletons

Animation:
- Cards fade in staggered
- Shimmer effect across each
- Message types out with blinking cursor
```

#### 2.2 Question Card
```typescript
// components/features/questions/question-card.tsx

Visual Design:
- Paper-warm background, subtle border
- Category badge: monospace, uppercase, small
  - Features: ink background
  - Scale: info blue
  - Audience: success green
  - Technical: accent gold
- Question text: Fraunces, 20px, 1.4 line-height
- Options: radio circles with custom styling
  - Unselected: hollow circle, ink border
  - Selected: filled gold circle with check
  - Hover: circle fills with muted gold
- Default option has small "(recommended)" label in monospace

Layout:
- Full-width card
- Category badge top-left
- Question centered or left-aligned
- Options in vertical stack
- "Other" input appears on select with slide-down

Animation:
- Card lifts slightly on hover
- Selection: circle fills with spring animation
- "Other" input slides down smoothly
```

#### 2.3 Questions Form
```typescript
// components/features/questions/questions-form.tsx

Visual Design:
- Vertical stack of question cards
- Progress: "3 of 5" in monospace, top-right
- "Use defaults" link: text button, muted
- Section dividers between cards (thin dotted line)

Layout:
- Cards have generous vertical spacing (space-y-8)
- Submit button full-width on mobile
- Desktop: right-aligned submit

Animation:
- Cards stagger in on load
- Answered cards have subtle checkmark appear
```

#### 2.4 Questions Page
```typescript
// app/(protected)/project/[projectId]/questions/page.tsx

Flow:
1. Mount → check if questions exist
2. If not, show loader + trigger generation
3. When ready, fade in form with staggered cards
4. Submit → loading state → navigate with exit animation
```

---

### Phase 3: Tech Stack Page

#### 3.1 Research Loader
```typescript
// components/features/tech-stack/research-loader.tsx

Visual Design:
- Vertical timeline of research steps
- Each step: dot + label + status
- Current step: gold dot, pulsing
- Completed: checkmark replaces dot
- Pending: hollow dot

Animation:
- Timeline draws down as steps complete
- Dots transform into checkmarks
- Labels fade in as steps begin
- Shimmer on current step
```

#### 3.2 Tech Category Card
```typescript
// components/features/tech-stack/tech-category-card.tsx

Visual Design:
- Category name: monospace, uppercase, letter-spaced
- Technology name: Fraunces, large (24px)
- Reasoning: body text, 2-3 lines max
- Expandable sections:
  - "Why this works" (pros): success green bullets
  - "Consider" (cons): warning orange bullets
- "Change" button: text button, right-aligned

Layout:
- Card with generous padding
- Logo/icon left of tech name (if available)
- Pros/cons in two columns on desktop
- Change button bottom-right

Animation:
- Expand/collapse: smooth height transition
- Hover: subtle lift
- Change button: underline slides in on hover
```

#### 3.3 Alternatives Dialog
```typescript
// components/features/tech-stack/alternatives-dialog.tsx

Visual Design:
- Modal with paper-warm background
- Title: "Alternative for [Category]" in Fraunces
- Options as horizontal cards (or vertical on mobile)
- Each option:
  - Tech name in monospace
  - Key differentiator
  - "Select" button
- Compatibility warnings in warning color

Animation:
- Modal fades in, content slides up
- Options stagger in
- Selected option: gold border appears
```

#### 3.4 Tech Stack Summary
```typescript
// components/features/tech-stack/tech-stack-summary.tsx

Visual Design:
- Grid of tech selections (2x3 on desktop)
- Each cell: category (mono, small) + tech name
- Subtle connecting lines between related items
- "Confirm" CTA: large, gold, centered below

Layout:
- Visual diagram/flowchart feel
- Shows relationships (Frontend → Backend → Database)

Animation:
- Grid draws in with connections
- Hover on cell highlights related items
```

---

### Phase 4: Validation Page

#### 4.1 Validation Loader
```typescript
// components/features/validation/validation-loader.tsx

Visual Design:
- Circular progress indicator (not bar)
- Center: percentage in large monospace
- Ring fills with gold as progress increases
- Status message below (typewriter)

Animation:
- Ring fills smoothly
- Percentage counts up
- Checkmark appears in center when complete
```

#### 4.2 Validation Status Banner
```typescript
// components/features/validation/validation-status.tsx

Visual Design:
- Full-width banner at top
- Approved: success green background, check icon
- Warnings: warning orange background, alert icon
- Critical: critical rose background, X icon
- Large status text: Fraunces
- Summary below in body text
- Issue counts in monospace badges

Animation:
- Banner slides down from top
- Icon has subtle bounce on appear
- Success: confetti particles (subtle, few)
```

#### 4.3 Issue Card
```typescript
// components/features/validation/issue-card.tsx

Visual Design:
- Left border color indicates severity
- Severity badge: monospace, uppercase
- Component tag: pill shape, muted background
- Issue title: semibold
- Recommendation: indented, muted text
- Expandable "Details" section

Layout:
- Compact by default
- Expand to show full recommendation
- Actions (if any) at bottom-right

Animation:
- Slide in from left (staggered)
- Expand/collapse smooth
```

#### 4.4 Validation Actions
```typescript
// components/features/validation/validation-actions.tsx

Visual Design:
- Approved: single "Generate PRD" button (gold, large)
- Warnings: checkbox acknowledgment + proceed button
  - Checkbox: custom styled, gold when checked
  - "I understand the warnings" label
- Critical: "Modify Stack" button only (outline style)

Animation:
- Buttons fade in after banner
- Checkbox: checkmark draws in when clicked
```

---

### Phase 5: PRD Page

#### 5.1 PRD Loader
```typescript
// components/features/prd/prd-loader.tsx

Visual Design:
- Document skeleton: looks like PRD structure
- Animated typing lines in each section
- Section headers visible, content shimmers
- Progress bar at bottom: thin, gold

Animation:
- Sections reveal top-to-bottom
- Typing lines animate sequentially
- "Materializing" effect as content appears
```

#### 5.2 PRD Navigation Sidebar
```typescript
// components/features/prd/prd-navigation.tsx

Visual Design:
- Sticky sidebar, left side
- Section numbers: monospace, muted
- Section names: body font
- Current section: ink color, dot indicator
- Hover: underline slides in
- Subtle dotted line connecting items

Layout:
- Desktop: fixed sidebar
- Mobile: horizontal scrolling tabs at top

Animation:
- Current indicator slides between items
- Smooth scroll on click
```

#### 5.3 PRD Section Components
```typescript
// components/features/prd/sections/*.tsx

Visual Design:
- Section number: large, monospace, muted (like "01")
- Section title: Fraunces, 28px
- Content: well-formatted, generous line-height
- Lists: custom bullets (squares or dashes)
- Code/tech terms: monospace, muted background
- Copy button: appears on hover, top-right

Specific sections:
- User Personas: cards with name, description
- Features: cards with priority badges
- Architecture: diagram-like presentation
- Data Models: table or structured list

Animation:
- Sections fade in as scrolled into view
- Copy button: checkmark replaces icon briefly
```

#### 5.4 PRD Viewer
```typescript
// components/features/prd/prd-viewer.tsx

Visual Design:
- Two-column layout: nav (240px) + content
- Content area: paper-warm, document-like
- Subtle page shadow for depth
- Print button reveals print-optimized styles

Layout:
- Full-height layout
- Content scrolls, nav sticky
- Mobile: single column, nav becomes tabs
```

#### 5.5 PRD Actions Bar
```typescript
// components/features/prd/prd-actions.tsx

Visual Design:
- Floating bar, bottom-right (or top-right)
- Semi-transparent background with blur
- Icon buttons: Export, Share, Download All
- Tooltips on hover

Animation:
- Bar slides in after PRD loads
- Buttons have hover lift
- Dropdown menus fade in
```

---

### Phase 6: Export & Sharing

#### 6.1 Export Dropdown
```typescript
// components/features/prd/export-dropdown.tsx

Visual Design:
- Dropdown with paper background
- Options: icon + format name + file size estimate
- Loading: spinner replaces icon
- Success: checkmark + "Downloaded"

Animation:
- Dropdown fades down
- Items stagger in
- Loading spinner smooth rotation
```

#### 6.2 Share Dialog
```typescript
// components/features/prd/share-dialog.tsx

Visual Design:
- Modal with generous padding
- "Share your PRD" title in Fraunces
- Generated URL in monospace, truncated
- Copy button: prominent, gold
- Expiration: "Expires in 7 days" with date
- Revoke: text button, warning color

Animation:
- URL types out when generated
- Copy: button transforms to "Copied!"
```

#### 6.3 Share Page (Public)
```typescript
// app/share/[token]/page.tsx

Visual Design:
- Minimal branding header: "Just Start" logo
- PRD viewer (read-only, no actions)
- Footer CTA: "Create your own PRD →"
- Expired state: large message, CTA to homepage

Layout:
- Centered, slightly narrower than auth'd view
- Clean, no navigation distractions
```

---

### Phase 7: Dashboard

#### 7.1 Project Card
```typescript
// components/features/project/project-card.tsx

Visual Design:
- Paper-warm card with subtle shadow
- Project name: Fraunces, truncated
- Description: 2 lines max, muted
- Status: pill badge with status color
- Progress: small step indicator
- "Continue" button: gold, right side
- Delete: icon button, appears on hover
- Timestamp: monospace, small

Layout:
- Grid of cards (2 col desktop, 1 col mobile)
- Cards have consistent height

Animation:
- Hover: lift with shadow
- Delete icon fades in
- Cards stagger in on load
```

#### 7.2 Empty Dashboard
```typescript
// components/features/project/empty-dashboard.tsx

Visual Design:
- Centered content
- Large illustration: minimal line drawing (compass, blueprint)
- Welcome message: Fraunces, warm
- "Start your first project" CTA: gold, large
- Brief value props below (3 icons + text)

Animation:
- Illustration draws in (SVG line animation)
- Text fades up
- CTA pulses subtly
```

#### 7.3 Dashboard Header
```typescript
// components/features/project/dashboard-header.tsx

Visual Design:
- "Your Projects" title: Fraunces
- Stats inline: "3 PRDs generated" in monospace
- "New Project" button: gold, right-aligned

Layout:
- Full width, space-between
- Stats wrap on mobile
```

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

## Testing Checklist

### Visual Quality
- [ ] Typography hierarchy is clear and beautiful
- [ ] Colors create appropriate mood/contrast
- [ ] Spacing feels generous and intentional
- [ ] Animations are smooth, not jarring
- [ ] Dark mode maintains character
- [ ] Print styles work for PRD

### Functionality
(Same as before - all pages load, forms work, etc.)

---

## Estimated Effort

| Phase | Focus | Effort |
|-------|-------|--------|
| Phase 1 | Foundation + Progress | 4-5 hours |
| Phase 2 | Questions UI | 4-5 hours |
| Phase 3 | Tech Stack UI | 5-6 hours |
| Phase 4 | Validation UI | 3-4 hours |
| Phase 5 | PRD Viewer | 6-7 hours |
| Phase 6 | Export/Sharing | 3-4 hours |
| Phase 7 | Dashboard | 3-4 hours |

**Total: ~28-35 hours**

---

## Design Principles Checklist

Before marking any component complete, verify:

- [ ] **Typography**: Uses Fraunces for display, JetBrains Mono for technical elements
- [ ] **Color**: Uses ink/paper/accent palette, not generic blue/gray
- [ ] **Texture**: Has appropriate dot-grid or grain texture where fitting
- [ ] **Motion**: Has intentional entrance animation, meaningful hover states
- [ ] **Hierarchy**: Clear visual priority, nothing fights for attention
- [ ] **Character**: Feels like "Just Start", not generic SaaS
