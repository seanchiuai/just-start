import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// Clerk webhook endpoint
http.route({
  path: "/clerk/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      // Log detailed error for monitoring without exposing to caller
      console.error("[Webhook Error] CLERK_WEBHOOK_SECRET not configured in environment");
      // TODO: Send to monitoring system (e.g., Sentry.captureMessage)
      return new Response("Internal server error", { status: 500 });
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await req.text();
    const wh = new Webhook(webhookSecret);

    let event: {
      type: string;
      data: {
        id: string;
        email_addresses: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
        image_url?: string;
      };
    };

    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as typeof event;
    } catch (error) {
      // Log security event for monitoring
      console.error("[Webhook Security] Signature verification failed", {
        timestamp: new Date().toISOString(),
        svixId: svixId || "missing",
        reason: "Invalid signature",
      });
      // TODO: Send to monitoring system (e.g., Sentry.captureMessage with context)
      return new Response("Invalid signature", { status: 400 });
    }

    const { type, data } = event;

    try {
      if (type === "user.created" || type === "user.updated") {
        const email = data.email_addresses[0]?.email_address ?? "";
        const name = [data.first_name, data.last_name]
          .filter(Boolean)
          .join(" ") || undefined;

        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: data.id,
          email,
          name,
          imageUrl: data.image_url,
        });
      } else if (type === "user.deleted") {
        await ctx.runMutation(internal.users.deleteByClerkId, {
          clerkId: data.id,
        });
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      // Log mutation error with context
      console.error("[Webhook Error] Mutation failed", {
        timestamp: new Date().toISOString(),
        eventType: type,
        clerkId: data.id,
        error: error instanceof Error ? error.message : String(error),
      });
      // TODO: Send to monitoring system (e.g., Sentry.captureException with context)
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;
