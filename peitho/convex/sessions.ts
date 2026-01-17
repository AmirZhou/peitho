import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all sessions
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sessions").order("desc").collect();
  },
});

// Get sessions by date
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();
  },
});

// Get recent sessions (last N)
export const recent = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.query("sessions").order("desc").take(args.limit);
  },
});

// Create a session
export const create = mutation({
  args: {
    date: v.string(),
    domain: v.union(v.literal("coding"), v.literal("running")),
    promptUsed: v.string(),
    frameworksUsed: v.array(v.id("frameworks")),
    recordingIds: v.array(v.id("_storage")),
    winNote: v.string(),
    improveNote: v.string(),
    durationMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", args);
  },
});

// Update a session
export const update = mutation({
  args: {
    id: v.id("sessions"),
    winNote: v.optional(v.string()),
    improveNote: v.optional(v.string()),
    recordingIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Get streak count
export const getStreak = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").order("desc").take(100);

    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].date);
      sessionDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (sessionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0 && sessionDate.getTime() === today.getTime() - 86400000) {
        // Yesterday counts too if we haven't done today yet
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },
});
