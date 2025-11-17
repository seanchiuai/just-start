import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  todos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("completed")),
    userId: v.string(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // AI Chat System
  chatMessages: defineTable({
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    bookmarkReferences: v.optional(v.array(v.string())), // Bookmark IDs
    projectId: v.optional(v.string()), // Context: which project user was in
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  userMemory: defineTable({
    userId: v.string(),
    memoryType: v.union(v.literal("preference"), v.literal("context")),
    key: v.string(), // e.g., "favorite_language", "work_interests"
    value: v.string(), // e.g., "TypeScript", "React, Next.js, Convex"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "memoryType"]),
});
