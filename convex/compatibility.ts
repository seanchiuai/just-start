import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { validateCompatibility } from "./ai/perplexity";
import { analyzeCompatibilityIssues } from "./ai/claude";

// Get compatibility check for a project (public)
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
      .query("compatibilityChecks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// Internal query for actions
export const getByProjectInternal = internalQuery({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("compatibilityChecks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// Save compatibility check results (internal)
export const save = internalMutation({
  args: {
    projectId: v.id("prdProjects"),
    status: v.union(
      v.literal("approved"),
      v.literal("warnings"),
      v.literal("critical")
    ),
    issues: v.array(
      v.object({
        severity: v.union(
          v.literal("critical"),
          v.literal("moderate"),
          v.literal("low")
        ),
        component: v.string(),
        issue: v.string(),
        recommendation: v.string(),
      })
    ),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if check already exists for this project
    const existing = await ctx.db
      .query("compatibilityChecks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (existing) {
      // Update existing check
      await ctx.db.patch(existing._id, {
        status: args.status,
        issues: args.issues,
        summary: args.summary,
        checkedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new check
    return await ctx.db.insert("compatibilityChecks", {
      projectId: args.projectId,
      status: args.status,
      issues: args.issues,
      summary: args.summary,
      checkedAt: Date.now(),
    });
  },
});

// Acknowledge warnings and proceed
export const acknowledgeWarnings = mutation({
  args: { projectId: v.id("prdProjects") },
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

    // Get compatibility check
    const check = await ctx.db
      .query("compatibilityChecks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (!check) {
      throw new Error("Compatibility check not found");
    }

    if (check.status === "critical") {
      throw new Error("Cannot proceed with critical issues");
    }

    // Update project status to validation complete
    await ctx.db.patch(args.projectId, {
      status: "validation",
      currentStep: 5,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Validate tech stack compatibility
export const validate = action({
  args: { projectId: v.id("prdProjects") },
  handler: async (ctx, args) => {
    // Get tech stack recommendations
    const techStack = await ctx.runQuery(internal.techStack.getByProjectInternal, {
      projectId: args.projectId,
    });

    if (!techStack || !techStack.confirmedStack) {
      throw new Error("Confirmed tech stack not found");
    }

    const stack = techStack.confirmedStack;

    // Update progress
    await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
      projectId: args.projectId,
      stage: "validating_compatibility",
      progress: 10,
      message: "Checking version compatibility...",
    });

    try {
      // Research compatibility with Perplexity
      const research = await validateCompatibility(stack);

      // Update progress
      await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
        projectId: args.projectId,
        stage: "validating_compatibility",
        progress: 50,
        message: "Analyzing potential issues...",
      });

      // Analyze issues with Claude
      const issues = await analyzeCompatibilityIssues(stack, research);

      // Determine status
      const hasCritical = issues.some((i) => i.severity === "critical");
      const hasModerate = issues.some((i) => i.severity === "moderate");
      const status = hasCritical
        ? "critical"
        : hasModerate
          ? "warnings"
          : "approved";

      // Generate summary
      const summary = generateSummary(status, issues);

      // Update progress
      await ctx.runMutation(internal.prdProjects.updateGenerationStatus, {
        projectId: args.projectId,
        stage: "validating_compatibility",
        progress: 90,
        message: "Generating report...",
      });

      // Save results
      await ctx.runMutation(internal.compatibility.save, {
        projectId: args.projectId,
        status,
        issues,
        summary,
      });

      // Update project status if not critical
      if (status !== "critical") {
        await ctx.runMutation(internal.prdProjects.updateStatusInternal, {
          projectId: args.projectId,
          status: "validation",
          currentStep: 5,
        });
      }

      // Clear generation status
      await ctx.runMutation(internal.prdProjects.clearGenerationStatus, {
        projectId: args.projectId,
      });

      return { success: true, status, issueCount: issues.length };
    } catch (error) {
      // Clear generation status on error
      await ctx.runMutation(internal.prdProjects.clearGenerationStatus, {
        projectId: args.projectId,
      });

      throw error;
    }
  },
});

// Generate summary based on status and issues
function generateSummary(
  status: "approved" | "warnings" | "critical",
  issues: Array<{
    severity: "critical" | "moderate" | "low";
    component: string;
    issue: string;
    recommendation: string;
  }>
): string {
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const moderateCount = issues.filter((i) => i.severity === "moderate").length;
  const lowCount = issues.filter((i) => i.severity === "low").length;

  if (status === "approved") {
    if (issues.length === 0) {
      return "Your tech stack is fully compatible with no issues detected.";
    }
    return `Your tech stack is compatible with ${lowCount} minor note${lowCount !== 1 ? "s" : ""} to consider.`;
  }

  if (status === "warnings") {
    return `Found ${moderateCount} warning${moderateCount !== 1 ? "s" : ""} and ${lowCount} minor issue${lowCount !== 1 ? "s" : ""}. You can proceed, but consider addressing the warnings.`;
  }

  return `Found ${criticalCount} critical issue${criticalCount !== 1 ? "s" : ""} that must be resolved before proceeding. Please modify your tech stack selection.`;
}
