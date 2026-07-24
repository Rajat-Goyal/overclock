# Conventions — the rules both skills obey

These are harness-neutral. The Claude Code and Codex adapters (`adapters.md`)
change *how* the loop is executed, never *these* rules.

---

## Sizing: one story = one session

A story is correctly sized when a fresh squad can load context, build, verify, and
commit inside a single working-context window with headroom. Proxies:

- ≤ ~250k tokens of working context (scale to the model's window; leave headroom).
- ≤ ~10 files touched, ≤ 7 acceptance criteria.
- One vertical concern; at most **one** contract/interface change.
- Needing to read more than ~3 modules end-to-end just to *start* = too big. Split it.

Shape of a good decomposition:

- The **first** story is a **walking skeleton** — the thinnest end-to-end thread
  that runs. Later stories deepen it. Prefer vertical threads over horizontal
  layer-by-layer stories.
- Every story leaves the repo **green** (builds, tests pass). No half-landed states.
- Every story is **independently verifiable** — confirmable without reading the diff.
- Dependencies form a **DAG**. No cycles.

---

## Calibration: detect first, ask only the gaps

Detect from the repo — do not interrogate the human for what is already written down:

- Build / test / lint commands → `package.json` scripts, `Makefile`, CI config.
- Test runner and what "green" means.
- Existing story/ledger file location and id scheme.
- Scope source: a `docs/**/slices`, RFC, or ADR present → **formal** mode; otherwise
  **lightweight** mode.

Ask the human only for the genuinely unknowable:

- Where the two state files should live (default: repo root).
- The `non_negotiables` — invariants that outrank stories — if not already recorded.
- Any credentials/access the work needs. Assign these back to the human as a task;
  never fabricate or guess a secret.

---

## Evidence: measured, not suspected

- Evidence lives at `evidence/<story-id>/` and is committed to the repo.
- A story closes only when its `verification.commands` pass from a **clean checkout**
  and the artifacts are on disk.
- Prefer a script that **reproduces the risk and reports a number** over an assertion
  that reading the source "looks right."
- **Verify the artifact, not the intention.** Check the emitted schema / actual output
  / real request — not the source that is supposed to produce it. (A property can be
  broken three files away from where it is declared.)

---

## The gate: all must hold to close a story

1. Every acceptance criterion verified, with evidence on disk.
2. `verification.commands` pass from a clean checkout.
3. Build + full test suite green.
4. Diff stays within `context.touches`.

---

## Anti-drift rules (non-negotiable)

An autonomous run's characteristic failure is quietly moving the goalposts. These
exist to prevent that:

- **Never weaken an acceptance criterion to make it pass.** Only the human changes an
  AC, and only with the reason recorded in `deviations_from_plan`.
- **QA is independent of the implementer.** Whoever verifies an AC is not the agent
  that wrote the code for it. (Under Claude, a separate verify agent; under Codex, a
  separate subagent.)
- **Two honest fix attempts, then stop.** Verification still failing → mark the story
  `blocked`, record the failing evidence, escalate. Do not thrash.

---

## Commit protocol

- Format: `<type>(<story-id>): <imperative summary>`. Body: what changed and why,
  which ACs it covers, the evidence path, scope refs.
- **Mark start:** set `status: in_progress` + `current_story`, commit
  `chore(<id>): start story`. This makes a crashed run visible.
- **State-file updates are the last commit of a story**, never mixed with code.
- No commit leaves build or tests broken. Never amend, rebase, or force-push the
  commits of a completed story. `log` is append-only.

---

## Stop conditions: escalate, do not decide alone

- The story conflicts with scope / RFC / ADR.
- A dependency's actual output differs from what this story assumed.
- Verification fails after two honest attempts.
- The story turns out too large → split it in `user-story.json` (`S01-04a`,
  `S01-04b`) rather than cramming it into one run.
- Missing credentials or access only the human can provide.

---

## The role wall

The **lead** (orchestrator) decomposes, delegates, reviews at story boundaries, and
owns the two state files. The lead does **not** write implementation code — that
belongs to squads. If the lead finds itself editing source, stop and delegate.

Squad roles (compose per story; not every story needs every role):

- **PM** — owns the acceptance criteria; confirms intent against scope; rejects scope
  creep. Writes no code.
- **Staff engineer** — designs within constraints, implements, keeps the diff minimal.
- **QA** — writes verification *alongside* implementation, runs it, produces evidence,
  signs off on each AC independently of the implementer.
- **Designer** — only when there is a user-facing surface; owns flow, states, copy.

---

## Re-decomposition: amending a live backlog

A new ask arriving mid-flight becomes a story like any other — inserted into the DAG,
its rationale in `why_now`. Never rewrite a `done` story; renumber only unshipped ids.
This is how the backlog stays the single source of truth instead of drifting out of
date the moment execution starts.
