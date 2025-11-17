import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all projects for the current user
export const listUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return projects;
  },
});

// Get a single project with auth check
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }

    return project;
  },
});

// Get the user's default project
export const getDefaultProject = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const defaultProject = await ctx.db
      .query("projects")
      .withIndex("by_user_default", (q) =>
        q.eq("userId", identity.subject).eq("isDefault", true)
      )
      .first();

    return defaultProject;
  },
});

// Create a new project
export const createProject = mutation({
  args: {
    name: v.string(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate name length
    if (args.name.trim().length === 0) {
      throw new Error("Project name cannot be empty");
    }
    if (args.name.length > 100) {
      throw new Error("Project name must be 100 characters or less");
    }

    // Check if name already exists for this user
    const existingProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    if (existingProjects.some((p) => p.name === args.name.trim())) {
      throw new Error("A project with this name already exists");
    }

    // If setting as default, unset other default projects
    if (args.isDefault) {
      const currentDefault = await ctx.db
        .query("projects")
        .withIndex("by_user_default", (q) =>
          q.eq("userId", identity.subject).eq("isDefault", true)
        )
        .first();

      if (currentDefault) {
        await ctx.db.patch(currentDefault._id, { isDefault: false });
      }
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      userId: identity.subject,
      name: args.name.trim(),
      isDefault: args.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return projectId;
  },
});

// Update a project (rename)
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }

    // Validate name
    if (args.name.trim().length === 0) {
      throw new Error("Project name cannot be empty");
    }
    if (args.name.length > 100) {
      throw new Error("Project name must be 100 characters or less");
    }

    // Check for duplicate name
    const existingProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    if (
      existingProjects.some(
        (p) => p.name === args.name.trim() && p._id !== args.projectId
      )
    ) {
      throw new Error("A project with this name already exists");
    }

    await ctx.db.patch(args.projectId, {
      name: args.name.trim(),
      updatedAt: Date.now(),
    });
  },
});

// Delete a project and all its folders/bookmarks
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }

    // Prevent deleting default project
    if (project.isDefault) {
      throw new Error("Cannot delete the default project");
    }

    // Delete all bookmarks in this project's folders
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const folder of folders) {
      const bookmarks = await ctx.db
        .query("bookmarks")
        .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
        .collect();

      for (const bookmark of bookmarks) {
        await ctx.db.delete(bookmark._id);
      }
    }

    // Delete all folders in this project
    for (const folder of folders) {
      await ctx.db.delete(folder._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);
  },
});

// Set a project as the default
export const setDefaultProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }

    // Unset current default
    const currentDefault = await ctx.db
      .query("projects")
      .withIndex("by_user_default", (q) =>
        q.eq("userId", identity.subject).eq("isDefault", true)
      )
      .first();

    if (currentDefault && currentDefault._id !== args.projectId) {
      await ctx.db.patch(currentDefault._id, { isDefault: false });
    }

    // Set new default
    await ctx.db.patch(args.projectId, { isDefault: true });
  },
});
