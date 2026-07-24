---
name: slice
description: This skill should be used when the user asks to "suggest slices", "what's the right first vertical slice", "shape this into a Shape Up pitch", "what should I build first", "give me slice candidates", "options for slices", or "shaped bets from product.md". It reads product.md and proposes candidate vertical slices shaped by Ryan Singer's Shape Up — each a compact pitch (problem, appetite, solution, rabbit holes, no-gos) that ships a meaningful end-to-end user experience — recommends the first bet with rationale, compares them, and hands the chosen slice to squad-decompose. Source-only; cites Shape Up. Written for a non-expert builder.
---

# slice

Turn a product contract into **candidate vertical slices**, each shaped the Shape Up way —
*rough, solved, bounded* — cutting through every layer to ship a **meaningful user result**,
not a technical layer and not a demo. Propose options, recommend the first bet, and let the
builder choose. The chosen slice feeds `squad-decompose`.

Shape Up (Ryan Singer, Basecamp) is the frame. Shaped work must be **solved** — its big
unknowns already worked out — so this skill assumes the scary R&D unknowns were de-risked
first (see `derisk` / `spike`). If they haven't been, say so plainly: shaping on top of
unresolved unknowns produces a pitch that will blow its appetite.

Write for a **non-expert builder**: plain language; explain each Shape Up term once.

Supporting files (relative to this skill's directory):

- **`references/shape-up.md`** — appetite, shaping (rough/solved/bounded), the vertical slice, the pitch's five ingredients, betting — with citations.
- **`templates/slice-candidates.template.md`** — the output shape.
- **`examples/shiori-slices.md`** — a worked example.

## Modes — do only what's asked

| The ask sounds like… | Mode | Output |
| --- | --- | --- |
| "suggest slices / options / what should I build first" | **options** | candidate slices + a recommended first bet + comparison, in the conversation |
| "shape <slice> into a pitch" | **shape** | the full five-ingredient pitch for one chosen slice |
| "write slice-candidates.md" | **write** | `slice-candidates.md` on disk |

Default to **options**. Never place the bet for the builder — only the next pitch gets
shaped and committed; the rest stay options.

## Source boundary

- Reason from **`product.md`** and what the builder tells you. Don't invent scope.
- Treat **Shape Up as the authority** on method; cite the relevant chapter when you apply a
  principle (see the reference). Don't paraphrase Shape Up as if it were your own rule.

## Procedure

### 1. Read the contract, and check its size

Read `product.md`. Then observe honestly: **is this one bet, or many?** A strong product
contract usually bundles several independently risky systems — list them. Shape Up says set
the **appetite first, then vary scope to fit**; if it won't fit, break off a *meaningful
piece*, not a technical layer. Note which unknowns `derisk`/`spike` already resolved —
shaped work must be **solved**.

### 2. Set the appetite

Name the time budget up front, because it bounds everything: a **small batch** (~1–2 weeks)
or a **big batch** (~6-week cycle). Appetite is a *constraint*, not an estimate — scope
flexes to fit the time, never the reverse.

### 3. Generate candidate vertical slices

Each candidate must **cross every layer and end in a meaningful user result** — something a
person can actually use, not "the system can store an intention." Shape each as a compact
pitch:

- **Problem** — the real user problem, in a sentence or two.
- **Appetite** — small or big batch.
- **User experience** — a short numbered walk-through of the actual flow.
- **Included** — what's in.
- **No-gos** — what's explicitly out. These are the circuit breaker: cut, not
  deferred-maybe.
- **Rabbit holes** — the traps that could blow the appetite.
- **Why it fits Shape Up** — rough, solved, bounded, and a meaningful result.
- For non-recommended options: **why not first**.

### 4. Recommend the first bet

Recommend the **smallest slice that proves the product's actual value** — the core promise,
not merely a capability. ("It helps the user follow through," not "it can store an
intention.") Justify with Shape Up's betting questions: does the **problem matter**, is the
**appetite right**, is the **timing right**?

### 5. Compare and sequence

Give a **comparison table** — slice · user value shipped · appetite · product risk tested ·
good first bet? — and a **suggested sequence**, explicitly non-committal: only the next bet
gets shaped and chosen; the rest remain options, not a backlog.

### 6. Keep it honest

The shipped slice must **tell users the truth** about what it does and doesn't do yet. An
honest "for now I can only do X" beats pretending to support the whole contract — never let
a slice imply capabilities it doesn't have.

### 7. Suggest the next step — don't take it

> Pick a slice. If you want it fully shaped, ask me to shape it into a pitch (a one-sentence
> boundary + the five ingredients). Then hand that scope to `squad-decompose` to break into
> stories.

Don't auto-pick or auto-decompose. **If `squad-decompose` isn't installed**, say so: the
chosen slice's *Included* + *No-gos* + *appetite* are the scope you'd break into small,
independently verifiable stories by hand.

## Later

The chosen slice is a shaped bet. `squad-decompose` turns its Included/No-gos into a story
DAG; `squad-execute` builds them behind the evidence gate. Keep `product.md` as the
north-star contract and the slice as the current pitch — don't let the pitch overwrite the
contract.
