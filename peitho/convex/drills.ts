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

// ============ Drill Sessions ============

// Create a drill session (save a recording)
export const createSession = mutation({
  args: {
    drillId: v.id("drills"),
    recordingId: v.id("_storage"),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("drillSessions", {
      ...args,
      completedAt: Date.now(),
    });
  },
});

// List all drill sessions
export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("drillSessions")
      .order("desc")
      .collect();

    // Enrich with drill info
    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const drill = await ctx.db.get(session.drillId);
        return {
          ...session,
          drill,
        };
      })
    );

    return enriched;
  },
});

// List sessions for a specific drill
export const listSessionsByDrill = query({
  args: { drillId: v.id("drills") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("drillSessions")
      .withIndex("by_drill", (q) => q.eq("drillId", args.drillId))
      .order("desc")
      .collect();
  },
});

// Get a drill session
export const getSession = query({
  args: { id: v.id("drillSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    if (!session) return null;

    const drill = await ctx.db.get(session.drillId);
    return { ...session, drill };
  },
});

// Update drill session with transcript/evaluation
export const updateSession = mutation({
  args: {
    id: v.id("drillSessions"),
    transcript: v.optional(v.string()),
    evaluation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});
