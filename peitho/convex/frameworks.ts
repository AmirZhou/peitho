import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all frameworks
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("frameworks").collect();
  },
});

// Get frameworks by domain
export const listByDomain = query({
  args: { domain: v.union(v.literal("universal"), v.literal("coding"), v.literal("running")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("frameworks")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .collect();
  },
});

// Get a single framework
export const get = query({
  args: { id: v.id("frameworks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a framework
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    pattern: v.string(),
    examples: v.array(v.string()),
    tags: v.array(v.string()),
    source: v.string(),
    domain: v.union(v.literal("universal"), v.literal("coding"), v.literal("running")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("frameworks", args);
  },
});

// Update a framework
export const update = mutation({
  args: {
    id: v.id("frameworks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    pattern: v.optional(v.string()),
    examples: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    domain: v.optional(v.union(v.literal("universal"), v.literal("coding"), v.literal("running"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Delete a framework
export const remove = mutation({
  args: { id: v.id("frameworks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
