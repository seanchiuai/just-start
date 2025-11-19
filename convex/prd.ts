import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { generatePRD } from "./ai/claude";

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

// Generate PRD using Claude
export const generate = action({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    // Get all project context
    const [project, questionSet, techStack, compatibility] = await Promise.all([
      ctx.runQuery(internal.prdProjects.getInternal, {
        projectId: args.projectId,
      }),
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

    if (!project) {
      throw new Error("Project not found");
    }

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
        userId: project.userId,
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
        userId: project.userId,
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

// ============ Sharing Functions ============

// Create share link
export const createShareLink = mutation({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const prd = await ctx.db.get(args.prdId);
    if (!prd) throw new Error("PRD not found");

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || prd.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Generate unique token
    const shareToken = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.patch(args.prdId, {
      shareToken,
      shareExpiresAt: expiresAt,
    });

    return {
      shareToken,
      expiresAt,
    };
  },
});

// Revoke share link
export const revokeShareLink = mutation({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const prd = await ctx.db.get(args.prdId);
    if (!prd) throw new Error("PRD not found");

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || prd.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.prdId, {
      shareToken: undefined,
      shareExpiresAt: undefined,
    });

    return { success: true };
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

// ============ Export Functions ============

// Export as JSON
export const exportJSON = action({
  args: { prdId: v.id("prds") },
  handler: async (ctx, args) => {
    const prd = await ctx.runQuery(internal.prd.getInternal, { prdId: args.prdId });

    if (!prd) {
      throw new Error("PRD not found");
    }

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
    const prd = await ctx.runQuery(internal.prd.getInternal, { prdId: args.prdId });

    if (!prd) {
      throw new Error("PRD not found");
    }

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

// ============ Helper Functions ============

function generateToken(): string {
  // Generate random token
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Convert PRD content to Markdown
function prdToMarkdown(prd: {
  projectOverview?: { productName?: string; description?: string; targetAudience?: string };
  purposeAndGoals?: { problemStatement?: string; solution?: string; keyObjectives?: string[] };
  userPersonas?: Array<{ name?: string; description?: string; useCases?: string[] }>;
  techStack?: Record<string, { technology?: string; reasoning?: string; pros?: string[]; cons?: string[] }>;
  features?: {
    mvpFeatures?: Array<{ name?: string; description?: string; priority?: string; acceptanceCriteria?: string[] }>;
    niceToHaveFeatures?: Array<{ name?: string; description?: string; priority?: string }>;
    outOfScope?: string[];
  };
  technicalArchitecture?: {
    systemDesign?: string;
    dataModels?: Array<{ modelName?: string; fields?: string[]; relationships?: string[] }>;
    apiStructure?: string;
    thirdPartyIntegrations?: string[];
  };
  uiUxConsiderations?: { designApproach?: string; keyUserFlows?: string[]; styleGuidelines?: string };
}): string {
  const sections: string[] = [];

  // Title
  sections.push(`# ${prd.projectOverview?.productName || "Product Requirements Document"}\n`);

  // Project Overview
  if (prd.projectOverview) {
    sections.push("## Project Overview\n");
    sections.push(`${prd.projectOverview.description || ""}\n`);
    if (prd.projectOverview.targetAudience) {
      sections.push(`**Target Audience:** ${prd.projectOverview.targetAudience}\n`);
    }
  }

  // Purpose & Goals
  if (prd.purposeAndGoals) {
    sections.push("## Purpose & Goals\n");
    if (prd.purposeAndGoals.problemStatement) {
      sections.push("### Problem Statement\n");
      sections.push(`${prd.purposeAndGoals.problemStatement}\n`);
    }
    if (prd.purposeAndGoals.solution) {
      sections.push("### Solution\n");
      sections.push(`${prd.purposeAndGoals.solution}\n`);
    }
    if (prd.purposeAndGoals.keyObjectives?.length) {
      sections.push("### Key Objectives\n");
      sections.push(prd.purposeAndGoals.keyObjectives.map((o) => `- ${o}`).join("\n") + "\n");
    }
  }

  // User Personas
  if (prd.userPersonas?.length) {
    sections.push("## User Personas\n");
    for (const persona of prd.userPersonas) {
      sections.push(`### ${persona.name || "Persona"}\n`);
      sections.push(`${persona.description || ""}\n`);
      if (persona.useCases?.length) {
        sections.push("**Use Cases:**\n");
        sections.push(persona.useCases.map((u) => `- ${u}`).join("\n") + "\n");
      }
    }
  }

  // Tech Stack
  if (prd.techStack) {
    sections.push("## Tech Stack\n");
    for (const [category, tech] of Object.entries(prd.techStack)) {
      if (tech && typeof tech === "object") {
        sections.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`);
        sections.push(`**${tech.technology || "Unknown"}**\n`);
        if (tech.reasoning) {
          sections.push(`${tech.reasoning}\n`);
        }
        if (tech.pros?.length) {
          sections.push("**Pros:**\n");
          sections.push(tech.pros.map((p) => `- ${p}`).join("\n") + "\n");
        }
        if (tech.cons?.length) {
          sections.push("**Cons:**\n");
          sections.push(tech.cons.map((c) => `- ${c}`).join("\n") + "\n");
        }
      }
    }
  }

  // Features
  if (prd.features) {
    sections.push("## Features\n");

    if (prd.features.mvpFeatures?.length) {
      sections.push("### MVP Features\n");
      for (const feature of prd.features.mvpFeatures) {
        sections.push(`#### ${feature.name || "Feature"}\n`);
        sections.push(`${feature.description || ""}\n`);
        if (feature.priority) {
          sections.push(`**Priority:** ${feature.priority}\n`);
        }
        if (feature.acceptanceCriteria?.length) {
          sections.push("**Acceptance Criteria:**\n");
          sections.push(feature.acceptanceCriteria.map((a) => `- ${a}`).join("\n") + "\n");
        }
      }
    }

    if (prd.features.niceToHaveFeatures?.length) {
      sections.push("### Nice-to-Have Features\n");
      for (const feature of prd.features.niceToHaveFeatures) {
        sections.push(`- **${feature.name || "Feature"}**: ${feature.description || ""}\n`);
      }
    }

    if (prd.features.outOfScope?.length) {
      sections.push("### Out of Scope\n");
      sections.push(prd.features.outOfScope.map((o) => `- ${o}`).join("\n") + "\n");
    }
  }

  // Technical Architecture
  if (prd.technicalArchitecture) {
    sections.push("## Technical Architecture\n");

    if (prd.technicalArchitecture.systemDesign) {
      sections.push("### System Design\n");
      sections.push(`${prd.technicalArchitecture.systemDesign}\n`);
    }

    if (prd.technicalArchitecture.dataModels?.length) {
      sections.push("### Data Models\n");
      for (const model of prd.technicalArchitecture.dataModels) {
        sections.push(`#### ${model.modelName || "Model"}\n`);
        if (model.fields?.length) {
          sections.push("**Fields:**\n");
          sections.push(model.fields.map((f) => `- ${f}`).join("\n") + "\n");
        }
        if (model.relationships?.length) {
          sections.push("**Relationships:**\n");
          sections.push(model.relationships.map((r) => `- ${r}`).join("\n") + "\n");
        }
      }
    }

    if (prd.technicalArchitecture.apiStructure) {
      sections.push("### API Structure\n");
      sections.push(`${prd.technicalArchitecture.apiStructure}\n`);
    }

    if (prd.technicalArchitecture.thirdPartyIntegrations?.length) {
      sections.push("### Third-Party Integrations\n");
      sections.push(prd.technicalArchitecture.thirdPartyIntegrations.map((i) => `- ${i}`).join("\n") + "\n");
    }
  }

  // UI/UX Considerations
  if (prd.uiUxConsiderations) {
    sections.push("## UI/UX Considerations\n");

    if (prd.uiUxConsiderations.designApproach) {
      sections.push("### Design Approach\n");
      sections.push(`${prd.uiUxConsiderations.designApproach}\n`);
    }

    if (prd.uiUxConsiderations.keyUserFlows?.length) {
      sections.push("### Key User Flows\n");
      sections.push(prd.uiUxConsiderations.keyUserFlows.map((f, i) => `${i + 1}. ${f}`).join("\n") + "\n");
    }

    if (prd.uiUxConsiderations.styleGuidelines) {
      sections.push("### Style Guidelines\n");
      sections.push(`${prd.uiUxConsiderations.styleGuidelines}\n`);
    }
  }

  // Footer
  sections.push("\n---\n*Generated by Just Start*");

  return sections.join("\n");
}
