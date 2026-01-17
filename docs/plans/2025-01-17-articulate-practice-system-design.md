# Articulate: Daily Speaking Practice System

A mobile-first web app for mastering the Dan Koe communication style through structured daily practice.

---

## Overview

**Goal:** Transform a beginner who freezes on camera into a confident, punchy speaker for LinkedIn and live presentations.

**Domains:** Coding (mindset, tooling, insights) + Running (technique, coaching)

**Time Commitment:** 1.5 hours daily

**Core Philosophy:** Learn all frameworks upfront, then apply everything daily through structured reps.

---

## Daily Session Structure (1.5 hours)

### Block 1: Framework Drill (30 min)

Structured practice with guardrails.

- **First 10 min:** Read one framework card. Study one example. Understand the pattern.
- **Next 20 min:** 4 reps of 3-minute speaking drills. Tool gives prompt tied to framework + domain. No stopping, no redoing — just reps.

### Block 2: Create One Real Piece (45 min)

Make something you could post.

- **First 5 min:** Tool generates 3 topic options. Pick one.
- **Next 25 min:** Write rough script using frameworks. Speak aloud, refine.
- **Final 15 min:** Record 2-3 takes. Pick the best. Save it.

### Block 3: Review & Log (15 min)

- Watch best take
- Note one win, one improvement
- Log in tracker

---

## Framework Library (14 Total)

### Universal Frameworks

| Framework | Source | Purpose |
|-----------|--------|---------|
| Punch-Expand-Ground | Dan Koe | Basic rhythm — short declarative, explain, return to punch |
| Contrarian Opening | Dan Koe | Shock → Qualify → Reframe (hooks that stop scroll) |
| Reset Words / Transitions | Dan Koe | "Now," "So," "Here's the thing" — controlling pace |
| Dopamine Ladder | Original | 6-level engagement structure |
| Credibility Signals | Original | Why people take you seriously |
| Experience Anchor | Adapted | Grounding opinions in personal stories |
| Technique Stacking | Dan Koe | Teaching by breaking skills into pieces |
| Framework Fusion | New | Combining 2-3 frameworks in one piece |
| Compression Test | Naval | Complete ideas in one sentence |
| Math Breakdown | Hormozi | Using numbers to make points undeniable |
| Speed Stack | Fireship | Density and pacing techniques |

### Domain-Specific Frameworks

| Framework | Source | Domain |
|-----------|--------|--------|
| Rant Structure | T3gg/Prime | Coding |
| Coach Voice | New | Running |
| Think-Aloud | George Hotz | Coding |

---

## App Features

### Core Screens

1. **Dashboard (Home)**
   - Today's session: current prompt, timer, quick-access framework cards
   - Streak counter + recent sessions list
   - "Start Session" button

2. **Prompt Generator**
   - Select domain (coding / running / random)
   - Select framework emphasis (or "surprise me")
   - Domain Lock as default mode
   - Regenerate button

3. **Framework Library**
   - CRUD for frameworks
   - Each framework: description, structure template, examples
   - Fully editable

4. **Drills Library**
   - Micro-exercises (linking words, punch practice, rhythm reps)
   - Timer, instructions, example clips
   - Tagged by related frameworks

5. **Style Study**
   - Creator profiles with signature moves
   - Transcripts tagged by framework/technique
   - Imitation reps storage

6. **Session Log**
   - Date, topic, frameworks used, win, improvement
   - Attached recordings
   - Filterable history

7. **Resources (Content Bank)**
   - Dan Koe transcripts, examples
   - Tagged by framework

8. **Settings**
   - OpenAI API key (encrypted)
   - Domains configuration
   - Preferences

### Recording Features

| Feature | Details |
|---------|---------|
| In-browser recording | Video/audio via MediaRecorder API |
| Playback | Review takes immediately |
| Multiple takes | Record several, compare, mark best |
| Storage | Convex file storage |

### Mobile-First Design

| Principle | Implementation |
|-----------|----------------|
| Thumb-friendly | Primary actions at bottom, large tap targets |
| Portrait recording | Optimized for vertical video |
| Minimal typing | Chips/toggles for selection, voice notes |
| Offline-capable | Cache today's prompt + framework cards |
| Quick launch | Dashboard shows "Start Session" immediately |

---

## OpenAI Prompt Generation

### Generation Modes

| Mode | What It Does | Default |
|------|--------------|---------|
| **Domain Lock** | You pick domain, AI picks frameworks + topic | Yes |
| Guided | AI picks everything | No |
| Framework Lock | You pick frameworks, AI picks topic | No |
| Freestyle | AI gives topic only | No |

### Prompt Output Format

```
Topic: [Specific, opinionated angle]
Domain: [coding / running]
Frameworks: [1-2 to emphasize]
Hook suggestion: [Optional opening line]
```

### System Prompt Inputs

- User's domains with context
- All frameworks (names + patterns)
- Recent session history (avoid repetition)
- Style examples tagged as reference

