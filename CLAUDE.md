# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Peitho** is a mobile-first web application for mastering persuasive speaking through structured daily practice. Users practice communication frameworks from creators like Dan Koe, Naval Ravikant, and Alex Hormozi across two domains: **coding** (developer mindset, tooling opinions) and **running** (technique, training insights).

## Commands

All commands run from the `peitho/` directory:

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint for TypeScript/React
npm run preview  # Preview production build locally
```

**Convex deployment:**
```bash
npx convex dev --once    # Push to dev deployment
npx convex deploy --yes  # Deploy to production
```

## Architecture

```
peitho/
├── src/
│   ├── components/     # React UI components
│   ├── hooks/          # Custom React hooks (useRecorder)
│   ├── lib/openai.ts   # OpenAI API: prompt/script generation, Whisper, evaluation
│   ├── App.tsx         # Main app with tab navigation
│   └── App.css         # All styles (mobile-first, glass morphism)
├── convex/
│   ├── schema.ts       # Database schema
│   ├── frameworks.ts   # Framework CRUD
│   ├── sessions.ts     # Session management + recording storage
│   ├── drills.ts       # Drill management
│   ├── settings.ts     # User settings (API key, streak)
│   └── seed.ts         # Initial data seeding
└── docs/plans/         # Design documents
```

**Stack:** React 19 + TypeScript + Vite + Convex (serverless backend) + OpenAI API

## Key Patterns

**Convex data access:**
- `useQuery(api.X.Y)` - Reactive data fetching
- `useMutation(api.X.Y)` - Data mutations
- Auto-generated types in `convex/_generated/`

**OpenAI integration (src/lib/openai.ts):**
- All API calls use `response_format: { type: "json_object" }`
- `stripMarkdownCodeBlock()` helper for parsing responses
- Whisper has 25MB limit - audio extracted from video if needed

**Recording workflow:**
1. Record video via MediaRecorder
2. Upload blob to Convex storage
3. Fetch blob URL for playback or transcription
4. Transcribe with Whisper, evaluate with GPT-4o-mini
5. Store feedback in session record

## Database Schema (Convex)

Core tables:
- **frameworks** - 14 communication frameworks with patterns, examples, tags
- **sessions** - Practice sessions with recordings, prompts, AI feedback
- **drills** - Micro-exercises (linking_words, punch_practice, etc.)
- **settings** - User preferences including OpenAI API key

## Environment Variables

```
VITE_CONVEX_URL=<convex-deployment-url>
```

OpenAI API key is stored in Convex settings, entered by user in app.

## Reference Documentation

- `docs/plans/2025-01-17-articulate-practice-system-design.md` - Full project spec
- `insights/` - Framework guides (dopamine_ladder, rant_structure, etc.)
