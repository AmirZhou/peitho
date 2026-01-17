import { mutation } from "./_generated/server";

const FRAMEWORKS_DATA = [
  {
    name: "Punch-Expand-Ground",
    description: "Basic rhythm pattern — short declarative, explain, return to punchy truth",
    pattern: `1. PUNCH    → Bold claim in 3-8 words
2. QUALIFY  → Preempt objection (1 sentence)
3. EXPAND   → Deliver the actual insight (2-4 sentences)
4. GROUND   → Return to punchy truth-statement`,
    examples: [
      `"You can learn anything in two weeks." (Punch)
"And I know that sounds insane to most people, but I'm not talking about mastering a skill in its entirety." (Qualify)
[Longer explanation with examples] (Expand)
"That's a skill in and of itself." (Ground)`,
    ],
    tags: ["rhythm", "structure", "fundamental"],
    source: "dan_koe",
    domain: "universal" as const,
  },
  {
    name: "Contrarian Opening",
    description: "Shock → Qualify → Reframe. Hooks that stop the scroll.",
    pattern: `1. SHOCK    → A claim that violates conventional wisdom
2. QUALIFY  → Preempt the "that's ridiculous" objection
3. REFRAME  → Shift the frame so the claim becomes obviously true`,
    examples: [
      `"You can learn anything in two weeks." (Shock)
"And I know that sounds insane to most people, but I'm not talking about mastering a skill in its entirety. Obviously, that takes like ten years." (Qualify)
"I'm talking about making substantial progress toward a goal in your life." (Reframe)`,
    ],
    tags: ["hook", "opening", "contrarian"],
    source: "dan_koe",
    domain: "universal" as const,
  },
  {
    name: "Reset Words / Transitions",
    description: "Controlling pace and attention with strategic transition phrases",
    pattern: `Key transitions and their functions:
- "Now," → Major topic pivot; signals new insight incoming
- "So," → Logical consequence; "here's what this means for you"
- "Right?" → Micro-engagement; assumes agreement, invites nodding
- "Think about it." → Commands active processing
- "But" → Contrarian pivot; flips the expected direction
- "Here's the thing" → Authority frame; positions as revealer of hidden truth
- "Again," → Reinforcement; "you need to hear this twice"`,
    examples: [
      `"Now, we just talked about learning how to play the guitar..."`,
      `"So, in other words, you're probably completely wasting every second you spent learning."`,
      `"Think about it. When you are actually playing the guitar, are you like, oh, I'm hitting an E chord?"`,
    ],
    tags: ["transitions", "pacing", "engagement"],
    source: "dan_koe",
    domain: "universal" as const,
  },
  {
    name: "Dopamine Ladder",
    description: "Six levels of engagement that make people unable to stop watching",
    pattern: `1. STIMULATION  → Visual stun gun (1-2 sec)
2. CAPTIVATION  → Pop a question in their head
3. ANTICIPATION → Let them guess, then head fake
4. VALIDATION   → Close the loop with surprise
5. AFFECTION    → Be likable, solve problems
6. REVELATION   → Become their go-to source`,
    examples: [
      `Levels 1-4 = The message
Levels 5-6 = The messenger

If not getting views → Level 1 problem
High impressions but low watch time → Level 2-3 problem
Views but no followers → Level 5-6 problem`,
    ],
    tags: ["engagement", "attention", "structure"],
    source: "original",
    domain: "universal" as const,
  },
  {
    name: "Credibility Signals",
    description: "Why people take you seriously — keep promises, speak confidently, be thoughtful",
    pattern: `Three reasons you're not taken seriously:
1. You don't keep promises (to others AND yourself)
2. You speak without confidence (upspeak, no structure, no CTA)
3. You speak without thought (participation without contribution)

Fixes:
- Downspeak: End sentences with downward tone
- Structure: Know your structure before speaking
- CTA: Tell them exactly what you need`,
    examples: [
      `Weak: "So we wanted to get your thoughts on the presentation?"
Strong: "We want your thoughts on the presentation."`,
      `Weak: "So yeah... that's the analysis."
Strong: "That's the analysis. What we need from you: feedback on section 2."`,
    ],
    tags: ["credibility", "delivery", "authority"],
    source: "original",
    domain: "universal" as const,
  },
  {
    name: "Experience Anchor",
    description: "Grounding opinions in personal stories — your story is your proof",
    pattern: `1. OPINION   → State your take clearly
2. ANCHOR    → Tell the moment that taught you this
3. LESSON    → What you realized from that moment
4. TRANSFER  → Why this applies to them too`,
    examples: [
      `Weak: "Developers should run more. It helps with focus."
Strong: "I was stuck on a bug for three hours. Went for a 5k. Solved it in my head by mile two. Now I run before every hard problem."`,
      `Transition phrases:
- "I learned this the hard way when..."
- "This clicked for me after..."
- "I used to think the opposite, until..."`,
    ],
    tags: ["storytelling", "credibility", "personal"],
    source: "new",
    domain: "universal" as const,
  },
  {
    name: "Technique Stacking",
    description: "Teaching by breaking skills into learnable sub-skills — collect techniques until the skill emerges",
    pattern: `1. PURPOSE   → What are you actually trying to build/do?
2. BLOCKER   → What's the ONE thing stopping you right now?
3. TECHNIQUE → Learn only what unblocks you
4. APPLY     → Use it immediately
5. STACK     → Move to the next blocker, repeat`,
    examples: [
      `You don't "learn React." You learn:
- How to manage state in a component
- How to pass props
- How to handle side effects
- How to structure a project

Stack enough pieces, the picture forms itself.`,
    ],
    tags: ["teaching", "learning", "structure"],
    source: "dan_koe",
    domain: "universal" as const,
  },
  {
    name: "Framework Fusion",
    description: "Combining 2-3 frameworks in one piece — each framework does a job, together they're unstoppable",
    pattern: `Combination Matrix:
- Hook + Credibility → Contrarian Opening → Experience Anchor
- Teach + Engage → Technique Stacking → Dopamine Ladder
- Challenge + Land → Contrarian Opening → Punch-Expand-Ground

Rules:
1. Max 3-4 per piece
2. Lead with hook frameworks
3. Build with structure frameworks
4. Land with punch frameworks
5. Don't force it`,
    examples: [
      `[CONTRARIAN OPENING] "The best code I ever wrote got deleted six months later."
[EXPERIENCE ANCHOR] "I spent two weeks on a caching layer..."
[TECHNIQUE STACKING] "Three techniques senior devs use..."
[PUNCH] "The best code isn't code you write. It's code you prevent."`,
    ],
    tags: ["advanced", "combination", "structure"],
    source: "new",
    domain: "universal" as const,
  },
  {
    name: "Rant Structure",
    description: "Structured frustration that teaches — opinions without structure are noise",
    pattern: `1. TRIGGER    → The specific thing that set you off
2. ESCALATE   → Why this is worse than it looks
3. ROOT CAUSE → The real reason this keeps happening
4. STANDARD   → What it should be instead
5. CHALLENGE  → What you want the audience to do/think`,
    examples: [
      `[TRIGGER] "Someone asked why their code wasn't working. The error literally said 'Cannot read property of undefined on line 47.' They didn't read it."
[ESCALATE] "This isn't one person. This is an epidemic."
[ROOT CAUSE] "Tutorials don't fail. You never see the instructor debug."
[STANDARD] "Read it fully, Google the exact text, then ask for help. In that order."
[CHALLENGE] "Next time you get an error, read every word."`,
    ],
    tags: ["opinion", "teaching", "energy"],
    source: "t3gg",
    domain: "coding" as const,
  },
  {
    name: "Coach Voice",
    description: "Coaching content that changes behavior — tell them how it should feel, not just what to do",
    pattern: `1. DIAGNOSIS → Name exactly what they're doing wrong
2. REFRAME   → Why their instinct makes sense but doesn't work
3. CUE       → One specific thing to try (physical or mental)
4. FEEL      → What success feels like when they get it right`,
    examples: [
      `[DIAGNOSIS] "You're reaching with your foot. Landing ahead of your body, heel first."
[REFRAME] "Your brain thinks longer strides = faster. It's intuitive. It's also wrong."
[CUE] "Think about your feet landing underneath your hips. Like running on hot coals."
[FEEL] "When you get this right, it feels like falling forward. Less effort, not more."`,
    ],
    tags: ["coaching", "teaching", "physical"],
    source: "new",
    domain: "running" as const,
  },
  {
    name: "Compression Test",
    description: "Complete ideas in one sentence — if you can't say it in one sentence, you don't understand it yet",
    pattern: `1. COMPRESS  → Force the idea into one sentence
2. LEAD      → Open with that sentence
3. EXPAND    → Only add context if necessary
4. CALLBACK  → End by repeating the compression`,
    examples: [
      `"Escape competition through authenticity."
"Read what you love until you love to read."
"Specific knowledge is found by pursuing your genuine curiosity."

Before: "So one thing I've learned over time is that when you're trying to build an audience..."
After: "You can't beat someone at being themselves. Stop copying."`,
    ],
    tags: ["clarity", "writing", "compression"],
    source: "naval",
    domain: "universal" as const,
  },
  {
    name: "Math Breakdown",
    description: "Using numbers to make points undeniable — opinions are debatable, math isn't",
    pattern: `1. CLAIM     → State what you believe
2. QUANTIFY  → Attach numbers to it
3. CALCULATE → Show the math step by step
4. CONTRAST  → Compare to what most people do
5. CONCLUDE  → Make the obvious conclusion`,
    examples: [
      `"If you post once a day for a year, that's 365 pieces. If 1% go viral, that's 3-4 breakout moments. Most people quit at 30 posts. They never gave the math a chance to work."

Types that work:
- Time math: "2 hours/day × 365 = 730 hours/year"
- Money math: "At $50/hour, that bug cost $500"
- Probability: "1% chance × 100 attempts = near certainty"`,
    ],
    tags: ["persuasion", "credibility", "numbers"],
    source: "hormozi",
    domain: "universal" as const,
  },
  {
    name: "Speed Stack",
    description: "Density and pacing — treat every second like it costs attention",
    pattern: `1. HOOK    → First sentence is the payoff preview (2 sec)
2. CONTEXT → Minimum viable background (5-10 sec)
3. MEAT    → Core content, rapid-fire (bulk of time)
4. LAND    → Compressed takeaway (5 sec)

Word audit — cut these:
- "Basically" → Adds nothing
- "Just" → Weakens the point
- "So," (at start) → Throat-clearing`,
    examples: [
      `No intro. No filler. No wasted frames.
Every sentence delivers information. Every cut serves a purpose.

Speed modulation:
- Background info → Fast
- Key insight → Slow down
- List of items → Rapid-fire
- The one thing to remember → Pause. Emphasize.`,
    ],
    tags: ["pacing", "density", "editing"],
    source: "fireship",
    domain: "universal" as const,
  },
  {
    name: "Think-Aloud",
    description: "Showing the messy thinking process — polished shows the answer, raw shows the thinking",
    pattern: `1. STATE THE PROBLEM → What are we trying to solve?
2. FIRST INSTINCT    → What's the obvious approach?
3. OBSTACLE          → Why doesn't that work?
4. PIVOT             → What does that tell us to try next?
5. RESOLUTION        → What finally worked (or didn't)`,
    examples: [
      `[PROBLEM] "App's getting slower over time. Smells like a memory leak."
[INSTINCT] "Let me check the useEffect cleanup... Nope, that's fine."
[OBSTACLE] "Okay, it's not the obvious thing. Let me open the profiler..."
[PIVOT] "Wait. I'm storing callbacks in a ref but never clearing them."
[RESOLUTION] "Fixed by clearing the ref in cleanup."

The audience learns the process, not just the fix.`,
    ],
    tags: ["authenticity", "teaching", "process"],
    source: "hotz",
    domain: "coding" as const,
  },
];

