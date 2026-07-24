---
name: derisk
description: This skill should be used when the user asks to "de-risk this", "plot my concerns on the Rumsfeld matrix", "classify these risks", "what should I spike first", "help me decide what to spike", "write spike-candidates.md", "surface the risks in product.md", or "what do I not know before building". It reads product.md and the builder's own words (asking for their biggest fears first if none are given), decomposes each concern into atomic claims, labels each with provenance, and sorts them onto the Rumsfeld known/unknown matrix. Depending on the ask it returns the matrix (plot), adds prioritized candidate spikes (decide), or writes spike-candidates.md (write). Source-only by default; verifies any external fact it cites. Written for a non-expert builder. Feeds the optional spike skill.
---

# derisk

Before building, take what a product brief and the builder actually say, decompose the
concerns, and sort them onto the **Rumsfeld matrix** so each lands the right action: the
things you *know you don't know* become **candidate spikes** — small, observable
investigations that buy down risk before production code is written.

Write for a **non-expert builder**: plain language, and name the things an experienced
engineer takes for granted (that tacit knowledge is where a first-timer gets surprised).

Supporting files (relative to this skill's directory):

- **`references/rumsfeld.md`** — the four quadrants, decomposition, provenance, prioritization.
- **`templates/spike-candidates.template.md`** — the output shape.
- **`examples/telegram-assistant.md`** — a worked example.

## Modes — do only what's asked

These three requests are different. Infer which the ask wants; when unsure do the
**lighter** one and offer the next. Do **not** silently write a file for a "just classify
these" request.

| The ask sounds like… | Mode | Output |
| --- | --- | --- |
| "plot / classify my concerns" | **plot** | the matrix in the conversation (a compact 2×2) — no spikes, no file |
| "what should I spike first / help me decide" | **decide** | matrix **+** prioritized candidate spikes, in the conversation |
| "write it down / create spike-candidates.md" | **write** | `spike-candidates.md` on disk |

## Source boundary — read before classifying

- **Source-only by default.** Reason from `product.md` and the builder's words. Do **not**
  fill gaps with outside knowledge unless the builder asks you to.
- **Label every claim's provenance:** `[stated]` (in the source) · `[verified]` (from a
  cited authoritative source) · `[inferred]` (a reasonable guess) · `[unanswered]`.
- **Never classify an `[inferred]` claim as a known known.** An inference is, at most, a
  known unknown until it is confirmed.
- **Verify external facts before ranking on them.** If a provider's policy, pricing, scope
  classification, limit, or approval timeline affects a spike's priority, check that
  provider's *current* official docs and cite them. A de-risking skill that repeats a stale
  external "fact" manufactures false confidence — the exact opposite of its job.

## Input

- `product.md` / brief — read it first; it may already answer, or scope **out**, a concern.
- The builder's concerns/fears — carried **verbatim**.

## Procedure

### 1. Start with the builder's own fears, then sweep

The builder's own doubts are the highest-signal input, so get them first:

- **If they handed you concerns**, use them **verbatim**.
- **If they only gave a `product.md` and said "derisk this"**, *ask them first* — openly,
  not multiple-choice: what are they most worried about, least sure of, or afraid will go
  wrong? A couple of open questions; their words are the signal.

Then **sweep the lenses** to add what they didn't raise: Integration · Deployment/hosting ·
Access & auth · State · Cost & limits · Ops & compliance.

### 2. Decompose each concern into atomic claims — the most important step

Break each concern into its **smallest independently answerable claims**. Different parts
of one concern usually belong in **different quadrants** — classify the parts, not the whole.

> "What will deployment look like?", given a brief that names Railway →
> `[stated]` Railway is the always-available target — a **known known**; **and**
> `[unanswered]` secret config, release procedure, monitoring, rollback/recovery — each a
> **known unknown**.

A claim that `product.md` has already scoped **out** is *answered*, not a risk — do not turn
it into a spike just because the builder mentioned it.

### 3. Classify each claim onto the matrix

| Quadrant | Meaning | Produces |
| --- | --- | --- |
| **Known known** | The answer exists and is `[stated]` or `[verified]` — never a bare inference. | a one-line brief |
| **Known unknown** | You know you need it and don't know how — **including any untested assumption, once surfaced.** | a **candidate spike** |
| **Unknown known** | Relevant knowledge or a stated constraint that already exists but the builder hasn't noticed or connected to this decision. | a one-line brief that connects it |
| **Unknown unknown** | A blind spot you can't name yet. | a one-line brief: the territory + who to ask |

Every claim carries its provenance tag. **Untested assumptions** ("Google will just allow
this") are surfaced and routed to **known unknown** for validation — they are not "known."

### 4. Turn each known-unknown into a candidate spike

A **candidate** — a proposal the builder chooses from, not a committed task. Each names the
question, a **rationale** (what it de-risks / the cost of guessing wrong), 2–3 concrete
options, a rough time-box, and a **done-when** (smallest observable proof). See
`references/rumsfeld.md` for the anatomy.

### 5. Shrink the unknown-unknowns

You can't spike what you can't name. Point at the risky territory and name **who to ask** or
which official doc to read — turning an unknown-unknown into a known-unknown is the cheapest
de-risking there is.

### 6. Prioritize the candidates

Order by **risk × uncertainty × how much it blocks**. Suggest first the one whose wrong
answer forces the biggest redesign or the longest external wait — but verify any external
timeline against current docs first (step: source boundary), and give each candidate a
one-line reason for its rank. It's a suggestion; the builder decides.

### 7. Emit the output for the mode

- **plot** → a compact **2×2** (a Markdown table, or a Mermaid quadrant chart where it will
  render) in the conversation. Stop there.
- **decide** → the 2×2 **plus** the prioritized candidate spikes with rationale.
- **write** → `spike-candidates.md` (see template): the candidates, the matrix with
  provenance tags, and what is not yet answered. Named "candidates" on purpose.

### 8. Suggest the next step — don't take it

> Read `spike-candidates.md`, pick the spike(s) to run, then invoke the **`spike`** skill —
> it grills you for the details and writes a `spike.md`.

Do **not** auto-pick a candidate or auto-invoke `spike`; the choice is the builder's. **If
`spike` or `squad-decompose` aren't installed**, say so and give the plain fallback: write
the chosen spike by hand (its question, options, and done-when), then break the scope into
small, independently verifiable stories yourself.

## For thoroughness (optional)

To surface concerns more completely, fan out one pass per lens (Claude: `Workflow` agents;
Codex: subagents), then merge and de-duplicate before classifying. Overkill for a small
brief; useful for a large one.

## Later

As each spike resolves, record the answer — it is now a known-known, and `squad-decompose`
can turn it into stories. `derisk` maps and proposes; it never chooses the spike or commits
the build.
