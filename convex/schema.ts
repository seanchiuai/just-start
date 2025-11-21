import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Default subscription configuration for new users
export const DEFAULT_SUBSCRIPTION_TIER = "free" as const;
export const DEFAULT_SUBSCRIPTION_CREDITS = 3;

export const DEFAULT_SUBSCRIPTION = {
  tier: DEFAULT_SUBSCRIPTION_TIER,
  credits: DEFAULT_SUBSCRIPTION_CREDITS,
} as const;

// Reusable tech recommendation schema
const techRecommendation = v.object({
  technology: v.string(),
  reasoning: v.string(),
  pros: v.array(v.string()),
  cons: v.array(v.string()),
  alternatives: v.array(v.string()),
});

export default defineSchema({
  // Legacy tables removed


  // Just Start PRD Generator - Users
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    prdsGenerated: v.number(),
    subscription: v.object({
      tier: v.string(), // Use DEFAULT_SUBSCRIPTION_TIER for new users
      credits: v.number(), // Use DEFAULT_SUBSCRIPTION_CREDITS for new users
    }),
  }).index("by_clerk_id", ["clerkId"]),

  // Just Start PRD Generator - Projects
  prdProjects: defineTable({
    userId: v.id("users"),
    appName: v.string(),
    appDescription: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("questions"),
      v.literal("research"),
      v.literal("confirmation"),
      v.literal("validation"),
      v.literal("completed")
    ),
    currentStep: v.number(),
    generationStatus: v.optional(
      v.object({
        stage: v.string(),
        progress: v.number(),
        message: v.string(),
        updatedAt: v.number(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastAccessedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Question Sets
  questionSets: defineTable({
    projectId: v.id("prdProjects"),
    questions: v.array(
      v.object({
        id: v.number(),
        question: v.string(),
        options: v.array(v.string()),
        default: v.string(),
        category: v.union(
          v.literal("features"),
          v.literal("audience"),
          v.literal("scale"),
          v.literal("workflow"),
          v.literal("technical")
        ),
      })
    ),
    // Maps question ID (as string) to selected option string
    answers: v.optional(v.record(v.string(), v.string())),
    generatedAt: v.number(),
    answeredAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  // Tech Stack Recommendations
  techStackRecommendations: defineTable({
    projectId: v.id("prdProjects"),
    researchQueries: v.array(v.string()),
    researchResults: v.string(),
    recommendations: v.object({
      frontend: techRecommendation,
      backend: techRecommendation,
      database: techRecommendation,
      auth: techRecommendation,
      hosting: techRecommendation,
    }),
    confirmedStack: v.optional(
      v.object({
        frontend: v.string(),
        backend: v.string(),
        database: v.string(),
        auth: v.string(),
        hosting: v.string(),
      })
    ),
    generatedAt: v.number(),
    confirmedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  // Compatibility Checks
  compatibilityChecks: defineTable({
    projectId: v.id("prdProjects"),
    status: v.union(
      v.literal("approved"),
      v.literal("warnings"),
      v.literal("critical")
    ),
    issues: v.array(
      v.object({
        severity: v.union(
          v.literal("critical"),
          v.literal("moderate"),
          v.literal("low")
        ),
        component: v.string(),
        issue: v.string(),
        recommendation: v.string(),
      })
    ),
    summary: v.string(),
    checkedAt: v.number(),
  }).index("by_project", ["projectId"]),

  // PRDs
  prds: defineTable({
    projectId: v.id("prdProjects"),
    userId: v.id("users"),
    // PRD content structure - stored as serialized JSON string for flexibility
    // Expected structure (validated at runtime in mutations):
    // - overview: { summary, problemStatement, targetAudience, valueProposition }
    // - goals: { primary, secondary, metrics }
    // - personas: Array<{ name, description, goals, painPoints }>
    // - features: { mvp: Array<Feature>, niceToHave: Array<Feature> }
    // - architecture: { overview, techStack, dataFlow }
    // - dataModels: Array<{ name, fields, relationships }>
    // - apiEndpoints: Array<{ method, path, description, auth }>
    // - uiux: { designPrinciples, keyScreens, userFlows }
    // - timeline: { phases: Array<{ name, duration, deliverables }> }
    // - risks: Array<{ risk, mitigation, impact }>
    content: v.string(),
    version: v.number(),
    generatedAt: v.number(),
    exportedAt: v.optional(v.number()),
    shareToken: v.optional(v.string()),
    shareExpiresAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_share_token", ["shareToken"]),

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
    value: v.string(), // e.g., "TypeScript", "React, Next.js", Convex"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "memoryType"]),

  // Projects table
  // Note: isDefault uniqueness per user is enforced in mutations (only one default project per user)
  projects: defineTable({
    userId: v.string(),
    name: v.string(),
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_default", ["userId", "isDefault"])
    .index("by_user_name", ["userId", "name"]),

  // Folders table
  // Note: Cycle detection for parentFolderId is enforced in mutations
  folders: defineTable({
    projectId: v.id("projects"),
    parentFolderId: v.optional(v.id("folders")),
    name: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_parent", ["parentFolderId"])
    .index("by_user", ["userId"])
    .index("by_project_parent", ["projectId", "parentFolderId"]),

  // Bookmarks table with vector embeddings
  bookmarks: defineTable({
    folderId: v.id("folders"),
    userId: v.string(),
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    previewImageId: v.optional(v.id("_storage")),
    faviconId: v.optional(v.id("_storage")),
    favicon: v.optional(v.string()),
    embedding: v.optional(v.array(v.float64())), // 1536 dimensions for text-embedding-3-small
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_folder", ["folderId"])
    .index("by_user", ["userId"])
    .index("by_folder_url", ["folderId", "url"])
    .index("by_user_url", ["userId", "url"]) // For duplicate URL detection
    .searchIndex("by_embedding", {
      searchField: "embedding",
      filterFields: ["userId", "folderId"],
    }),
});
