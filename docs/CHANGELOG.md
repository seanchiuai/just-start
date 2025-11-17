# CHANGELOG

## 2025-11-16

### AI Agent with RAG & Memory Implementation
- **Database**: Added `chatMessages` and `userMemory` tables to Convex schema
- **Backend**:
  - `convex/chat.ts`: GPT-4o-mini integration for AI responses
  - `convex/chatMessages.ts`: Message CRUD operations
  - `convex/memory.ts`: User preference/context management
- **Frontend Components**:
  - ChatSidebar with conversation history
  - ChatMessage, ChatInput, ChatHeader components
  - MemoryPanel for managing user preferences
  - BookmarkReferenceCard for bookmark suggestions
- **Features**:
  - Keyboard shortcut (⌘J) to toggle chat
  - Conversation persistence
  - Memory system for personalized AI responses
  - Responsive mobile/desktop design
- **Dependencies**: Installed `openai` package
- **Setup Required**:
  - Run `npx convex dev` to deploy schema
  - Add `OPENAI_API_KEY` to `.env.local` (see `.env.local.example`)

### Rebranding
- App rebranded from "Vibed" to "Sean's Claude Code Web Template"
- Updated all UI components, metadata, and documentation
- Package name changed to `seans-claude-code-web-template`
