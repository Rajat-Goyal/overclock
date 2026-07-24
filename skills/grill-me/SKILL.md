---
name: grill-me
description: This skill should be used when the user asks to "grill me", "ask me the minimum viable questions", "ask me what you need to know", "clarify the requirements", "ask clarifying questions before building", or when another skill needs to nail down scope before acting. It asks the SMALLEST set of questions whose answers actually change what gets built — detecting what it can, defaulting what is safe, and asking only the real decision-forks — then hands the answers back. A reusable primitive other skills compose.
version: 0.1.0
---

# grill-me

Ask the **minimum viable** set of questions: only the ones whose answers change what
gets built. Everything detectable from context is detected; everything with a safe,
reversible default is defaulted and *stated*, not asked. The goal is one short round
that leaves no load-bearing ambiguity — not an interrogation.

This is a **primitive**: other skills (e.g. `spike`, `squad-decompose`) invoke it to
settle scope before they act. It gathers decisions; it does not build.

## The one rule

**If you can detect it, default it, or defer it — do not ask it.** Ask only what is
both *unknown* and *outcome-changing*.

## Procedure

### 1. Restate the goal in one line

So the person knows exactly what is being clarified. If a `product.md` or brief exists,
read it first — half the "questions" are usually already answered there.

### 2. List candidate unknowns, then cut ruthlessly

Write down everything you might ask, then remove:

- **Detectable** — answerable from the repo, `product.md`, conventions, or the platform
  (stack in use, test runner, existing patterns). Detect it; don't ask.
- **Safe-defaultable** — has a sensible, reversible default. Pick the default, and *say
  so* ("defaulting X to Y — tell me to change it"). Never spend a question on it.
- **Deferrable / cosmetic** — naming, styling, polish, anything decided later without
  rework. Cut.

What survives is the short list of **real forks**: choices that change the architecture,
are hard to reverse, or block/gate the work.

### 3. Ask the survivors in one batched round

Group them and ask together — aim for **≤ 4**. For every question:

- Offer 2–4 concrete options, not an open prompt.
- Put a **recommended** default first and mark it, so the answer can be one click.
- Keep the language plain; assume the person is not an expert unless told otherwise.

If nothing survives the cut, say so — "no blocking questions; here are the defaults I'm
assuming" — and skip straight to the decisions record.

### 4. Return the decisions, don't build

Hand back a compact record the calling skill (or the person) can act on:

```
Decisions:
- <question> → <answer>
- <defaulted> → <default> (assumed)
Open: <anything still genuinely unknown>
```

## Follow-ups

Prefer one round. Ask a second short round **only** if an answer opens a genuinely new
fork (e.g. "Python" unlocks a framework choice that changes the shape). Never drip
questions one at a time when they could have been batched.

## Adapters

- **Claude Code** — ask via the `AskUserQuestion` tool (batched, options with a marked
  recommendation). Never ask in plain prose when the tool can present the choices.
- **Codex** — present a single numbered list of the questions with their options and the
  recommended default called out; wait for the answers before proceeding.