const DRILLS_DATA = [
  {
    name: "Linking Words Flow",
    type: "linking_words" as const,
    instructions: `Use "Now," "So," "Here's the thing," "Right?" naturally in a 60-second take on any topic.

Rules:
- Must use at least 3 different transition words
- They should feel natural, not forced
- Record yourself and listen back — do the transitions smooth the flow or interrupt it?`,
    durationSeconds: 60,
  },
  {
    name: "8-Word Punch",
    type: "punch_practice" as const,
    instructions: `State your opinion in 8 words or fewer. Then expand for 30 seconds. Then punch again with a different 8-word summary.

Structure:
1. Punch (8 words max)
2. Expand (30 seconds)
3. Different punch (8 words max)

The two punches should say the same thing differently.`,
    durationSeconds: 45,
  },
  {
    name: "Triple Delivery",
    type: "rhythm_reps" as const,
    instructions: `Deliver the same 30-second insight three different ways:

1. Slow and deliberate (teacher mode)
2. Fast and energetic (hype mode)
3. Casual and conversational (friend mode)

Feel how the same words land differently with different energy.`,
    durationSeconds: 120,
  },
  {
    name: "One Sentence Challenge",
    type: "compression" as const,
    instructions: `Take any complex idea you know well. Explain it in:

1. One paragraph (30 seconds)
2. One sentence (under 15 words)
3. One phrase (under 5 words)

The phrase should be quotable. If it's not, your understanding isn't clear enough.`,
    durationSeconds: 90,
  },
  {
    name: "Contrarian Reps",
    type: "punch_practice" as const,
    instructions: `Generate 5 contrarian openings on the spot:

1. State a common belief in your domain
2. Flip it to the contrarian take
3. Say the shock statement out loud

Examples:
- Common: "Code should be DRY"
- Contrarian: "Duplication is cheaper than the wrong abstraction"

Do 5 in a row without stopping.`,
    durationSeconds: 120,
  },
];

