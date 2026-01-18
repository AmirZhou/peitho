# Framework Hints & Teleprompter Feature

**Date:** 2026-01-18
**Status:** Approved
**Goal:** Add a side panel with framework reference and optional teleprompter script with adjustable hint levels

---

## Overview

Users can optionally generate an example script along with their prompt. During recording, a side panel displays the script with adjustable hint levels—from full text (easiest) to minimal keywords (hardest). Each section can have its own hint level.

---

## 1. Script Generation

### API Changes

Update prompt generation to optionally return a structured script:

```typescript
interface GeneratedPrompt {
  topic: string;
  frameworks: string[];
  hookSuggestion: string;
  script?: {
    sections: ScriptSection[];
  };
}

interface ScriptSection {
  label: string;           // "Hook (Contrarian Opening)"
  content: string;         // Full text
  keywords: string[];      // 3-5 extracted keywords
}
```

### Keyword Extraction

GPT extracts keywords during script generation:
- 3-5 keywords per section
- Focus on: key terms, technical words, transition phrases
- Used to derive all hint levels algorithmically

---

## 2. Hint Levels

Four levels derived from the full script:

| Level | Name | Display | Example |
|-------|------|---------|---------|
| 1 | Full Script | Complete text | "Most developers think you need to solve hard problems to stand out." |
| 2 | Keywords Visible | Non-keywords masked | "Most ████████ think you need to █████ hard problems to stand out." |
| 3 | Structure Only | Keywords + labels | "[contrarian opener] ... solve hard problems ... stand out" |
| 4 | Minimal | Section label only | "• Contrarian Hook" |

### Implementation

CSS `filter: blur()` or character replacement for masking. Keywords get highlighted styling.

---

## 3. Side Panel UI

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Sidebar  │         Recording Area          │      Script Panel       │
│   240px   │                                 │         320px           │
│           │   ┌───────────────────────┐    │  ┌───────────────────┐  │
│           │   │                       │    │  │ Hint Level: ███░  │  │
│           │   │      Video Preview    │    │  │ [1] [2] [3] [4]   │  │
│           │   │                       │    │  ├───────────────────┤  │
│           │   └───────────────────────┘    │  │                   │  │
│           │                                 │  │  Section 1: Hook  │  │
│           │   [ Start Recording ]           │  │  ──────────────── │  │
│           │                                 │  │  (script text at  │  │
│           │                                 │  │   current hint    │  │
│           │                                 │  │   level)          │  │
│           │                                 │  │                   │  │
│           │                                 │  │  Section 2: Body  │  │
│           │                                 │  │  [Adjust: 1-4]    │  │
│           │                                 │  │  ──────────────── │  │
│           │                                 │  │  (different hint  │  │
│           │                                 │  │   level possible) │  │
│           │                                 │  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Controls

**Global hint level:** Slider or segmented buttons at top of panel. Sets default for all sections.

**Per-section override:** Small inline control on each section header. Visual indicator when different from global.

### Visual Treatment

- Glass morphism (matches sidebar)
- 320px width
- Slides in from right (300ms transition)
- Scrollable section list

---

## 4. User Flow

### Before Recording

1. User clicks "Start Session"
2. Prompt generation screen shows checkbox: "Generate example script"
3. If checked, API returns prompt + structured script
4. User can preview script in panel before recording

### During Recording

1. Script panel visible on right (desktop)
2. Global hint level control at top
3. User can adjust per-section as they speak
4. Sections scroll, current section highlighted

### Framework Reference

- Click framework badge → show pattern in same panel
- Switches panel to "framework reference" mode
- Shows pattern, examples, tags

---

## 5. Implementation Order

1. **Update prompt generator API**
   - Add `includeScript: boolean` parameter
   - Return structured script with sections and keywords
   - Use GPT to extract keywords (3-5 per section)

2. **Create ScriptPanel component**
   - Side panel (320px) with glass morphism
   - Global hint level control
   - Scrollable section list
   - Per-section hint level override

3. **Create HintRenderer component**
   - Takes `content`, `keywords`, `level` props
   - Renders text at appropriate hint level

4. **Update Session component**
   - Add state for script and hint levels
   - Checkbox on prompt screen
   - Conditionally render ScriptPanel

5. **Framework badge enhancement**
   - Click → show pattern in panel

---

## 6. Files

| File | Action |
|------|--------|
| `src/components/ScriptPanel.tsx` | Create |
| `src/components/HintRenderer.tsx` | Create |
| `src/components/Session.tsx` | Modify |
| `src/lib/openai.ts` | Modify |
| `src/App.css` | Add panel styles |

---

## Success Criteria

- [ ] Script generation works with keyword extraction
- [ ] All 4 hint levels render correctly
- [ ] Per-section hint adjustment works
- [ ] Panel slides in smoothly
- [ ] Framework badge shows pattern in panel
- [ ] Mobile: panel hidden or simplified
