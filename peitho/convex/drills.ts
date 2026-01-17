import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all drills
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("drills").collect();
  },
});

// Get drills by type
export const listByType = query({
  args: {
    type: v.union(
      v.literal("linking_words"),
      v.literal("punch_practice"),
      v.literal("rhythm_reps"),
      v.literal("compression"),
      v.literal("custom")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("drills")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

// Get a single drill
export const get = query({
  args: { id: v.id("drills") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a drill
export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("linking_words"),
      v.literal("punch_practice"),
      v.literal("rhythm_reps"),
      v.literal("compression"),
      v.literal("custom")
    ),
    instructions: v.string(),
    durationSeconds: v.number(),
    exampleClipUrl: v.optional(v.string()),
    frameworkIds: v.array(v.id("frameworks")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("drills", args);
  },
});

// Update a drill
export const update = mutation({
  args: {
    id: v.id("drills"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("linking_words"),
        v.literal("punch_practice"),
        v.literal("rhythm_reps"),
        v.literal("compression"),
        v.literal("custom")
      )
    ),
    instructions: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    exampleClipUrl: v.optional(v.string()),
    frameworkIds: v.optional(v.array(v.id("frameworks"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Delete a drill
export const remove = mutation({
  args: { id: v.id("drills") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
