import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveMemory = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    memoryType: v.union(v.literal("preference"), v.literal("context")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if memory exists
    const existing = await ctx.db
      .query("userMemory")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("userMemory", {
        userId: identity.subject,
        key: args.key,
        value: args.value,
        memoryType: args.memoryType,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const getUserMemories = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("userMemory")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const deleteMemory = mutation({
  args: { memoryId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const memory = await ctx.db.get(args.memoryId as any);
    if (!memory || memory.userId !== identity.subject) {
      throw new Error("Memory not found or unauthorized");
    }

    await ctx.db.delete(args.memoryId as any);
  },
});
