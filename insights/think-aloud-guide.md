# The Think-Aloud

Polished content shows the answer. Raw content shows the thinking.

---

## The Problem

Most content is post-processed. You see the clean result.

> "The solution is to use dependency injection."

Cool. But how did you get there? What did you try first? Why did those fail?

The messy middle is where learning actually happens.

---

## The Hotz Approach

George Hotz streams himself solving problems in real-time. No script. No edits. You watch him:

- Hit dead ends
- Google things he doesn't know
- Talk through his reasoning
- Change his mind mid-sentence

It's raw. And it's why people trust him.

---

## The Structure

```
1. STATE THE PROBLEM  → What are we trying to solve?
2. FIRST INSTINCT     → What's the obvious approach?
3. OBSTACLE           → Why doesn't that work?
4. PIVOT              → What does that tell us to try next?
5. RESOLUTION         → What finally worked (or didn't)
```

You're not presenting answers. You're modeling how to think.

---

## Example: Coding Content

**Topic:** Debugging a memory leak

```
[STATE THE PROBLEM]
"App's getting slower over time. Smells like a memory leak."

[FIRST INSTINCT]
"Let me check the useEffect cleanup... Nope, that's fine."

[OBSTACLE]
"Okay, it's not the obvious thing. Let me open the profiler...
Interesting. Something's holding references after unmount."

[PIVOT]
"Wait. I'm storing callbacks in a ref but never clearing them.
Every re-render adds a new one. That's the leak."

[RESOLUTION]
"Fixed it by clearing the ref in cleanup.
The lesson: refs aren't automatically garbage collected
if you keep pushing to them."
```

The audience learns the process, not just the fix.

---

## Why This Works

| Polished Content | Think-Aloud Content |
|------------------|---------------------|
| "Here's the answer" | "Here's how I found it" |
| Shows competence | Shows process |
| Intimidates beginners | Normalizes struggle |
| Forgettable | Memorable |

People remember journeys. They forget destinations.

---

## When to Use This

- **Debugging content** — Show the hunt, not just the fix
- **Decision-making** — Why you chose A over B
- **Learning in public** — "I didn't know this until..."
- **Building trust** — Showing you're human, not a wiki

---

## The Authenticity Line

Think-aloud requires genuine uncertainty. Don't fake it.

**Fake:** "Hmm, I wonder if... [thing you already know]"

**Real:** "I actually don't know if this will work. Let's find out."

Audiences can smell performance. Be actually uncertain when you are.

---

## One Line Summary

**Show the messy thinking. That's where the real teaching happens.**