export const seedFrameworks = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("frameworks").first();
    if (existing) {
      return { status: "already_seeded", count: 0 };
    }

    // Seed frameworks
    for (const framework of FRAMEWORKS_DATA) {
      await ctx.db.insert("frameworks", framework);
    }

    return { status: "success", count: FRAMEWORKS_DATA.length };
  },
});

export const seedDrills = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("drills").first();
    if (existing) {
      return { status: "already_seeded", count: 0 };
    }

    // Seed drills (without framework IDs for now)
    for (const drill of DRILLS_DATA) {
      await ctx.db.insert("drills", {
        ...drill,
        frameworkIds: [],
      });
    }

    return { status: "success", count: DRILLS_DATA.length };
  },
});

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      frameworks: { status: "skipped", count: 0 },
      drills: { status: "skipped", count: 0 },
    };

    // Seed frameworks
    const existingFramework = await ctx.db.query("frameworks").first();
    if (!existingFramework) {
      for (const framework of FRAMEWORKS_DATA) {
        await ctx.db.insert("frameworks", framework);
      }
      results.frameworks = { status: "success", count: FRAMEWORKS_DATA.length };
    } else {
      results.frameworks = { status: "already_seeded", count: 0 };
    }

    // Seed drills
    const existingDrill = await ctx.db.query("drills").first();
    if (!existingDrill) {
      for (const drill of DRILLS_DATA) {
        await ctx.db.insert("drills", {
          ...drill,
          frameworkIds: [],
        });
      }
      results.drills = { status: "success", count: DRILLS_DATA.length };
    } else {
      results.drills = { status: "already_seeded", count: 0 };
    }

    return results;
  },
});
