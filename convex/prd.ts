import { v } from "convex/values";
import {
  query,
  internalQuery,
  internalMutation,
} from "./_generated/server";

// Get PRD for a project (public)
export const getByProject = query({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Verify user owns the project
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) return null;

    return await ctx.db
      .query("prds")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// Get PRD by ID (public)
export const get = query({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Verify user owns the PRD
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const prd = await ctx.db.get(args.prdId);
    if (!prd || prd.userId !== user._id) return null;

    return prd;
  },
});

// Internal query for actions
export const getByProjectInternal = internalQuery({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prds")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// Internal get by ID
export const getInternal = internalQuery({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.prdId);
  },
});

// Internal: Verify user owns the PRD (for actions)
export const verifyOwnership = internalQuery({
  args: { prdId: v.id("prds"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const prd = await ctx.db.get(args.prdId);
    if (!prd) return { authorized: false, prd: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user || prd.userId !== user._id) {
      return { authorized: false, prd: null };
    }

    return { authorized: true, prd };
  },
});

// Save PRD (internal)
export const save = internalMutation({
  args: {
    projectId: v.id("prdProjects"),
    userId: v.id("users"),
    content: v.string(), // JSON stringified PRD content
  },
  handler: async (ctx, args) => {
    // Check if PRD already exists for this project
    const existing = await ctx.db
      .query("prds")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (existing) {
      // Update existing PRD (increment version)
      await ctx.db.patch(existing._id, {
        content: args.content,
        version: existing.version + 1,
        generatedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new PRD
    return await ctx.db.insert("prds", {
      projectId: args.projectId,
      userId: args.userId,
      content: args.content,
      version: 1,
      generatedAt: Date.now(),
    });
  },
});

// Mark PRD as exported
export const markExported = internalMutation({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prdId, {
      exportedAt: Date.now(),
    });
  },
});

// Internal mutation to set share link
export const setShareLink = internalMutation({
  args: {
    prdId: v.id("prds"),
    shareToken: v.string(),
    shareExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prdId, {
      shareToken: args.shareToken,
      shareExpiresAt: args.shareExpiresAt,
    });
  },
});

// Internal mutation to clear share link
export const clearShareLink = internalMutation({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.prdId, {
      shareToken: undefined,
      shareExpiresAt: undefined,
    });
  },
});

// Get shared PRD (public, no auth required)
export const getShared = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const prd = await ctx.db
      .query("prds")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.token))
      .unique();

    if (!prd) {
      return null;
    }

    // Check expiration
    if (prd.shareExpiresAt && prd.shareExpiresAt < Date.now()) {
      return null;
    }

    // Get project info for the app name
    const project = await ctx.db.get(prd.projectId);

    return {
      content: prd.content,
      generatedAt: prd.generatedAt,
      version: prd.version,
      appName: project?.appName || "Unknown",
    };
  },
});
