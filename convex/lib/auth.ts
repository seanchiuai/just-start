import { ActionCtx, QueryCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

export async function requireAuth(ctx: ActionCtx | QueryCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Not authenticated");
    }
    return identity;
}

export async function requirePrdOwnership(
    ctx: ActionCtx,
    prdId: Id<"prds">
): Promise<{ identity: Awaited<ReturnType<typeof requireAuth>>; prd: any }> {
    const identity = await requireAuth(ctx);

    const { authorized, prd } = await ctx.runQuery(internal.prd.verifyOwnership, {
        prdId,
        clerkId: identity.subject,
    });

    if (!authorized || !prd) {
        throw new Error("Not authorized");
    }

    return { identity, prd };
}

export async function requireProjectOwnership(
    ctx: ActionCtx,
    projectId: Id<"prdProjects">
): Promise<{ identity: Awaited<ReturnType<typeof requireAuth>>; project: any; user: any }> {
    const identity = await requireAuth(ctx);

    const { authorized, project, user } = await ctx.runQuery(internal.prdProjects.verifyOwnership, {
        projectId,
        clerkId: identity.subject,
    });

    if (!authorized || !project || !user) {
        throw new Error("Not authorized");
    }

    return { identity, project, user };
}
