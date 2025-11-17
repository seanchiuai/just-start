import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { api } from "./_generated/api";

export const getChatResponse = action({
  args: {
    userMessage: v.string(),
    projectId: v.optional(v.string()),
    conversationHistory: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args): Promise<{
    response: string;
    bookmarkIds: string[];
    suggestedMemories?: Array<{ key: string; value: string }>;
  }> => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Unauthorized");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get user memory/preferences
    const userMemories = await ctx.runQuery(api.memory.getUserMemories);

    // Build context
    const memoriesContext = userMemories
      .map((m) => `${m.key}: ${m.value}`)
      .join("\n");

    // System prompt (simplified without bookmark context for now)
    const systemPrompt = `You are a helpful AI assistant for a bookmark manager. Your job is to help users find and organize their saved bookmarks.

User's saved interests and preferences:
${memoriesContext || "None yet"}

Guidelines:
- Be concise and friendly (2-3 sentences max)
- If you notice patterns in user interests, you can suggest new memories to save
- Help users organize their thoughts and bookmarks`;

    // Get GPT response
    let response: string;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...(args.conversationHistory || []).slice(-10), // Last 10 messages
          { role: "user", content: args.userMessage },
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      response = completion.choices[0].message.content || "I couldn't generate a response.";
    } catch (error: any) {
      if (error.status === 429) {
        response = "I'm a bit overloaded right now. Please try again in a moment.";
      } else if (error.status === 401) {
        response = "Authentication error. Please contact support.";
      } else {
        response = "Sorry, I encountered an error. Please try again.";
      }
    }

    // Save chat messages
    await ctx.runMutation(api.chatMessages.saveMessage, {
      role: "user",
      content: args.userMessage,
      projectId: args.projectId,
    });

    await ctx.runMutation(api.chatMessages.saveMessage, {
      role: "assistant",
      content: response,
      projectId: args.projectId,
    });

    return {
      response,
      bookmarkIds: [], // TODO: Add RAG bookmark search
    };
  },
});
