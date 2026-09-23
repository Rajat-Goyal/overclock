# The Rumsfeld matrix, for builders

> "There are known knowns … known unknowns … but there are also unknown unknowns —
> the ones we don't know we don't know." — Donald Rumsfeld

Two axes: **do we know it?** (the answer) × **do we know we're missing it?** (the
question). Four quadrants. The point is not to be clever about the labels — it is to route
each claim to the *right kind of action*.

```
                        Are we AWARE of it?
                     aware              unaware
                 ┌───────────────┬───────────────┐
      know   yes │ KNOWN KNOWN   │ UNKNOWN KNOWN │
   the answer?   │ → confidence  │ → connect it  │
                 ├───────────────┼───────────────┤
             no  │ KNOWN UNKNOWN │ UNKNOWN       │
                 │ → SPIKE       │ UNKNOWN       │
                 │               │ → go scouting │
                 └───────────────┴───────────────┘
```

## Before you classify: decompose, then label provenance

**Decompose.** A single concern usually is not one claim. Break each concern into its
**smallest independently answerable claims** and classify those. Different parts of the same
concern land in different quadrants:

> "What will deployment look like?" (brief names Railway) →
> Railway is the target — **known known**; secrets, releases, monitoring, rollback —
> **known unknowns**.

**Provenance.** Tag every claim: `[stated]` in the source · `[verified]` from a cited
authoritative source · `[inferred]` a reasonable guess · `[unanswered]`. The tag decides
what a claim is *allowed* to be:

- A claim can only be a **known known** if it is `[stated]` or `[verified]`. Never promote
  an `[inferred]` guess to a known known.
- **Source-only by default.** If asked for a source-only analysis, do not use outside
  knowledge to fill gaps — an unanswered claim stays a known unknown.
- **Verify changing external facts before ranking on them.** Provider policies, pricing,
  scope classifications, limits and approval timelines drift. If one affects a spike's
  priority, check the provider's current official documentation and **cite it**. Otherwise
  a de-risking pass manufactures false confidence.

## Known known — "we know how"

The answer exists and is `[stated]` or `[verified]`. Output: **a one-line brief** so it is
not re-debated. No spike. The trap: calling something a known-known out of optimism ("auth
is easy"). If you cannot state the *how* in one sentence from the source, it is not one.

## Known unknown — "we know we don't know" → the spike

The productive quadrant: required, but you don't know how, which option, or whether it
works. Also where **untested assumptions** land once surfaced — "Google will just allow
this" is not an answer, it is a thing to validate. This is what a **spike** is for.

Anatomy of a spike:

- **Question** — one sentence. If it needs "and", it is two spikes.
- **Rationale / why it's risky** — the cost of guessing wrong (rework, spend, a multi-week
  external wait, a security hole).
- **Options** — 2–3 concrete approaches to actually try. Real tools/paths, plain language.
- **Time-box** — hours to a day. A spike that grows into a week is a project; re-plan.
- **Done when** — the smallest observable proof (a bot that echoes; a script that lists
  today's events). Not "we understand it better" — something you can see.

A spike *converts* a known-unknown into a known-known. Its code is disposable; its
**answer** is the deliverable.

## Unknown known — "we already know it, we just haven't connected it"

Relevant knowledge or a **stated constraint that already exists** but the builder has not
noticed or tied to the decision at hand — a line in `product.md` that already answers (or
scopes out) a concern; a platform fact that changes the plan. Output: **a one-line brief
that surfaces the fact and connects it** to the decision.

This quadrant is **not** for unchecked assumptions. "Google will obviously allow this" feels
like knowledge but is a guess — surface it and route it to **known unknown** for validation.
An unknown-known is something true you already have; an assumption is something you hope.

## Unknown unknown — "we don't know what we don't know"

Blind spots. You cannot list them, but you can point at the **territory** where they cluster
and go looking:

- Third-party **review / verification** gates before sensitive or restricted access — verify
  the *current* rules from the provider's docs, including any exceptions (e.g. personal-use).
- **Failure and change**: a redeploy mid-conversation, a revoked token, a service outage.
- **Limits and cost** at real usage: rate limits, quotas, always-on billing.

The move: **turn unknown-unknowns into known-unknowns** — ask someone who has shipped this,
or read the provider's "limits", "pricing", and "production readiness" pages, and cite what
you find.

## Prioritizing spikes

Do first the spike whose wrong answer costs the most, not the most obvious one. Rank by:

1. **Blocking** — does everything else depend on the answer?
2. **Uncertainty** — how likely are we to be wrong?
3. **Blast radius** — redesign, real money, or a long external wait if we are?

An external-dependency spike (a verification process whose timeline you don't control)
usually outranks anything you can build on your own schedule — but confirm the timeline is
real against current docs before ranking on it.

## Where this feeds

A resolved spike supports only the mechanisms and conditions it actually tested. Feed its
findings and evidence limits to `slice` or `squad-decompose`: they inform readiness,
`context.read_first` and implementation constraints. Shaping can reveal another targeted
question; unrelated future-product unknowns need not block a small bet.
