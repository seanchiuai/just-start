# Plan Execution Flow

## Current Status
- **Plans 01-02: COMPLETED** (not tested)
- Plans 03-09: Not started
- Plan 10 (UI): Not started

## Dependency Graph

```text
                              ┌─────────────────────────────────┐
                              │  COMPLETED: Plans 01-02         │
                              │  (Schema, Dashboard, Input)     │
                              └───────────────┬─────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
           ┌────────────────┐      ┌──────────────────┐      ┌──────────────────┐
           │  Plan 10: UI   │      │ Plans 03-07:     │      │ Plan 09:         │
           │  (with mocks)  │      │ Backend/AI       │      │ Landing Page     │
           │                │      │                  │      │                  │
           │  ┌──────────┐  │      │ 03 Questions     │      │ (Independent)    │
           │  │ Phase 1  │  │      │      ↓           │      └──────────────────┘
           │  │Foundation│  │      │ 04 Tech Stack    │
           │  └────┬─────┘  │      │      ↓           │
           │       │        │      │ 05 Validation    │
           │  ┌────┴────┐   │      │      ↓           │
           │  │ Tracks  │   │      │ 06 PRD Gen       │
           │  │ A-F     │   │      │      ↓           │
           │  │(parallel)│  │      │ 07 Export        │
           │  └────┬────┘   │      └────────┬─────────┘
           └───────┼────────┘               │
                   │                        │
                   └────────────┬───────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │  Phase 3: Integration │
                    │  (Connect UI to API)  │
                    └──────────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │  Plan 08: Progress   │
                    │  & Real-time         │
                    └──────────────────────┘
```

## Plan Dependencies

| Plan | Status | Depends On | Enables |
|------|--------|------------|---------|
| 01 Schema & Dashboard | ✅ Done | None | All plans |
| 02 App Input | ✅ Done | 01 | All plans |
| 03 AI Questions | Not started | 02 | 04 |
| 04 Tech Stack | Not started | 03 | 05 |
| 05 Validation | Not started | 04 | 06 |
| 06 PRD Generation | Not started | 05 | 07 |
| 07 Export & Sharing | Not started | 06 | Integration |
| 08 Progress & Real-time | Not started | Integration | None |
| 09 Landing Page | Not started | 01 | None |
| 10 UI Build | Not started | 01-02 | Integration |

## Parallel Execution Strategy

### Key Insight: Mock Data Approach
Plan 10 (UI) builds all components with TypeScript interfaces and mock data. No Convex queries until integration. This enables:
- UI and Backend development simultaneously
- Multiple UI tracks in parallel
- Clear component contracts

### Work Streams

**Stream 1: UI Development (Plan 10)**
- Phase 1: Foundation (blocking)
- Tracks A-F: All parallel after Phase 1
  - A: Questions UI
  - B: Tech Stack UI
  - C: Validation UI
  - D: PRD UI
  - E: Dashboard UI
  - F: Export/Share UI

**Stream 2: Backend/AI (Plans 03-07)**
- Sequential: 03 → 04 → 05 → 06 → 07
- Can run entirely parallel to UI stream

**Stream 3: Landing Page (Plan 09)**
- Fully independent
- Can start immediately

**Stream 4: Integration**
- After UI tracks + Backend complete
- Wire Convex queries to UI components

**Stream 5: Real-time (Plan 08)**
- After Integration complete
- Add progress subscriptions

## Engineer Allocation

### 2 Engineers

| Engineer | Stream | Plans/Tracks |
|----------|--------|--------------|
| A | UI + Integration | Plan 10 (all) → Integration |
| B | Backend + Landing | Plan 09 → Plans 03-07 → Plan 08 |

**Timeline**: ~35-40 hours elapsed

### 3 Engineers

| Engineer | Stream | Plans/Tracks |
|----------|--------|--------------|
| A | UI (Foundation + A,B,C) | Plan 10 Phase 1 → Tracks A,B,C |
| B | UI (D,E,F) + Integration | Tracks D,E,F → Integration → Plan 08 |
| C | Backend + Landing | Plan 09 → Plans 03-07 |

**Timeline**: ~20-25 hours elapsed

### 4 Engineers

| Engineer | Stream | Plans/Tracks |
|----------|--------|--------------|
| A | UI Foundation + Tracks A,B | Plan 10 Phase 1 → Tracks A,B |
| B | UI Tracks C,D | Tracks C,D |
| C | UI Tracks E,F + Integration | Tracks E,F → Integration → Plan 08 |
| D | Backend + Landing | Plan 09 → Plans 03-07 |

**Timeline**: ~12-15 hours elapsed

### 5+ Engineers

| Engineer | Stream | Plans/Tracks |
|----------|--------|--------------|
| A | UI Foundation | Plan 10 Phase 1 (blocks B,C,D) |
| B | UI Tracks A,B | Tracks A,B |
| C | UI Tracks C,D | Tracks C,D |
| D | UI Tracks E,F | Tracks E,F |
| E | Backend 03-05 | Plans 03,04,05 |
| F | Backend 06-07 + Landing | Plan 09 → Plans 06,07 |
| G | Integration + Real-time | Integration → Plan 08 |

**Timeline**: ~10-12 hours elapsed

## Critical Paths

### UI Critical Path
```
Phase 1 (4-5h) → Longest Track D (6-7h) → Integration (4-5h)
Total: ~15-17 hours
```

### Backend Critical Path
```
03 (4-5h) → 04 (5-6h) → 05 (3-4h) → 06 (5-6h) → 07 (3-4h)
Total: ~21-25 hours
```

**Overall Critical Path**: Backend (21-25h) + Integration (4-5h) = ~25-30 hours

## Recommended Execution Order

### Solo Developer
1. Plan 09 (Landing) - quick win, independent
2. Plan 10 Phase 1 (Foundation)
3. Plan 10 Tracks A-F (can interleave with backend)
4. Plans 03-07 (Backend)
5. Integration
6. Plan 08 (Real-time)

### Team (2+ Engineers)
1. **Immediate parallel start**:
   - Engineer A: Plan 10 Phase 1
   - Engineer B: Plan 09 (Landing)
2. **After Phase 1**:
   - UI Engineers: Tracks A-F in parallel
   - Backend Engineer: Plans 03-07 sequential
3. **Integration** (needs both UI + Backend done)
4. **Plan 08** (after Integration)

## Testing Checkpoints

### After Plans 01-02 (Current)
- [ ] Schema deployed to Convex
- [ ] Dashboard loads (empty state)
- [ ] New project form works
- [ ] User auth flow complete

### After Plan 10 UI Tracks
- [ ] All pages render with mock data
- [ ] Animations and transitions smooth
- [ ] Responsive on mobile/tablet/desktop
- [ ] Design system consistent

### After Plans 03-07
- [ ] AI question generation works
- [ ] Tech stack research works
- [ ] Validation checks work
- [ ] PRD generation works
- [ ] Export formats work

### After Integration
- [ ] Real data replaces mocks
- [ ] Full wizard flow works end-to-end
- [ ] Error states handled
- [ ] Loading states display

### After Plan 08
- [ ] Real-time progress updates
- [ ] Resume flow works
- [ ] Auto-save functional

## Notes

- **Plan 10 is the enabler** - build UI first with mocks, then integrate
- **Backend is the critical path** - longest sequential dependency chain
- **Integration is the sync point** - requires both UI and Backend complete
- **Landing page (09) is free** - do it whenever, fully independent
