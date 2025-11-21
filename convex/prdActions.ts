"use node";

import crypto from "crypto";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { generatePRD } from "./ai/claude";
import { prdToMarkdown } from "./lib/markdown";
import { requirePrdOwnership, requireProjectOwnership } from "./lib/auth";

// Generate cryptographically secure random token
// 32 bytes = 256 bits of entropy, encoded as URL-safe base64
function generateToken(): string {
  const randomBytes = crypto.randomBytes(32);
  return randomBytes
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Generate PRD using Claude
export const generate = action({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    // Verify authentication and project ownership FIRST
    const { project, user } = await requireProjectOwnership(ctx, args.projectId);

    // Check if user has credits remaining
    if (user.subscription.credits <= 0) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    // Get all project context
    const [questionSet, techStack, compatibility] = await Promise.all([
      ctx.runQuery(internal.questions.getByProjectInternal, {
        projectId: args.projectId,
      }),
      ctx.runQuery(internal.techStack.getByProjectInternal, {
        projectId: args.projectId,
      }),
      ctx.runQuery(internal.compatibility.getByProjectInternal, {
        projectId: args.projectId,
      }),
    ]);

    if (!questionSet || !questionSet.answers) {
      throw new Error("Question answers not found");
    }

    if (!techStack || !techStack.confirmedStack) {
      throw new Error("Confirmed tech stack not found");
    }

    // Update progress
    await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
      projectId: args.projectId,
      stage: "generating_prd",
      progress: 10,
      message: "Compiling project requirements...",
    });

    try {
      // Generate PRD with Claude
      const prdContent = await generatePRD(
        project.appName,
        project.appDescription,
        questionSet.answers,
        techStack.confirmedStack,
        techStack.recommendations,
        compatibility?.summary || "No compatibility issues found."
      );

      // Update progress
      await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
        projectId: args.projectId,
        stage: "generating_prd",
        progress: 90,
        message: "Saving PRD...",
      });

      // Save PRD (as JSON string)
      await ctx.runMutation(internal.prd.save, {
        projectId: args.projectId,
        userId: user._id,
        content: JSON.stringify(prdContent),
      });

      // Update project status
      await ctx.runMutation(internal.prdProjects.updateStatusInternal, {
        projectId: args.projectId,
        status: "completed",
        currentStep: 5,
      });

      // Increment user's PRD count
      await ctx.runMutation(internal.users.incrementPrdsGenerated, {
        userId: user._id,
      });

      // Decrement user's credits
      await ctx.runMutation(internal.users.decrementCredits, {
        userId: user._id,
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

// Create share link (action - can use Node.js crypto)
export const createShareLink = action({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    await requirePrdOwnership(ctx, args.prdId);

    // Generate unique token
    const shareToken = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.runMutation(internal.prd.setShareLink, {
      prdId: args.prdId,
      shareToken,
      shareExpiresAt: expiresAt,
    });

    return {
      shareToken,
      expiresAt,
    };
  },
});

// Revoke share link (action)
export const revokeShareLink = action({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    await requirePrdOwnership(ctx, args.prdId);

    await ctx.runMutation(internal.prd.clearShareLink, {
      prdId: args.prdId,
    });

    return { success: true };
  },
});

// Export as JSON
export const exportJSON = action({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    const { prd } = await requirePrdOwnership(ctx, args.prdId);

    // Parse content to get product name
    const content = JSON.parse(prd.content);
    const productName = content.projectOverview?.productName || "PRD";

    // Mark as exported
    await ctx.runMutation(internal.prd.markExported, { prdId: args.prdId });

    return {
      content: prd.content,
      filename: `${productName.replace(/[^a-zA-Z0-9]/g, "-")}-PRD.json`,
    };
  },
});

// Export as Markdown
export const exportMarkdown = action({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    const { prd } = await requirePrdOwnership(ctx, args.prdId);

    const content = JSON.parse(prd.content);
    const markdown = prdToMarkdown(content);
    const productName = content.projectOverview?.productName || "PRD";

    // Mark as exported
    await ctx.runMutation(internal.prd.markExported, { prdId: args.prdId });

    return {
      content: markdown,
      filename: `${productName.replace(/[^a-zA-Z0-9]/g, "-")}-PRD.md`,
    };
  },
});
