import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { DEFAULT_SUBSCRIPTION } from "./schema";

// List user's projects
// Returns null for auth/user failures, empty array for no projects
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

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

    // Verify ownership first before fetching project
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    // Fetch project only after user is confirmed
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Verify the fetched project belongs to this user
    if (project.userId !== user._id) return null;

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

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // Auto-create user if they don't exist (handles missing webhook sync)
    if (!user) {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email ?? "",
        name: identity.name,
        imageUrl: identity.pictureUrl,
        createdAt: now,
        updatedAt: now,
        prdsGenerated: 0,
        subscription: {
          tier: DEFAULT_SUBSCRIPTION.tier,
          credits: DEFAULT_SUBSCRIPTION.credits,
        },
      });
      user = (await ctx.db.get(userId))!;
    }

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

// Update project name
export const updateName = mutation({
  args: {
    projectId: v.id("prdProjects"),
    appName: v.string(),
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

    // Trim name once and reuse
    const trimmedName = args.appName.trim();

    // Validate name
    if (trimmedName.length === 0) {
      throw new Error("Project name cannot be empty");
    }
    if (trimmedName.length > 100) {
      throw new Error("Project name must be 100 characters or less");
    }

    await ctx.db.patch(args.projectId, {
      appName: trimmedName,
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
    if (!project) throw new Error("Project not found");

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || project.userId !== user._id) {
      throw new Error("Not authorized");
    }

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

    // WARNING: Cascading hard deletes are not atomic in Convex.
    // If a deletion fails partway through, orphaned records may remain.
    // Consider implementing soft deletes (deletedAt timestamp) for safer recovery.
    
    try {
      // Delete related data in parallel
      const [questions, techStack, compatibility, prds] = await Promise.all([
        ctx.db
          .query("questionSets")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
        ctx.db
          .query("techStackRecommendations")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
        ctx.db
          .query("compatibilityChecks")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
        ctx.db
          .query("prds")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
      ]);

      const deletedIds: { type: string; id: string }[] = [];

      // Delete all related records in parallel
      await Promise.all([
        ...questions.map((q) => ctx.db.delete(q._id).then(() => deletedIds.push({ type: "questionSets", id: q._id }))),
        ...techStack.map((t) => ctx.db.delete(t._id).then(() => deletedIds.push({ type: "techStackRecommendations", id: t._id }))),
        ...compatibility.map((c) => ctx.db.delete(c._id).then(() => deletedIds.push({ type: "compatibilityChecks", id: c._id }))),
        ...prds.map((p) => ctx.db.delete(p._id).then(() => deletedIds.push({ type: "prds", id: p._id }))),
      ]);

      await ctx.db.delete(args.projectId);
      deletedIds.push({ type: "prdProjects", id: args.projectId });

    } catch (error) {
      // Log the error and any successfully deleted records for manual cleanup
      console.error("Cascading delete failed for project:", args.projectId);
      console.error("Error:", error);
      console.error("Note: Some records may have been deleted before the failure occurred.");
      console.error("Manual cleanup may be required for orphaned records.");
      // Re-throw to surface the error to the caller
      throw error;
    }
  },
});

// Internal: Update status without auth (for actions)
export const updateStatusInternal = internalMutation({
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
    await ctx.db.patch(args.projectId, {
      status: args.status,
      ...(args.currentStep !== undefined && { currentStep: args.currentStep }),
      updatedAt: Date.now(),
    });
  },
});

// Internal: Update generation status
export const updateGenerationStatus = internalMutation({
  args: {
    projectId: v.id("prdProjects"),
    stage: v.string(),
    progress: v.number(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      generationStatus: {
        stage: args.stage,
        progress: args.progress,
        message: args.message,
        updatedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
  },
});

// Internal: Clear generation status
export const clearGenerationStatus = internalMutation({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      generationStatus: undefined,
      updatedAt: Date.now(),
    });
  },
});

// Update project input (appName and appDescription)
export const updateInput = mutation({
  args: {
    projectId: v.id("prdProjects"),
    appName: v.string(),
    appDescription: v.string(),
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
      appName: args.appName,
      appDescription: args.appDescription,
      updatedAt: Date.now(),
    });
  },
});

// Reset project from a specific stage (deletes all data after that stage)
export const resetFromStage = mutation({
  args: {
    projectId: v.id("prdProjects"),
    stage: v.number(), // 1=Input, 2=Questions, 3=TechStack, 4=Validation
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

    // Delete data based on stage
    if (args.stage <= 1) {
      // Reset from Input: delete everything after
      const [questions, techStack, compatibility, prds] = await Promise.all([
        ctx.db
          .query("questionSets")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
        ctx.db
          .query("techStackRecommendations")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
        ctx.db
          .query("compatibilityChecks")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
        ctx.db
          .query("prds")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
      ]);

      await Promise.all([
        ...questions.map((q) => ctx.db.delete(q._id)),
        ...techStack.map((t) => ctx.db.delete(t._id)),
        ...compatibility.map((c) => ctx.db.delete(c._id)),
        ...prds.map((p) => ctx.db.delete(p._id)),
      ]);

      // Reset to stage 1
      await ctx.db.patch(args.projectId, {
        status: "draft",
        currentStep: 1,
        updatedAt: Date.now(),
      });
    } else if (args.stage <= 2) {
      // Reset from Questions: delete tech stack, compatibility, and PRD
      const [techStack, compatibility, prds] = await Promise.all([
        ctx.db
          .query("techStackRecommendations")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
        ctx.db
          .query("compatibilityChecks")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
        ctx.db
          .query("prds")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
      ]);

      await Promise.all([
        ...techStack.map((t) => ctx.db.delete(t._id)),
        ...compatibility.map((c) => ctx.db.delete(c._id)),
        ...prds.map((p) => ctx.db.delete(p._id)),
      ]);

      // Reset to stage 2
      await ctx.db.patch(args.projectId, {
        status: "questions",
        currentStep: 2,
        updatedAt: Date.now(),
      });
    } else if (args.stage <= 3) {
      // Reset from Tech Stack: delete compatibility and PRD
      const [compatibility, prds] = await Promise.all([
        ctx.db
          .query("compatibilityChecks")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
        ctx.db
          .query("prds")
          .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
          .collect(),
      ]);

      await Promise.all([
        ...compatibility.map((c) => ctx.db.delete(c._id)),
        ...prds.map((p) => ctx.db.delete(p._id)),
      ]);

      // Reset to stage 3
      await ctx.db.patch(args.projectId, {
        status: "research",
        currentStep: 3,
        updatedAt: Date.now(),
      });
    } else if (args.stage <= 4) {
      // Reset from Validation: delete PRD only
      const prds = await ctx.db
        .query("prds")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();

      await Promise.all([...prds.map((p) => ctx.db.delete(p._id))]);

      // Reset to stage 4
      await ctx.db.patch(args.projectId, {
        status: "validation",
        currentStep: 4,
        updatedAt: Date.now(),
      });
    }
  },
});

// Internal: Verify user owns the project (for actions)
export const verifyOwnership = internalQuery({
  args: { projectId: v.id("prdProjects"), clerkId: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return { authorized: false, project: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user || project.userId !== user._id) {
      return { authorized: false, project: null };
    }

    return { authorized: true, project, user };
  },
});
