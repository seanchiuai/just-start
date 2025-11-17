# AI Assistant Errors

## Error 1: OPENAI_API_KEY Not Set
**Location:** `convex/chat.ts:74`

**Issue:** AI Assistant chat fails when attempting to send messages.

**Error Message:**
```
[CONVEX A(chat:getChatResponse)] [Request ID: 9add62e3ae3d0f85] Server Error
Uncaught Error: OPENAI_API_KEY environment variable is not set
    at handler (../convex/chat.ts:74:19)
```

**Steps to Reproduce:**
1. Navigate to /tasks
2. Type a message in AI Assistant chat input
3. Press Enter to send message
4. Error is thrown and no response is received

**Expected Behavior:**
AI Assistant should respond to user queries about bookmarks/tasks.

**Fix Required:**
- Set OPENAI_API_KEY environment variable in Convex configuration
- Add proper error handling for missing API key
- Display user-friendly error message when API key is missing
