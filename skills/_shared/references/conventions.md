# Conventions — the rules both skills obey

These are harness-neutral. The Claude Code and Codex adapters (`adapters.md`)
change *how* the loop is executed, never *these* rules.

Both state files carry `schema_version` (currently `2`). Validate it before acting;
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
- Internal demoable increments are valid; label them honestly. A story is not the whole
  release bet. Cover the layers needed for its outcome, not every future subsystem.
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
- The bet appetite/accounting and selection, if not already approved; see `schemas.md`.
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

## Bet boundaries and completion

The selected pitch is the durable scope contract; the product is the wider vision. Read
its sources, approved design constraints, evidence and visual alongside `bet` in the plan.
A missing design artifact is not a blocker by itself; an unresolved critical mechanism or
source conflict is. Honor established approvals rather than asking again.

**Before and after every story**, on resume, and when a material risk/change emerges:
measure consumed and remaining appetite, review readiness and scope fit, and append a
`bet_checks` record. Include verification time and all concurrent work per the accounting
rule. A one-session story size is a context limit, not an extension of the bet. Optional
agent budgets are separate caps. Unknown usage pauses work; never silently reset it.

Before starting a story, leave room for integration and verification. If remaining work no
longer credibly fits, use permitted cuts or stop for reshaping. Cuts cannot remove essential
quality, permissions, truthfulness, independent QA or non-negotiables. Any AC change still
requires the human's recorded reason. Review risks during a story too: if a deadline or
resource cap is reached mid-story, stop active work at a safe checkpoint rather than waiting
for the next boundary. Arrange a deadline/cap notification or bounded work chunks when the
harness supports them; if it cannot monitor continuously, state that limitation and check
at each tool/delegation boundary. Do not promise a hard real-time kill switch.

At the investment limit, **no automatic extension**: halt new work, stop active squads,
preserve code (including unfinished diffs), evidence, open questions and a checkpoint, and
record a `stop` check. The bet is unfinished, not shipped. Further investment needs a fresh
human-approved bet with its own scope and limit; archive/reference the old plan and ledger
instead of overwriting them. A blocked story retry within an unexhausted bet still checks
remaining appetite.

When stories are green, independent QA runs `bet.verification` on the integrated result,
reusing existing checks. Record `integrated_result` and evidence. A failure leaves the bet
incomplete even if individual stories stay done: record a defect and re-decompose the fix
within remaining scope/appetite, or stop. Required release actions still obey
`external_actions`; tests or an internal demo alone cannot authorize deployment or a shipped
claim. Finish early → inspect outcome and value evidence, then wait for deliberate human
selection of another bet. Never auto-fill spare capacity with candidate scope.

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
  `external_actions_taken` (on the story log, or on `bet_checks` for integrated verification
  and release outside a story). A disposable-local reset and a production migration are
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

- Appetite/resource cap exhausted or unknown, remaining scope no longer fits, or a critical mechanism lacks support.
- The integrated outcome fails even though stories passed.
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

Classify a new ask before changing the active DAG:

- **Clarification / discovered implementation work:** fits the approved outcome, constraints
  and appetite; adjust pending stories/edges and record why. Do not smuggle a new outcome
  into this category or weaken an AC.
- **Scope swap:** the human approves what enters and what leaves, with rationale and the
  same investment boundary. Update the pitch/revision/visual and plan together; append a
  `scope-change` check with approval and any AC changes in `deviations_from_plan`.
- **Future candidate / new bet:** an addition that expands the commitment or needs further
  investment stays outside the active DAG until separately selected. Do not infer approval
  from a request to discuss it.

Keep the graph revisable as evidence arrives. Preserve done stories and stable IDs; park
superseded pending work with a reason, repair edges and confirm the DAG remains acyclic.
Before restarting, check scope coverage, integrated verification and remaining appetite.
The backlog implements the current contract; it does not silently enlarge it.
