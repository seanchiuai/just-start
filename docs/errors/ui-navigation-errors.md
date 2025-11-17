# UI and Navigation Errors

## Error 1: Settings Link Non-Functional
**Location:** Sidebar - Settings link

**Issue:** Clicking Settings link doesn't navigate to any page, just adds "#" to URL.

**Steps to Reproduce:**
1. Click "Settings" link in sidebar
2. URL changes from `/tasks` to `/tasks#`
3. No navigation occurs

**Expected Behavior:**
Settings link should navigate to a settings page or open settings modal.

**Fix Required:**
- Implement settings page or modal
- Update link href from "#" to proper route

---

## Error 2: Help Link Non-Functional
**Location:** Sidebar - Help link

**Issue:** Clicking Help link doesn't navigate to any page, just adds "#" to URL.

**Steps to Reproduce:**
1. Click "Help" link in sidebar
2. URL changes to include "#"
3. No navigation occurs

**Expected Behavior:**
Help link should navigate to help page or open help documentation.

**Fix Required:**
- Implement help page or modal
- Update link href from "#" to proper route

---

## Error 3: Add Task Button No Visible Action
**Location:** Sidebar - Add Task button

**Issue:** Clicking "Add Task" button highlights it but doesn't perform any visible action.

**Steps to Reproduce:**
1. Click "Add Task" button in sidebar
2. Button becomes active/highlighted
3. No modal, form, or navigation occurs

**Expected Behavior:**
Should open task creation modal or navigate to task creation page.

**Fix Required:**
- Implement task creation modal/functionality for this button
- Or remove button if functionality exists elsewhere

---

## Error 4: Layout/Viewport Issues
**Location:** Sidebar elements (User profile, AI Assistant panel buttons)

**Issue:** Multiple elements are positioned outside viewport and cannot be clicked using normal Playwright click actions.

**Affected Elements:**
- User profile dropdown button (bottom of sidebar)
- AI Assistant "Memory settings" button
- AI Assistant "Close chat" button (in some viewport sizes)

**Steps to Reproduce:**
1. Open app at default viewport size
2. Attempt to click user profile button or AI Assistant panel buttons
3. Elements are outside viewport even after scrolling

**Expected Behavior:**
All interactive elements should be accessible and within viewport.

**Fix Required:**
- Review sidebar layout and AI Assistant panel positioning
- Ensure proper responsive design
- Fix z-index or overflow issues

---

## Error 5: Bookmarks Page Empty
**Location:** `/bookmarks`

**Issue:** Bookmarks page renders completely empty with no content or UI elements.

**Steps to Reproduce:**
1. Navigate to http://localhost:3002/bookmarks
2. Page loads with no visible content

**Expected Behavior:**
Should display bookmarks interface with ability to view/manage bookmarks.

**Fix Required:**
- Implement bookmarks page UI
- Or remove route if not needed
- Add loading states or empty state messages

---

## Error 6: AI Assistant Context Mismatch
**Location:** AI Assistant panel placeholder text

**Issue:** AI Assistant shows "Ask me anything about your bookmarks!" on the Tasks page, but the context should be about tasks.

**Steps to Reproduce:**
1. Navigate to /tasks page
2. Open AI Assistant panel
3. Placeholder text says "Ask about your bookmarks..."

**Expected Behavior:**
Placeholder text should be context-aware (e.g., "Ask about your tasks..." on tasks page).

**Fix Required:**
- Make AI Assistant context-aware based on current route
- Update placeholder text dynamically
