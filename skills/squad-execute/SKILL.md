---
name: squad-execute
description: This skill should be used when the user asks to "execute the next story", "run the squad", "ship story S...", "work the backlog", "run the slice", or to implement stories from a user-story.json backlog. It runs a squad (subagent) execution loop behind an evidence gate — select a ready story from the DAG, delegate implementation, verify each acceptance criterion independently, and close only on green. Pacing is chosen at the start of the run. Pairs with squad-decompose.
version: 0.1.0
---

# squad-execute

Phase 2 of the squad workflow: execute the stories in `user-story.json` one at a
time, each behind an evidence gate, recording every run in an append-only
`progress.json`. Requires a `user-story.json` produced (and approved) via
`squad-decompose`.

The shared contract lives in:

- **`../_shared/references/schemas.md`** — the `user-story.json` and `progress.json` schemas.
- **`../_shared/references/conventions.md`** — the gate, anti-drift rules, commit protocol, stop conditions.
- **`../_shared/references/adapters.md`** — how to run the squad on **Claude Code** (dynamic Workflows) vs **Codex** (subagents). Read the section for the current harness.
- **`../_shared/templates/progress.template.json`** — a copyable starting point.

(Paths are relative to this skill's own directory; `_shared` is its sibling.)

## The role wall

Act as the **lead**: select work, delegate, review at story boundaries, own the two
state files. **Do not write implementation code** — that belongs to squads. If found
editing source, stop and delegate.

## A fresh squad per story

Every story gets a **new squad** — freshly spawned subagents with clean context windows,
seeded only by the story object, its `context.read_first`, and the last 2–3
`context_for_next` batons. **Never reuse or keep a previous story's agent "warm"** to
carry it into the next story: that quietly defeats *one story = one session* — context
accumulates, drifts, and the sizing guarantee is gone.

Continuity is carried as **data, not a live session.** The written `context_for_next`
baton (plus `read_first`) is exactly what lets a fresh squad pick up the thread without
inheriting the last squad's bloated context — the memory without the drift. Under Claude
this is automatic (each `agent()` call is a new subagent); under Codex, spawn new
subagents per story rather than threading one through.

The only unavoidably long-lived context is the **lead**, which is why the role wall bars
it from doing the work: it spawns, gates, and records, and stays thin.

## Choose the pacing (ask at the start of the run)

Ask the human how autonomous the loop should be, then honor it. Default to the third
option:

1. **Stop after every story** — close one story, hand back the evidence packet, wait.
2. **Stop at chunk/milestone edges** — run stories continuously within a milestone,
   stop for an evidence rundown at its boundary.
3. **Unattended + circuit-breakers (default)** — run the DAG until it is drained or a
   stop-condition fires. Evidence is written per story either way, so an unattended
   run still leaves a full audit trail.

Regardless of pacing, **every stop-condition in `conventions.md` forces an immediate
halt** and escalation — pacing controls the *happy path* only.

## The loop — one story per iteration

1. **Select.** From the DAG, take the lowest-id story with `status: todo` whose
   `depends_on` are all `done`.
2. **Bootstrap context, in this order, and stop when you have enough:** the story
   object → its `context.read_first` → the `context_for_next` from the last 2–3
   completed stories → `git log --oneline` since the slice started. Do **not** read the
   repo broadly — that is what `read_first` exists to prevent.
3. **Mark started.** Set `status: in_progress` + `current_story`; commit
   `chore(<id>): start story`. A crashed run is now visible.
4. **Pre-flight.** Write any artifact a subagent cannot fetch itself (designs, seed
   data, ground truth, credentials) into the repo **before** fan-out. A squad that
   cannot see what it needs will invent it.
5. **Work — delegate to the squad** (mechanism per `adapters.md`):
   - PM confirms the ACs against scope; rejects scope creep.
   - Staff engineer implements in small logical commits, diff within `context.touches`.
   - **QA verifies independently of the implementer** — a separate Workflow verify
     agent (Claude) or a separate subagent (Codex), never the author grading itself.
     It runs `verification.commands`, writes artifacts to `evidence/<id>/`, and returns
     per-AC pass/fail.
6. **Gate — all must hold to close:** every AC verified with evidence on disk;
   `verification.commands` pass from a clean checkout; build + full test suite green;
   diff within `context.touches`. Any failure keeps the story `in_progress`.
7. **Close.** Update `user-story.json` (`status: done`) and append the `progress.json`
   entry — including `context_for_next` (≤ 10 lines: what exists now, which interfaces
   are stable, what the next squad should not re-derive). State-file updates are the
   **last** commit, separate from code.
8. **Report the evidence packet** to the human: what shipped, evidence paths, the exact
   re-run command per AC, deviations, follow-ups. Under stop-after-story / stop-at-chunk
   pacing, wait here.

## Anti-drift (non-negotiable)

- **Never weaken an acceptance criterion to make it pass.** Only the human changes an
  AC, and only with the reason logged in `deviations_from_plan`.
- **Two honest fix attempts, then stop.** Still failing → mark `blocked`, record the
  failing evidence, escalate. Do not thrash.
- **`log` is append-only.** Never amend, rebase, or force-push a completed story's
  commits. No commit leaves build or tests broken.

## Stop conditions — escalate, do not decide alone

Story conflicts with scope/RFC/ADR; a dependency's real output differs from what the
story assumed; verification fails after two attempts; the story turns out too large
(split it in `user-story.json` as `S01-04a`/`S01-04b` rather than cramming one run);
missing credentials only the human can provide.
