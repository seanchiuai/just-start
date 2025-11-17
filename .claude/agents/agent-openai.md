---
name: "OpenAI Integration"
description: "Implementation guide for OpenAI embeddings and chat completions"
tools: ["npm", "filesystem", "env"]
color: green
---

# OpenAI Agent

## Mission
Implement OpenAI API integration for vector embeddings (semantic search) and chat completions (AI agent conversations).

## Stack Context
- **Model (Embeddings)**: `text-embedding-3-small` - Cost-effective, high-quality embeddings for bookmark semantic search
- **Model (Chat)**: `gpt-4o-mini` - Fast, affordable chat for conversational AI agent
- **Library**: `openai` (official Node.js SDK)
- **Integration**: Convex actions call OpenAI API, store embeddings in vector index

## Implementation Steps

### 1. Install OpenAI SDK
```bash
npm install openai
```

### 2. Set Environment Variables
Add to `.env.local`:
```
OPENAI_API_KEY=sk-proj-...
```

### 3. Create Embedding Generation (Convex Action)
**File**: `convex/actions/generateEmbedding.ts`

```typescript
import { action } from "../_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateEmbedding = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, { text }) => {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      });

      return response.data[0].embedding;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI embedding error: ${error.message}`);
      }
      throw error;
    }
  },
});
```

### 4. Create Chat Completion Handler (Convex Action)
**File**: `convex/actions/chatCompletion.ts`

```typescript
import { action } from "../_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getChatCompletion = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
      })
    ),
    context: v.optional(v.string()), // Bookmark results from vector search
  },
  handler: async (ctx, { messages, context }) => {
    try {
      const systemPrompt = {
        role: "system" as const,
        content: `You are a helpful AI assistant for a bookmark manager.
Help users find and organize their bookmarks through natural conversation.
${context ? `\n\nRelevant bookmarks:\n${context}` : ""}`,
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [systemPrompt, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI chat error: ${error.message}`);
      }
      throw error;
    }
  },
});
```

### 5. Bookmark Creation with Embedding (Convex Mutation + Action)
**File**: `convex/mutations/bookmarks.ts`

```typescript
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createBookmarkWithEmbedding = mutation({
  args: {
    folderId: v.id("folders"),
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    embedding: v.array(v.number()), // Generated from action
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Verify folder ownership
    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new Error("Folder not found");

    const project = await ctx.db.get(folder.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("bookmarks", {
      folderId: args.folderId,
      url: args.url,
      title: args.title,
      description: args.description,
      embedding: args.embedding,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

### 6. Vector Search Query (Convex Query)
**File**: `convex/queries/search.ts`

```typescript
import { query } from "../_generated/server";
import { v } from "convex/values";

export const searchBookmarks = query({
  args: {
    queryEmbedding: v.array(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { queryEmbedding, limit = 5 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const results = await ctx.db
      .query("bookmarks")
      .withSearchIndex("by_embedding", (q) =>
        q.similar("embedding", queryEmbedding, limit)
      )
      .collect();

    // Filter by user ownership
    const userResults = [];
    for (const bookmark of results) {
      const folder = await ctx.db.get(bookmark.folderId);
      if (!folder) continue;

      const project = await ctx.db.get(folder.projectId);
      if (project?.userId === identity.subject) {
        userResults.push(bookmark);
      }
    }

    return userResults;
  },
});
```

### 7. Schema Configuration (Convex Schema)
**File**: `convex/schema.ts`

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bookmarks: defineTable({
    folderId: v.id("folders"),
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    previewImageUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    embedding: v.array(v.number()), // Vector embedding for semantic search
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_folder", ["folderId"])
    .searchIndex("by_embedding", {
      searchField: "embedding",
      filterFields: ["folderId"],
    }),
});
```

## Usage Patterns

### Frontend: Add Bookmark with Embedding
```typescript
"use client";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

const addBookmark = async (url: string, title: string, description: string) => {
  // 1. Generate embedding
  const embeddingText = `${title} ${description} ${url}`;
  const embedding = await generateEmbedding({ text: embeddingText });

  // 2. Create bookmark with embedding
  await createBookmark({
    folderId: currentFolderId,
    url,
    title,
    description,
    embedding,
  });
};
```

### Frontend: AI Chat with Vector Search
```typescript
const handleUserMessage = async (userMessage: string) => {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding({ text: userMessage });

  // 2. Search bookmarks
  const relevantBookmarks = await searchBookmarks({
    queryEmbedding,
    limit: 5
  });

  // 3. Format context
  const context = relevantBookmarks
    .map((b) => `- ${b.title}: ${b.description} (${b.url})`)
    .join("\n");

  // 4. Get AI response
  const response = await getChatCompletion({
    messages: [...chatHistory, { role: "user", content: userMessage }],
    context,
  });

  return { response, bookmarks: relevantBookmarks };
};
```

## Cost Optimization

### Embeddings Cost
- **Model**: `text-embedding-3-small`
- **Price**: $0.02 per 1M tokens (~750K words)
- **Average bookmark**: ~50 tokens → $0.000001 per bookmark
- **1000 bookmarks**: ~$0.001 (less than a penny)

### Chat Cost
- **Model**: `gpt-4o-mini`
- **Price**: $0.150 per 1M input tokens, $0.600 per 1M output tokens
- **Average query**: 200 input + 150 output tokens → $0.00012
- **1000 queries**: ~$0.12

## Error Handling

### Rate Limits
```typescript
try {
  const embedding = await openai.embeddings.create({ ... });
} catch (error) {
  if (error instanceof OpenAI.RateLimitError) {
    // Retry with exponential backoff
    await new Promise(r => setTimeout(r, 1000));
    return retry();
  }
  throw error;
}
```

### API Key Validation
```typescript
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY not configured in environment");
}
```

## Testing Checklist
- [ ] OpenAI SDK installed
- [ ] API key configured in `.env.local`
- [ ] Embedding generation working (test with sample text)
- [ ] Chat completion working (test with simple query)
- [ ] Vector search returning relevant results
- [ ] User isolation enforced (can't search other users' bookmarks)
- [ ] Error handling for rate limits and API errors
- [ ] Cost monitoring enabled (track usage)

## Resources
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [Text Embedding Models](https://platform.openai.com/docs/guides/embeddings)
- [Chat Completions Guide](https://platform.openai.com/docs/guides/chat-completions)
- [OpenAI Pricing](https://openai.com/api/pricing/)
