import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Initialize default project and folder for new users
 * This should be called once when a user first logs in
 */
export const initializeUserDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already has projects
    const existingProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existingProjects) {
      // User already has projects, skip initialization
      return { initialized: false, message: "User already has projects" };
    }

    const now = Date.now();

    // Create default "Main" project
    const projectId = await ctx.db.insert("projects", {
      userId: identity.subject,
      name: "Main",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create default "Uncategorized" folder
    await ctx.db.insert("folders", {
      projectId,
      parentFolderId: undefined,
      name: "Uncategorized",
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });

    return {
      initialized: true,
      message: "Default project and folder created",
      projectId
    };
  },
});
