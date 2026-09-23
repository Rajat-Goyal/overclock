---
name: squad-execute
description: This skill should be used when the user asks to "execute the next story", "run the squad", "ship story S...", "work the backlog", "run the slice", or to implement stories from a user-story.json backlog. It runs a squad (subagent) execution loop behind an evidence gate — select a ready story from the DAG, delegate implementation, verify each acceptance criterion independently, and close only on green. Pacing is chosen at the start of the run. Pairs with squad-decompose.
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

## Choose the pacing

Three tiers. Pick like this: **if the backlog or the user's instruction already specifies a
pacing (an execution contract), honor it.** Otherwise **ask** which tier — recommending
**controlled-unattended** as the default. Never silently override an existing
stop-per-story contract with unattended.

1. **Stop after every story** — close one story, hand back the evidence packet, wait.
2. **Stop at chunk/milestone edges** — run stories continuously within a milestone, stop
   for an evidence rundown at its boundary.
3. **Controlled-unattended (recommended default)** — run the DAG until it is drained or a
   stop-condition fires. "Controlled" because every circuit-breaker still halts it and
   evidence is written per story, so even an unattended run leaves a full audit trail.

Regardless of tier, **every stop-condition in `conventions.md` forces an immediate halt**
and escalation — pacing controls the *happy path* only.

## The loop — one story per iteration

1. **Check the bet, then select.** Validate both state-file versions (version 1 migration
   is in `schemas.md`). Read `bet` and its exact selected pitch/revision; confirm approval,
   source/design consistency and critical readiness. On every start/resume and before each
   story, measure consumed/remaining appetite, append a `before-story` bet check, and
   confirm there is room for integration and verification. Never reset an existing clock
   or infer appetite from story count/context size. Exhausted/unknown appetite or a critical
   conflict stops the run. When the approved start trigger occurs, persist `started_at`
   (and the elapsed-time deadline, if applicable) before dispatch.

   On resume, reconcile `current_stories` and `in_progress`/`blocked` stories against actual
   work, evidence and any checkpoint before selecting new work. Do not duplicate a still
   running squad. On an authorized retry, move the unfinished story to `in_progress`, add
   its ID to `current_stories`, and resume from the checkpoint with fresh agents and the
   same clock; retain prior attempt logs and fix-attempt counts. Resolve the recorded stop
   reason first. Exhausted bets require a fresh bet, not a retry that resets their allowance.
   Continue the retried story at step 2; otherwise, once interrupted work is accounted for,
   select the lowest-id `todo` story whose dependencies are all `done`.
2. **Bootstrap context, in this order, and stop when you have enough:** the story
   object → its `context.read_first` → the `context_for_next` from the last 2–3
   completed stories → `git log --oneline` since the slice started. Do **not** read the
   repo broadly — that is what `read_first` exists to prevent.
3. **Mark started.** Set `status: in_progress` and **add the id to `current_stories`**
   (an array — parallel branches each add their own); commit `chore(<id>): start story`.
   A crashed run is now visible.
4. **Pre-flight.** Write any artifact a subagent cannot fetch itself (designs, seed
   data, ground truth, credentials) into the repo **before** fan-out. A squad that
   cannot see what it needs will invent it.
5. **Work — delegate to the squad** (mechanism per `adapters.md`). **Spawn only the roles
   in `story.squad.members`** — never add one (e.g. Designer) just because it could apply;
   a role deferred by the mode goes to `pending_reviews`, never silently skipped:
   - Give every squad the bet boundary and current remaining allowance. Check emerging
     risks and the deadline/cap at tool/delegation boundaries; stop at a safe checkpoint
     if reached mid-story. Follow the monitoring limitations in `conventions.md`.
   - PM confirms the ACs against the authority scope; rejects scope creep.
   - Staff engineer implements in small logical commits, touching whatever files the story
     genuinely needs (no file-list gate — scope + AC review catches strays).
   - **QA verifies independently of the implementer** — a separate Workflow verify agent
     (Claude) or a separate subagent (Codex), never the author grading itself. It runs
     `verification.commands`, writes artifacts to `evidence/<id>/`, and returns per-AC
     pass/fail.
   - **Before any world-mutating action** (deployment, DB migration, webhook cutover,
     service restart) resolve the **exact** target, check `external_actions` — refuse a
     `deny` target, get human approval for an `approval_required` kind — and record it in
     `external_actions_taken`.
6. **Gate — all must hold to close:** every AC verified with evidence on disk;
   `verification.commands` pass from a clean checkout; build + full test suite green; the
   change does **only what the story's scope and ACs call for** (unrelated refactors
   rejected in review). Any failure keeps the story `in_progress`.
7. **Close.** Update `user-story.json` (`status: done`), **remove the id from
   `current_stories`**, and append the `progress.json` entry — including `context_for_next`
   (≤ 10 lines), any `external_actions_taken`, and any `pending_reviews`. State-file
   updates are the **last** commit, separate from code.
8. **Check and report.** Append an `after-story` bet check with updated usage, remaining
   appetite and the continue/cut/reshape/stop decision. Report the completed increment,
   evidence, re-run commands, deviations and remaining allowance. Do not label an internal
   increment as a shipped bet. Honor per-story / per-chunk pacing here.
9. **Verify the integrated outcome.** When the planned stories are complete, independent
   QA runs `bet.verification`, reusing story evidence where it covers the actual full flow.
   Append an `integrated` check. All stories green plus a failed/missing full-flow check is
   an incomplete bet: record a defect and seek an in-scope fix within remaining appetite,
   or stop. Only report completion when the outcome and required release checks pass;
   external-action approvals still apply and bet-level mutations go in the check's
   `external_actions_taken`. Inspect value evidence and stop for the human's
   next bet choice even if time remains.

## Anti-drift (non-negotiable)

- **Never weaken an acceptance criterion to make it pass.** Only the human changes an
  AC, and only with the reason logged in `deviations_from_plan`.
- **Two honest fix attempts, then stop.** Still failing → mark `blocked`, record the
  failing evidence, escalate. Do not thrash.
- **`log` is append-only.** Never amend, rebase, or force-push a completed story's
  commits. No commit leaves build or tests broken.

## Stop conditions — escalate, do not decide alone

Appetite or an optional resource cap exhausted/unknown; the remaining work no longer fits;
an unresolved critical mechanism; failed integrated outcome; story conflicts with a
`scope_authority` doc (or an authority/constraint disagreement); a
dependency's real output differs from what the story assumed; verification fails after two
attempts; the story turns out too large (split it as `S01-04a`/`S01-04b` rather than
cramming one run); an external action targets a `deny` identity or an `approval_required`
action lacks approval; missing credentials only the human can provide.

On a stop, follow `conventions.md` and the schema checkpoint contract: halt new dispatch,
stop active squads, preserve unfinished diffs/code, evidence and questions, mark active
stories blocked and append the ledger records. No automatic extension at the investment
limit, no claim that preservation shipped value, and no promise of continuation. Any
further investment after exhaustion requires a fresh human-selected bet.
