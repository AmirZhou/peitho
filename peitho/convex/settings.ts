import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get settings (without API key)
export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    if (!settings) {
      return {
        domains: ["coding", "running"],
        defaultSessionMinutes: 90,
        streakCount: 0,
        lastSessionDate: null,
        hasApiKey: false,
      };
    }
    const { openaiApiKey, ...rest } = settings;
    return { ...rest, hasApiKey: !!openaiApiKey };
  },
});

// Get API key (for client-side use only)
export const getApiKey = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings?.openaiApiKey ?? null;
  },
});

// Save API key
export const saveApiKey = mutation({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();

    if (existing) {
      await ctx.db.patch(existing._id, { openaiApiKey: args.apiKey });
    } else {
      await ctx.db.insert("settings", {
        openaiApiKey: args.apiKey,
        domains: ["coding", "running"],
        defaultSessionMinutes: 90,
        streakCount: 0,
      });
    }
  },
});

// Clear API key
export const clearApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { openaiApiKey: undefined });
    }
  },
});

// Update settings
export const update = mutation({
  args: {
    domains: v.optional(v.array(v.string())),
    defaultSessionMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("settings", {
        domains: args.domains ?? ["coding", "running"],
        defaultSessionMinutes: args.defaultSessionMinutes ?? 90,
        streakCount: 0,
      });
    }
  },
});

// Update streak
export const updateStreak = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();

    if (!existing) {
      await ctx.db.insert("settings", {
        domains: ["coding", "running"],
        defaultSessionMinutes: 90,
        streakCount: 1,
        lastSessionDate: args.date,
      });
      return 1;
    }

    const lastDate = existing.lastSessionDate;
    const today = new Date(args.date);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = 1;
    if (lastDate === yesterdayStr) {
      // Continuing streak
      newStreak = (existing.streakCount || 0) + 1;
    } else if (lastDate === args.date) {
      // Same day, keep current streak
      newStreak = existing.streakCount || 1;
    }

    await ctx.db.patch(existing._id, {
      streakCount: newStreak,
      lastSessionDate: args.date,
    });

    return newStreak;
  },
});
