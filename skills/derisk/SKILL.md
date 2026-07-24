---
name: derisk
description: This skill should be used when the user asks to "de-risk this", "what should I spike first", "plot my concerns on the Rumsfeld matrix", "known knowns / known unknowns", "surface the risks in product.md", "what do I not know before building", or "turn my fears/concerns into spikes". It reads a product brief and/or the builder's concerns, sorts them into the Rumsfeld known/unknown matrix, gives each a one-line brief, and turns the known-unknowns into prioritized spikes with concrete options. Written for a non-expert builder. Feeds squad-decompose.
version: 0.1.0
---

# derisk

Before building, take what is known about a product (a `product.md`, a brief, or just
the builder's concerns), sort every concern into the **Rumsfeld matrix**, and turn the
things you *know you don't know* into **spikes** — small, time-boxed investigations
that buy down risk before a line of production code is written.

Write for a **non-expert builder**: plain language, no unexplained jargon, and name
the things an experienced engineer would take for granted (that tacit knowledge is
exactly where a first-time builder gets surprised).

The resolved spikes feed `squad-decompose`: once a known-unknown has an answer, it
becomes a known-known and can be planned into stories.

Supporting files (relative to this skill's directory):

- **`references/rumsfeld.md`** — the four quadrants, how to classify, spike anatomy, prioritization.
- **`templates/derisk.template.md`** — the output shape.
- **`examples/telegram-assistant.md`** — a worked example (the concerns below, plotted).

## Input

- A `product.md` / brief if one exists — read it first.
- Any concerns, questions, or fears the builder already voiced — carry them in
  **verbatim**; do not soften "how will I even connect to Telegram" into something
  tidier. Their words are the signal.

If there is no brief yet, work from the concerns alone; the matrix still holds.

## Procedure

### 1. Surface the concerns

Do not stop at the concerns handed to you. Sweep the build through these lenses and add
the questions a builder *should* be asking but may not have thought to:

- **Integration** — every external service it must talk to.
- **Deployment / hosting** — where it runs, how it stays reachable.
- **Access & auth** — how it gets permission to the user's data; where secrets live.
- **State** — what must be remembered across messages, sessions, and restarts.
- **Cost & limits** — rate limits, quotas, always-on compute, per-call price.
- **Ops & compliance** — third-party review/verification, data handling, failure modes.

### 2. Classify each concern onto the Rumsfeld matrix

| Quadrant | Meaning for a builder | What it produces |
| --- | --- | --- |
| **Known known** | You know how to do this. | A one-line brief stating the answer, so it is not re-litigated. |
| **Known unknown** | You know you need it and don't know how. | **A spike** (below). |
| **Unknown known** | A tacit assumption you are leaning on without having checked it. | A one-line brief naming the assumption + the risk if it is wrong. |
| **Unknown unknown** | A blind spot — surprises you can't name yet. | A one-line brief pointing at the *territory* where surprises hide, and who to ask. |

Every concern gets a **one-line brief**. Only known-unknowns additionally become spikes.

### 3. Turn each known-unknown into a spike

A spike is a small investigation, not a feature. Each one names:

- **The question** — the single thing you need to answer.
- **Why it's risky** — what breaks or gets expensive if you guess wrong.
- **Options** — 2–3 concrete approaches to try, in plain language (these are the
  "options for the spike").
- **Time-box** — a few hours to a day; a spike is throwaway.
- **Done when** — the smallest observable proof that the question is answered.

### 4. Shrink the unknown-unknowns

You cannot spike what you can't name. Convert unknown-unknowns into known-unknowns by
pointing at the risky territory and naming **who to ask** (someone who has shipped this
before, a docs page, a forum). A 20-minute conversation often turns a launch-blocking
surprise into a line item.

### 5. Prioritize the spikes

Order by **risk × uncertainty × how much it blocks**. Do first the spike whose wrong
answer would force the biggest redesign or the longest external wait (e.g. a third-party
verification process), not the one that is merely most visible. Say plainly what to spike
first and why.

### 6. Write the output

Produce `derisk.md` (see the template): the matrix with one-line briefs, then the
prioritized spike list. Keep it readable by a non-engineer. Note explicitly what is
**not** yet answered.

## For thoroughness (optional)

To surface concerns more completely, fan out one pass per lens (Claude: `Workflow`
agents; Codex: subagents), then merge and de-duplicate before classifying. Overkill for
a small brief; useful for a large one.

## Hand-off

The prioritized spikes are **candidates** — the builder chooses which to run first. To
write up a chosen one, use the **`spike`** skill: it grills for the minimum viable
decisions (via `grill-me`) and produces a `spike.md`. As each spike resolves, record the
answer — it is now a known-known, and `squad-decompose` can turn it into stories.
