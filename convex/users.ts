import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { DEFAULT_SUBSCRIPTION } from "./schema";

// Helper function to query user by Clerk ID
const queryByClerkId = async (db: any, clerkId: string) => {
  return await db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .unique();
};

// Get current user by Clerk ID
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await queryByClerkId(ctx.db, args.clerkId);
  },
});

// Get current user (for authenticated routes)
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

// Internal: Get user by ID
export const getInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Internal: Get user by Clerk ID
export const getByClerkIdInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await queryByClerkId(ctx.db, args.clerkId);
  },
});

// Create or update user (called from Clerk webhook)
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const now = Date.now();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      createdAt: now,
      updatedAt: now,
      prdsGenerated: 0,
      subscription: {
        tier: DEFAULT_SUBSCRIPTION.tier,
        credits: DEFAULT_SUBSCRIPTION.credits,
      },
    });
  },
});

// Delete user (called from Clerk webhook)
export const deleteByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

// Increment PRDs generated count
export const incrementPrdsGenerated = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      prdsGenerated: user.prdsGenerated + 1,
      updatedAt: Date.now(),
    });
  },
});

// Decrement credits
export const decrementCredits = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.subscription.credits <= 0) throw new Error("No credits remaining");

    // Explicitly construct the new subscription object to ensure schema changes cause compile errors
    await ctx.db.patch(args.userId, {
      subscription: {
        tier: user.subscription.tier,
        credits: user.subscription.credits - 1,
      },
      updatedAt: Date.now(),
    });
  },
});
