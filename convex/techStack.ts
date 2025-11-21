import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { researchTechStack } from "./ai/perplexity";
import { generateRecommendations } from "./ai/claude";

// Tech recommendation validator
const techRecommendationValidator = v.object({
  technology: v.string(),
  reasoning: v.string(),
  pros: v.array(v.string()),
  cons: v.array(v.string()),
  alternatives: v.array(v.string()),
});

// Get tech stack for a project (public)
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
      .query("techStackRecommendations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// Internal query for actions
export const getByProjectInternal = internalQuery({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("techStackRecommendations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// Save tech stack recommendations (internal)
export const save = internalMutation({
  args: {
    projectId: v.id("prdProjects"),
    researchQueries: v.array(v.string()),
    researchResults: v.string(),
    recommendations: v.object({
      frontend: techRecommendationValidator,
      backend: techRecommendationValidator,
      database: techRecommendationValidator,
      auth: techRecommendationValidator,
      hosting: techRecommendationValidator,
    }),
  },
  handler: async (ctx, args) => {
    // Check if recommendations already exist for this project
    const existing = await ctx.db
      .query("techStackRecommendations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (existing) {
      // Update existing recommendations
      await ctx.db.patch(existing._id, {
        researchQueries: args.researchQueries,
        researchResults: args.researchResults,
        recommendations: args.recommendations,
        generatedAt: Date.now(),
        confirmedStack: undefined, // Clear previous confirmation
        confirmedAt: undefined,
      });
      return existing._id;
    }

    // Create new recommendations
    return await ctx.db.insert("techStackRecommendations", {
      projectId: args.projectId,
      researchQueries: args.researchQueries,
      researchResults: args.researchResults,
      recommendations: args.recommendations,
      generatedAt: Date.now(),
    });
  },
});

// Confirm tech stack selection
export const confirm = mutation({
  args: {
    projectId: v.id("prdProjects"),
    confirmedStack: v.object({
      frontend: v.string(),
      backend: v.string(),
      database: v.string(),
      auth: v.string(),
      hosting: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify user owns the project
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Get tech stack recommendations
    const techStack = await ctx.db
      .query("techStackRecommendations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (!techStack) {
      throw new Error("Tech stack recommendations not found");
    }

    // Save confirmed stack
    await ctx.db.patch(techStack._id, {
      confirmedStack: args.confirmedStack,
      confirmedAt: Date.now(),
    });

    // Update project status
    await ctx.db.patch(args.projectId, {
      status: "confirmation",
      currentStep: 4,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Research and generate tech stack recommendations
export const research = action({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    // Verify authentication and project ownership
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get project and verify ownership
    const project = await ctx.runQuery(internal.prdProjects.getInternal, {
      projectId: args.projectId,
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Verify ownership
    const user = await ctx.runQuery(internal.users.getByClerkIdInternal, {
      clerkId: identity.subject,
    });

    if (!user || project.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Get question answers
    const questionSet = await ctx.runQuery(internal.questions.getByProjectInternal, {
      projectId: args.projectId,
    });

    if (!questionSet || !questionSet.answers) {
      throw new Error("Question answers not found");
    }

    // Update progress
    await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
      projectId: args.projectId,
      stage: "researching_tech_stack",
      progress: 10,
      message: "Researching frontend frameworks...",
    });

    try {
      // Research with Perplexity
      const { queries, results } = await researchTechStack(
        project.appName,
        project.appDescription,
        questionSet.answers
      );

      // Update progress
      await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
        projectId: args.projectId,
        stage: "researching_tech_stack",
        progress: 50,
        message: "Generating recommendations...",
      });

      // Generate recommendations with Claude
      const recommendations = await generateRecommendations(
        project.appName,
        project.appDescription,
        questionSet.answers,
        results
      );

      // Update progress
      await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
        projectId: args.projectId,
        stage: "researching_tech_stack",
        progress: 90,
        message: "Saving recommendations...",
      });

      // Save results
      await ctx.runMutation(internal.techStack.save, {
        projectId: args.projectId,
        researchQueries: queries,
        researchResults: results,
        recommendations,
      });

      // Update project status
      await ctx.runMutation(internal.prdProjects.updateStatusInternal, {
        projectId: args.projectId,
        status: "research",
        currentStep: 3,
      });

      // Clear generation status
      await ctx.runMutation(internal.prdProjects.clearGenerationStatus, {
        projectId: args.projectId,
      });

      return { success: true };
    } catch (error) {
      // Clear generation status on error
      await ctx.runMutation(internal.prdProjects.clearGenerationStatus, {
        projectId: args.projectId,
      });

      throw error;
    }
  },
});
