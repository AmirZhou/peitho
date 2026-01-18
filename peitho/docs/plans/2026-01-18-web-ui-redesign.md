# Peitho Web UI Redesign

**Date:** 2026-01-18
**Status:** Approved
**Goal:** Transform the mobile-first UI into a premium desktop experience with subtle animations

---

## Design Direction

**Aesthetic:** Minimal & Premium (Linear, Vercel, Raycast style)
**Key principles:**
- Restraint over decoration
- Every element earns its place
- Animations are felt, not seen
- Professional tool, not a toy

---

## 1. Layout Structure

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────────────────┐ │
│ │ Sidebar  │ │         Main Content Area          │ │
│ │  240px   │ │         (max-width: 900px)         │ │
│ │  fixed   │ │         (centered in space)        │ │
│ └──────────┘ └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

- **Sidebar:** 240px fixed width, full viewport height
- **Main content:** Centered in remaining space, max-width 900px
- **Background:** Spans entire viewport behind both areas

### Mobile (<1024px)

Keep current layout with bottom navigation. No sidebar on small screens.

---

## 2. Background: "The Grid"

A subtle perspective grid suggesting depth and structure—evokes the frameworks Peitho teaches.

### Implementation (CSS-only)

```css
.app-background {
  position: fixed;
  inset: 0;
  z-index: -1;

  /* Grid pattern */
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;

  /* Slow drift animation */
  animation: grid-drift 30s linear infinite;

  /* Vignette overlay */
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

@keyframes grid-drift {
  0% { background-position: 0 0; }
  100% { background-position: 0 60px; }
}
```

### Characteristics
- ~4% opacity grid lines in primary color
- 60px grid spacing
- 30-second drift cycle (barely perceptible)
- Radial vignette fades grid at edges
- Zero JS, zero performance impact

---

## 3. Sidebar Design

### Visual Treatment
- **Background:** `rgba(20, 20, 20, 0.8)` with `backdrop-filter: blur(12px)`
- **Border:** 1px solid `rgba(255, 255, 255, 0.06)`
- Glass morphism lets grid show through faintly

### Content Hierarchy

```
┌────────────────────┐
│                    │
│   P E I T H O      │  ← Letterspaced logo
│   the art of       │  ← Tiny muted tagline
│   persuasion       │
│                    │
│ ┌────────────────┐ │
│ │ Start Session  │ │  ← Primary CTA, solid color
│ └────────────────┘ │
│                    │
│   ○ Practice       │  ← Nav items
│   ○ Frameworks     │
│   ○ Drills         │
│   ○ Log            │
│                    │
│         ...        │  ← Flex spacer
│                    │
│ ─────────────────  │
│   🔥 12 day streak │
│                 ⚙  │
└────────────────────┘
```

### States
- **Active nav:** Brighter text + 2px left border in primary color
- **Hover:** Text color shifts toward white (150ms ease)
- **CTA hover:** Subtle glow + scale(1.02)

---

## 4. Main Content Area

### Container
- Max-width: 900px, centered
- Padding: 48px (vs mobile's 16px)
- Grid background visible through content

### Cards
- **Background:** Semi-transparent + backdrop blur (same as sidebar)
- **Border-radius:** 16px (refined feel)
- **Padding:** 32px
- **Shadow:** `0 4px 24px rgba(0, 0, 0, 0.2)`
- **Hover:** `translateY(-2px)`, border lightens

### Typography (Desktop)
| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| H1 | 36px | 700 | letter-spacing: -0.02em |
| H2 | 20px | 600 | |
| Body | 15px | 400 | |
| Muted | 13px | 400 | |

### Spacing
- Card gaps: 24px
- Section spacing: 48px

---

## 5. Session View

### Trigger
- Click "Start Session" → navigate to `/session` route
- Sidebar collapses, content expands

### Transition Sequence
1. Sidebar slides left + fades (300ms ease-out)
2. Content area expands to full width
3. Session UI fades in (200ms, delayed 150ms)

### Desktop Layout

```
┌─────────────────────────────────────────────────────────┐
│  ✕                                         Step 1 of 3  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│    ┌─────────────────┐    ┌─────────────────────────┐  │
│    │                 │    │   Today's Prompt        │  │
│    │   Video         │    │   "Why most devs..."    │  │
│    │   Preview       │    │                         │  │
│    │   (16:9)        │    │   Frameworks: [badges]  │  │
│    │   max-w: 480px  │    │                         │  │
│    │                 │    │   Hook: "Here's the..." │  │
│    └─────────────────┘    └─────────────────────────┘  │
│                                                         │
│              [ Start Recording ]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Two-column: video left, prompt right
- Video: 16:9 aspect ratio, max-width 480px
- Close (✕) top-left, step indicator top-right

### Exit
Reverse animation—session fades, sidebar slides back.

---

## 6. Micro-interactions

### Timing Standards
| Type | Duration | Easing |
|------|----------|--------|
| Hover | 150ms | ease |
| Layout | 300ms | ease-out |
| Fade | 200ms | ease |
| Max | 400ms | — |

### Button Interactions

**Primary:**
```css
.btn-primary:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}
.btn-primary:active {
  transform: scale(0.98);
}
```

**Secondary:**
```css
.btn-secondary:hover {
  background: var(--color-surface);
  border-color: var(--color-border-hover);
}
```

### Card Interactions
```css
.card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Page Transitions
- Content fades on route change (200ms)
- No sliding—keeps things calm

---

## 7. Technical Notes

### No External Dependencies
- Pure CSS for background animation
- CSS transitions for all interactions
- React Router (already installed) for `/session` route

### CSS Custom Properties (additions)
```css
:root {
  /* Existing... */

  /* New for glass morphism */
  --glass-bg: rgba(20, 20, 20, 0.8);
  --glass-border: rgba(255, 255, 255, 0.06);
  --glass-blur: 12px;

  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.2);
  --shadow-card-hover: 0 8px 32px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);
}
```

### Responsive Breakpoint
```css
@media (min-width: 1024px) {
  /* Desktop styles */
}
```

---

## Implementation Order

1. Add background grid animation
2. Create sidebar component (desktop only)
3. Update layout structure (sidebar + main)
4. Apply glass morphism to cards
5. Add micro-interactions
6. Implement session route with transitions
7. Polish and test

---

## Success Criteria

- [ ] Desktop feels like a premium tool (Linear/Vercel tier)
- [ ] Background adds atmosphere without distraction
- [ ] Animations are smooth, fast, purposeful
- [ ] Mobile experience unchanged
- [ ] No external animation libraries added
- [ ] Performance stays snappy (no jank)
