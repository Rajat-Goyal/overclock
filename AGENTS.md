# overclock — agent instructions

This repo is a collection of agent skills for building faster and safer: **de-risk**
the unknowns, **decompose** the work into verifiable stories, then **execute** them with
a squad of subagents behind an evidence gate. Harness-neutral — the same method runs
under Claude Code and Codex.

If operating in this repo (or one that has adopted these skills), follow the phase that
fits where you are. Each skill's `SKILL.md` is the full guide; the squad contract lives
in `skills/_shared/references/`.

## Skills

Use any skill on its own — they compose but are **not** a rigid pipeline.

- **`skills/derisk/SKILL.md`** — turn a `product.md` (or a pile of concerns) into a
  Rumsfeld-matrix map and prioritized **candidate spikes**.
- **`skills/spike/SKILL.md`** — turn a chosen spike + scope into a concrete `spike.md`;
  delegates the questions to the external `grill-me` skill (Matt Pocock's) and asks where
  the file goes.
- **`skills/slice/SKILL.md`** — use product intent, available design/evidence and appetite
  to propose **candidate vertical slices** and recommend a bet. The human-selected pitch
  and visual feed decompose.
- **`skills/squad-decompose/SKILL.md`** — turn settled scope into a DAG of right-sized,
  independently verifiable **stories** (`user-story.json`), then STOP for approval.
- **`skills/squad-execute/SKILL.md`** — execute the backlog one story at a time behind
  the evidence gate, logging to `progress.json`.

`grill-me` (by Matt Pocock) is an **external** skill, installed separately — not part of
this repo. `spike` uses it when present.

## Read first (for the squad workflow)

- `skills/_shared/references/schemas.md` — the `user-story.json` and `progress.json` schemas.
- `skills/_shared/references/conventions.md` — sizing, the gate, anti-drift rules, commit protocol.
- `skills/_shared/references/adapters.md` — how to run the squad on this harness. **Codex: agents/subagents. Claude Code: dynamic Workflows.**

## Phase 0 — de-risk (when facing unknowns)

Surface the questions/concerns a builder has, sort them onto the Rumsfeld matrix, and
turn the known-unknowns into **candidate** spikes (small, time-boxed, throwaway; each
with concrete options). The builder picks which to run; the `spike` skill grills for the
minimum viable decisions (via the external `grill-me` skill) and writes a `spike.md`. A
spike supports only the mechanisms and conditions its evidence tested; shaping may reveal
further critical questions. Feed those findings into shaping or decomposition.

## Phase 0.5 — shape the slice (Shape Up)

Read product intent, relevant available design/whiteboards, spike evidence and implementation.
Honor the human's appetite; ask only missing decisions. Propose bounded useful outcomes with
compact visual comparisons and experience flows. Check the critical mechanisms for this bet;
route unsupported ones to a targeted spike or narrower scope. Shaping and de-risking iterate.
The human chooses; other candidates remain uncommitted. Save the selected pitch/visual with
approval, sources/constraints, appetite/accounting, scope/no-gos/cuts and integrated verification.
The product is the vision; the pitch is this bet; stories are integrated implementation pieces.

## Phase 1 — decompose (then STOP)

Act as the **lead**; write no implementation code. Produce `user-story.json`: a DAG of
stories, the first a walking skeleton, each sized to one session, each with
`context.read_first` and a re-runnable `verification` block. Carry the selected pitch,
approved appetite and integrated check in the schema-v2 `bet` contract. Capture lightweight-mode
asks **verbatim** in `from_ask`. End with a summary table and open questions; wait.

## Phase 2 — execute (one story per iteration)

Honor supplied pacing; otherwise ask (default: controlled-unattended). Loop: check remaining
bet appetite and readiness → select
the lowest-id ready story → bootstrap only `context.read_first` plus the last few
`context_for_next` batons → mark started and commit → delegate implementation to a
subagent → have a **separate** subagent verify each acceptance criterion and write
evidence to `evidence/<story-id>/` → close only when the gate is green → append to
`progress.json` → check remaining appetite and report the evidence packet. After stories
pass, independent QA verifies the integrated user outcome. Green stories alone are not a
completed bet. At the investment limit, stop and checkpoint unfinished code/evidence/questions;
no automatic extension or shipped claim. Further investment needs a fresh human-approved bet.
Scope additions are clarifications, approved swaps within appetite, or future candidates;
never silently grow the active DAG.

## The rule that outranks everything

**Never weaken an acceptance criterion to make it pass.** Only the human changes an AC,
and only with the reason recorded in `deviations_from_plan`. Verification failing after
two honest attempts → mark `blocked` and escalate. Do not thrash, do not guess through a
scope conflict, do not let an implementer grade its own work.
