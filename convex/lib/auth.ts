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
) {
    const identity = await requireAuth(ctx);

    // @ts-expect-error - TypeScript type inference issue with internal API
    const { authorized, prd } = await ctx.runQuery(internal.prd.verifyOwnership, {
        prdId,
        clerkId: identity.subject,
    });

    if (!authorized || !prd) {
        throw new Error("Not authorized");
    }

    return { identity, prd };
}
