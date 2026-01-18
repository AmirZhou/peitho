import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get recent prompts to avoid repetition
export const recent = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promptHistory")
      .order("desc")
      .take(args.limit);
  },
});

// Get recent prompts by domain
export const recentByDomain = query({
  args: { domain: v.string(), limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promptHistory")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .order("desc")
      .take(args.limit);
  },
});

// Save a generated prompt
export const save = mutation({
  args: {
    prompt: v.string(),
    domain: v.string(),
    frameworkIds: v.array(v.id("frameworks")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("promptHistory", {
      ...args,
      usedAt: Date.now(),
    });
  },
});

// Get all frameworks for prompt generation context
export const getFrameworksForPrompt = query({
  args: { domain: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.domain && args.domain !== "random") {
      // Get domain-specific + universal frameworks
      const domainFrameworks = await ctx.db
        .query("frameworks")
        .withIndex("by_domain", (q) => q.eq("domain", args.domain as "coding" | "running"))
        .collect();

      const universalFrameworks = await ctx.db
        .query("frameworks")
        .withIndex("by_domain", (q) => q.eq("domain", "universal"))
        .collect();

      return [...universalFrameworks, ...domainFrameworks];
    }

    return await ctx.db.query("frameworks").collect();
  },
});
