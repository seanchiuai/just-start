# Changelog

## [Unreleased]

### Added - 2025-11-16
- **Project & Folder Organization System**: Full hierarchical bookmark organization
  - Projects table with default project support
  - Folders table with nested structure (max 5 levels deep)
  - Bookmarks table linking to folders
  - Auto-initialization: Default "Main" project + "Uncategorized" folder on first login

- **Backend (Convex)**:
  - `convex/projects.ts`: CRUD operations, default project management, validation
  - `convex/folders.ts`: Nested folder operations, circular reference prevention, tree building
  - `convex/init.ts`: User initialization mutation
  - Updated schema with indexes for efficient queries

- **Frontend Components**:
  - `ProjectSwitcher`: Dropdown for switching/creating projects
  - `FolderTree` + `FolderTreeItem`: Recursive folder tree with expand/collapse
  - `NewProjectDialog` + `NewFolderDialog`: Creation dialogs with validation
  - `/bookmarks` route with custom sidebar layout
  - Added dialog component from shadcn/ui

### Important Notes
- **Setup Required**: Run `npx convex dev` to deploy schema and generate types
- All operations secured with row-level filtering by userId
- Real-time updates via Convex subscriptions (automatic)
- Max folder depth: 5 levels to prevent performance issues
