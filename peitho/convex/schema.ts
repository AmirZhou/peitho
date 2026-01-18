import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Framework library - the 14 core frameworks
  frameworks: defineTable({
    name: v.string(),
    description: v.string(),
    pattern: v.string(),
    examples: v.array(v.string()),
    tags: v.array(v.string()),
    source: v.string(), // dan_koe, naval, hormozi, fireship, t3gg, prime, hotz, original, new
    domain: v.union(v.literal("universal"), v.literal("coding"), v.literal("running")),
  })
    .index("by_domain", ["domain"])
    .index("by_source", ["source"]),

  // Micro-exercises for drill practice
  drills: defineTable({
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
  }).index("by_type", ["type"]),

  // Drill practice sessions (recordings of drill attempts)
  drillSessions: defineTable({
    drillId: v.id("drills"),
    recordingId: v.id("_storage"),
    durationSeconds: v.number(),
    completedAt: v.number(), // timestamp
    transcript: v.optional(v.string()),
    evaluation: v.optional(v.string()),
  })
    .index("by_drill", ["drillId"])
    .index("by_date", ["completedAt"]),

  // Style examples - clips, writing samples, vocabulary
  styleExamples: defineTable({
    type: v.union(
      v.literal("speaking_clip"),
      v.literal("writing_sample"),
      v.literal("vocabulary")
    ),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    frameworkIds: v.array(v.id("frameworks")),
    source: v.string(), // dan_koe, t3gg, prime, fireship, hormozi, naval, hotz, self
    annotations: v.string(),
  })
    .index("by_type", ["type"])
    .index("by_source", ["source"]),

  // Daily practice sessions
  sessions: defineTable({
    date: v.string(), // YYYY-MM-DD
    domain: v.union(v.literal("coding"), v.literal("running")),
    promptUsed: v.string(),
    frameworksUsed: v.array(v.id("frameworks")),
    recordingIds: v.array(v.id("_storage")),
    winNote: v.string(),
    improveNote: v.string(),
    durationMinutes: v.number(),
    // AI feedback (on-demand)
    transcript: v.optional(v.string()),
    evaluation: v.optional(v.string()), // JSON string of EvaluationResult
  })
    .index("by_date", ["date"])
    .index("by_domain", ["domain"]),

  // Creators for style study
  creators: defineTable({
    name: v.string(),
    platform: v.union(
      v.literal("youtube"),
      v.literal("linkedin"),
      v.literal("twitter"),
      v.literal("podcast"),
      v.literal("multiple")
    ),
    links: v.array(v.string()),
    styleNotes: v.string(),
    signatureMoves: v.array(v.string()),
    tier: v.union(
      v.literal("primary"),
      v.literal("secondary"),
      v.literal("domain_specific")
    ),
  }).index("by_tier", ["tier"]),

  // Transcripts for style study
  transcripts: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    sourceUrl: v.string(),
    content: v.string(),
    frameworkTags: v.array(v.id("frameworks")),
    techniqueTags: v.array(v.string()),
    annotations: v.string(),
  }).index("by_creator", ["creatorId"]),

  // Imitation reps - your rewrites of transcripts
  imitationReps: defineTable({
    transcriptId: v.id("transcripts"),
    content: v.string(),
    notes: v.string(),
    createdAt: v.number(),
  }).index("by_transcript", ["transcriptId"]),

  // Resources - additional content bank
  resources: defineTable({
    title: v.string(),
    type: v.union(
      v.literal("transcript"),
      v.literal("article"),
      v.literal("video_link")
    ),
    content: v.string(),
    tags: v.array(v.string()),
    frameworkIds: v.array(v.id("frameworks")),
  }).index("by_type", ["type"]),

  // User settings
  settings: defineTable({
    openaiApiKey: v.optional(v.string()), // encrypted client-side
    domains: v.array(v.string()),
    defaultSessionMinutes: v.number(),
    streakCount: v.number(),
    lastSessionDate: v.optional(v.string()),
  }),

  // Generated prompts history (to avoid repetition)
  promptHistory: defineTable({
    prompt: v.string(),
    domain: v.string(),
    frameworkIds: v.array(v.id("frameworks")),
    usedAt: v.number(),
  }).index("by_domain", ["domain"]),
});