---

## Data Model (Convex)

```typescript
// frameworks
{
  id: string
  name: string
  description: string
  pattern: string
  examples: string[]
  tags: string[]
  createdAt: number
  updatedAt: number
}

// drills
{
  id: string
  name: string
  type: "linking_words" | "punch_practice" | "rhythm_reps"
  instructions: string
  durationSeconds: number
  exampleClipUrl?: string
  frameworkIds: string[]
}

// styleExamples
{
  id: string
  type: "speaking_clip" | "writing_sample" | "vocabulary"
  content: string
  mediaUrl?: string
  frameworkIds: string[]
  source: "dan_koe" | "t3gg" | "prime" | "fireship" | "hormozi" | "naval" | "hotz" | "self"
  annotations: string
}

// sessions
{
  id: string
  date: string
  domain: "coding" | "running"
  promptUsed: string
  frameworksUsed: string[]
  recordings: string[]
  winNote: string
  improveNote: string
  durationMinutes: number
}

// creators
{
  id: string
  name: string
  platform: "youtube" | "linkedin" | "twitter" | "podcast"
  links: string[]
  styleNotes: string
  signatureMoves: string[]
  tier: "primary" | "secondary" | "domain_specific"
}

// transcripts
{
  id: string
  creatorId: string
  title: string
  sourceUrl: string
  content: string
  frameworkTags: string[]
  techniqueTags: string[]
  annotations: string
  imitationReps: string[]
}

// resources
{
  id: string
  title: string
  type: "transcript" | "article" | "video_link"
  content: string
  tags: string[]
  frameworkIds: string[]
}

// settings
{
  id: string
  openaiApiKey: string // encrypted
  domains: string[]
  defaultSessionMinutes: number
  streakCount: number
}
```

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Backend | Convex |
| Auth | Convex Auth |
| Storage | Convex File Storage |
| AI | OpenAI API (user provides key) |
| Styling | User's existing UI/UX system |
| Deployment | Vercel |

---

## Implementation Phases

### Phase 1: Foundation (MVP)

- [ ] Framework library (CRUD, seed with 14 frameworks)
- [ ] Prompt generator (Domain Lock mode)
- [ ] Session log (create + list)
- [ ] Mobile-responsive layout

### Phase 2: Recording

- [ ] In-browser recording (MediaRecorder API)
- [ ] Playback functionality
- [ ] Save to Convex file storage
- [ ] Attach recordings to sessions

### Phase 3: Drills & Style Study

- [ ] Drills library (CRUD, timer, framework links)
- [ ] Style Study (creators, transcripts, tagging)
- [ ] Imitation reps storage

### Phase 4: Polish

- [ ] Streak tracking
- [ ] Offline support
- [ ] Settings management
- [ ] Analytics (framework usage patterns)

---

## File Structure

```
/app
├── page.tsx                    # Dashboard
├── session/
│   ├── page.tsx               # Active session view
│   └── [id]/page.tsx          # Session detail/review
├── frameworks/
│   ├── page.tsx               # Framework library
│   └── [id]/page.tsx          # Single framework view/edit
├── drills/
│   ├── page.tsx               # Drills library
│   └── [id]/page.tsx          # Single drill
├── style-study/
│   ├── page.tsx               # Creators list
│   ├── [creatorId]/page.tsx   # Creator detail
│   └── transcripts/[id]/page.tsx
├── log/
│   └── page.tsx               # Session history
└── settings/
    └── page.tsx               # API key, preferences

/convex
├── schema.ts                   # All tables
├── frameworks.ts               # Framework mutations/queries
├── drills.ts
├── sessions.ts
├── creators.ts
├── transcripts.ts
├── prompts.ts                  # OpenAI integration
└── storage.ts                  # File handling

/components
├── ui/                         # Design system
├── recording/
│   ├── Recorder.tsx
│   └── Playback.tsx
├── prompt/
│   └── PromptGenerator.tsx
└── session/
    ├── SessionTimer.tsx
    └── SessionLog.tsx

/lib
├── openai.ts                   # API helper
└── frameworks-seed.ts          # Initial 14 frameworks
```

---

## Style Influences

### Primary Voice (60%) — Dan Koe
- Rhythm, contrarian hooks, frameworks

### Energy Injection (20%) — Alex Hormozi
- Structure, intensity, confidence

### Density Layer (15%) — Fireship
- Pacing, no fluff, punchy delivery

### Depth Anchor (5%) — Naval Ravikant
- Quotable compression, philosophical grounding

---

## MVP Definition

You have an MVP when:

1. You can open the app on your phone
2. Generate a prompt for coding or running
3. See which frameworks to use
4. Record yourself speaking
5. Save the session with notes

Everything else is iteration.

---

## Next Steps

1. Set up Next.js + Convex project
2. Define Convex schema
3. Seed 14 frameworks
4. Build framework library (read-only)
5. Build prompt generator
6. Build session log
7. Add recording
8. Deploy to Vercel
