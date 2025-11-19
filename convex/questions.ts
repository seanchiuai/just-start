import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { generateQuestions } from "./ai/claude";
import { ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper function to perform question generation
async function performQuestionGeneration(
  ctx: ActionCtx,
  projectId: Id<"prdProjects">,
  project: { appName: string; appDescription: string }
) {
  // Update project status to show we're generating
  await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
    projectId,
    stage: "generating_questions",
    progress: 10,
    message: "Analyzing your description...",
  });

  try {
    // Generate questions using Claude
    const questions = await generateQuestions(
      project.appName,
      project.appDescription
    );

    // Update progress
    await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
      projectId,
      stage: "generating_questions",
      progress: 80,
      message: "Finalizing questions...",
    });

    // Save questions to database
    await ctx.runMutation(internal.questions.save, {
      projectId,
      questions,
    });

    // Clear generation status
    await ctx.runMutation(internal.prdProjects.clearGenerationStatus, {
      projectId,
    });

    return { success: true, questionCount: questions.length };
  } catch (error) {
    // Clear generation status on error
    await ctx.runMutation(internal.prdProjects.clearGenerationStatus, {
      projectId,
    });

    throw error;
  }
}

// Get questions for a project (public)
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
      .query("questionSets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// Internal query for actions
export const getByProjectInternal = internalQuery({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questionSets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// Save generated questions (internal)
export const save = internalMutation({
  args: {
    projectId: v.id("prdProjects"),
    questions: v.array(
      v.object({
        id: v.number(),
        question: v.string(),
        options: v.array(v.string()),
        default: v.string(),
        category: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check if questions already exist for this project
    const existing = await ctx.db
      .query("questionSets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (existing) {
      // Update existing questions
      await ctx.db.patch(existing._id, {
        questions: args.questions,
        generatedAt: Date.now(),
        answers: undefined, // Clear previous answers
        answeredAt: undefined,
      });
      return existing._id;
    }

    // Create new question set
    return await ctx.db.insert("questionSets", {
      projectId: args.projectId,
      questions: args.questions,
      generatedAt: Date.now(),
    });
  },
});

// Save user answers
export const saveAnswers = mutation({
  args: {
    projectId: v.id("prdProjects"),
    answers: v.record(v.string(), v.string()),
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

    // Get question set
    const questionSet = await ctx.db
      .query("questionSets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (!questionSet) {
      throw new Error("Question set not found");
    }

    // Save answers
    await ctx.db.patch(questionSet._id, {
      answers: args.answers,
      answeredAt: Date.now(),
    });

    // Update project status
    await ctx.db.patch(args.projectId, {
      status: "research",
      currentStep: 3,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Generate questions using Claude AI
export const generate = action({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    // Get project details
    const project = await ctx.runQuery(internal.prdProjects.getInternal, {
      projectId: args.projectId,
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Perform question generation
    const result = await performQuestionGeneration(ctx, args.projectId, project);

    // Update project status
    await ctx.runMutation(internal.prdProjects.updateStatusInternal, {
      projectId: args.projectId,
      status: "questions",
      currentStep: 2,
    });

    return result;
  },
});

// Regenerate questions (e.g., if user wants different questions)
export const regenerate = action({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    // Get project details first (same pattern as generate action)
    // @ts-expect-error - TypeScript type inference issue with internal API
    const project = await ctx.runQuery(internal.prdProjects.getInternal, {
      projectId: args.projectId,
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user and verify authorization
    const user = await ctx.runQuery(internal.users.getByClerkIdInternal, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (project.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Perform question generation
    return await performQuestionGeneration(ctx, args.projectId, project);
  },
});

// Internal generate for use by other actions
export const generateInternal = internalAction({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(internal.prdProjects.getInternal, {
      projectId: args.projectId,
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const questions = await generateQuestions(
      project.appName,
      project.appDescription
    );

    await ctx.runMutation(internal.questions.save, {
      projectId: args.projectId,
      questions,
    });

    return { success: true, questionCount: questions.length };
  },
});
