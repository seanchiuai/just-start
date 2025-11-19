import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";

// List user's projects
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("prdProjects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get single project
export const get = query({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || project.userId !== user._id) return null;

    return project;
  },
});

// Internal get (for actions)
export const getInternal = internalQuery({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

// Create new project
export const create = mutation({
  args: {
    appName: v.string(),
    appDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const now = Date.now();

    return await ctx.db.insert("prdProjects", {
      userId: user._id,
      appName: args.appName,
      appDescription: args.appDescription,
      status: "draft",
      currentStep: 1,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
    });
  },
});

// Update project status
export const updateStatus = mutation({
  args: {
    projectId: v.id("prdProjects"),
    status: v.union(
      v.literal("draft"),
      v.literal("questions"),
      v.literal("research"),
      v.literal("confirmation"),
      v.literal("validation"),
      v.literal("completed")
    ),
    currentStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || project.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.projectId, {
      status: args.status,
      ...(args.currentStep !== undefined && { currentStep: args.currentStep }),
      updatedAt: Date.now(),
    });
  },
});

// Update last accessed
export const updateLastAccessed = mutation({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) return;

    await ctx.db.patch(args.projectId, {
      lastAccessedAt: Date.now(),
    });
  },
});

// Delete project
export const remove = mutation({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || project.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Delete related data
    const questions = await ctx.db
      .query("questionSets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const q of questions) {
      await ctx.db.delete(q._id);
    }

    const techStack = await ctx.db
      .query("techStackRecommendations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const t of techStack) {
      await ctx.db.delete(t._id);
    }

    const compatibility = await ctx.db
      .query("compatibilityChecks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const c of compatibility) {
      await ctx.db.delete(c._id);
    }

    const prds = await ctx.db
      .query("prds")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const p of prds) {
      await ctx.db.delete(p._id);
    }

    await ctx.db.delete(args.projectId);
  },
});
