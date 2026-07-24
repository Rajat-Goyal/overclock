# Conventions — the rules both skills obey

These are harness-neutral. The Claude Code and Codex adapters (`adapters.md`)
change *how* the loop is executed, never *these* rules.

Both state files carry `schema_version` (currently `1`). Validate it before acting;
migrate or flag an older/unknown version rather than assuming today's rules.

---

## Sizing: one story = one session

A story is correctly sized when a fresh squad can load context, build, verify, and
commit inside a single working-context window with headroom. Proxies:

- ≤ ~250k tokens of working context (scale to the model's window; leave headroom).
- ≤ ~10 files changed, ≤ 7 acceptance criteria. *(A rough sizing heuristic, not a
  file-list gate — the squad decides which files the story actually needs.)*
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
- Scope source: an authority doc (`scope.md`, a `docs/**/slices` scope) present →
  **formal** mode; otherwise **lightweight**. RFC/ADR are *constraint* docs — their
  presence does not by itself make a project formal or make them authoritative.

Ask the human only for the genuinely unknowable:

- Where the two state files should live (default: repo root).
- The `non_negotiables` — invariants that outrank stories — if not already recorded.
- The `external_actions` policy (below) if the work will mutate anything outside the repo.
- Any credentials/access the work needs. Assign these back to the human as a task;
  never fabricate or guess a secret.

---

## Scope authority

`scope_authority` docs define *what* is in scope; `constraint_docs` (RFC/ADR) restrict
*how* it is built. Authority wins on scope. If an authority doc and a constraint doc
disagree, raise an `open_question` — do not silently promote an old RFC/ADR to equal
authority with the scope.

---

## Evidence: measured, not suspected

- Evidence lives at `evidence/<story-id>/` and is committed to the repo.
- A story closes only when its `verification.commands` pass from a **clean checkout**
  and the artifacts are on disk.
- Prefer a script that **reproduces the risk and reports a number** over an assertion
  that reading the source "looks right."
- **Verify the artifact, not the intention.** Check the emitted schema / actual output
  / real request — not the source that is supposed to produce it.

---

## The gate: all must hold to close a story

1. Every acceptance criterion verified, with evidence on disk.
2. `verification.commands` pass from a clean checkout.
3. Build + full test suite green.
4. The change does **only what the story's scope and ACs call for** — unrelated
   refactors are rejected in scope + AC review. (There is no file-list gate; the squad
   is trusted to touch whatever the story genuinely needs.)

---

## External actions: nothing mutates the world unchecked

Anything that changes state outside the working tree — a real database, a deployment, a
webhook, a running service — is governed by `external_actions`:

- Resolve the **exact** target identity *before* the mutation (which database, which
  service, which URL). Refuse any identity in `targets.deny`.
- An action kind in `approval_required` (or listed nowhere) **pauses for explicit human
  approval**. Only `allowed` kinds run unattended.
- Record every action taken — kind, resolved target, who approved — in the ledger's
  `external_actions_taken`. A disposable-local reset and a production migration are
  different actions and must never be conflated.

---

## Anti-drift rules (non-negotiable)

- **Never weaken an acceptance criterion to make it pass.** Only the human changes an
  AC, and only with the reason recorded in `deviations_from_plan`.
- **QA is independent of the implementer.** Whoever verifies an AC is not the agent
  that wrote the code for it.
- **Two honest fix attempts, then stop.** Verification still failing → mark the story
  `blocked`, record the failing evidence, escalate. Do not thrash.

---

## Commit protocol

- Format: `<type>(<story-id>): <imperative summary>`. Body: what changed and why,
  which ACs it covers, the evidence path, scope refs.
- **Mark start:** add the story to `current_stories` + set `status: in_progress`, commit
  `chore(<id>): start story`. This makes a crashed run visible.
- **State-file updates are the last commit of a story**, never mixed with code.
- No commit leaves build or tests broken. Never amend, rebase, or force-push the
  commits of a completed story. `log` is append-only.

---

## Stop conditions: escalate, do not decide alone

- The story conflicts with a `scope_authority` doc (or an authority/constraint disagreement).
- A dependency's actual output differs from what this story assumed.
- Verification fails after two honest attempts.
- The story turns out too large → split it in `user-story.json` (`S01-04a`, `S01-04b`).
- An external action targets a `deny` identity, or an `approval_required` action has no approval.
- Missing credentials or access only the human can provide.

---

## The role wall

The **lead** (orchestrator) decomposes, delegates, reviews at story boundaries, and
owns the two state files. The lead does **not** write implementation code — that
belongs to squads. If the lead finds itself editing source, stop and delegate.

Squad roles — **spawn only the roles listed in `story.squad.members`.** Not every story
needs every role; do not add a role just because it *could* apply (never add Designer
merely because copy exists). If a role is deferred by the chosen execution mode, record
it in `pending_reviews` — never silently skip it.

- **PM** — owns the acceptance criteria; confirms intent against authority scope; rejects
  scope creep. Writes no code.
- **Staff engineer** — designs within constraints, implements, keeps the change focused.
- **QA** — writes verification *alongside* implementation, runs it, produces evidence,
  signs off on each AC independently of the implementer.
- **Designer** — only when there is a genuine user-facing surface; owns flow, states, copy.

---

## Re-decomposition: amending a live backlog

A new ask arriving mid-flight becomes a story like any other — inserted into the DAG,
its rationale in `why_now`. Never rewrite a `done` story; renumber only unshipped ids.
This keeps the backlog the single source of truth instead of drifting the moment
execution starts.
