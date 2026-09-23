---
name: squad-decompose
description: This skill should be used when the user asks to "break this into stories", "decompose this slice/feature", "plan this into chunks", "create the backlog", "write user-story.json", "turn this scope/RFC into stories", or to add a new ask to an existing story backlog. It decomposes scope into right-sized, independently-verifiable stories in a machine-readable backlog, then STOPS for approval before any implementation. Pairs with squad-execute.
---

# squad-decompose

Phase 1 of the squad workflow: turn a body of work into a DAG of right-sized,
independently-verifiable stories written to `user-story.json`, then **stop** and
wait for human approval. Write no implementation code in this phase.

The companion skill `squad-execute` consumes the file this skill produces. The
shared contract they both obey lives in:

- **`../_shared/references/schemas.md`** — the exact `user-story.json` schema. Read it before writing the file.
- **`../_shared/references/conventions.md`** — sizing rule, DAG rules, calibration, the role wall.
- **`../_shared/templates/user-story.template.json`** — a copyable starting point.

(Paths are relative to this skill's own directory; `_shared` is its sibling.)

## The role wall

Act as the **lead**: decompose, sequence, and own the backlog file. Do not edit
source files in this phase — that is `squad-execute`'s job. If tempted to start
building, stop; the plan is reviewed first.

## Procedure

### 1. Calibrate — detect first, ask only the gaps

Read the repo before asking anything. Detect the build/test commands, the test
runner, any existing backlog file and its id scheme, and whether a scope layer
exists. Then choose the mode:

- **Formal** — an authority doc (`scope.md`, a `docs/**/slices` scope) is present.
  Record it in `scope_authority`; put any RFC/ADR in `constraint_docs` (they restrict
  *how*, not *what*). The mere presence of an RFC/ADR does **not** make it authoritative
  or make the project formal. Stories carry `scope_refs`. If authority and a constraint
  doc disagree, raise an `open_question` — never guess. "The authority defines scope; you
  do not add to it."
- **Lightweight** — no authority doc. Stories derive from the human's asks. Capture each
  ask **verbatim** in `from_ask`; nothing is paraphrased away or lost between messages.

Ask the human only for the genuinely unknowable: where the state files should live
(default: repo root), the `non_negotiables`, and any credentials the work will need
(assign those back to the human as a task — never invent a secret). Keep it to a few
questions; do not interrogate for what the repo already answers.

### 2. Carry the selected bet into the plan

Read the exact human-selected pitch and its revision, including the candidate visual,
source/design references and evidence. If selection was conversational, save a short
`slice.md` (or existing scope path) using the slice template's contract fields; retain the
approval reference. Do not require the human to select again. Do not treat every option in
`slice-candidates.md` or every feature in `PRODUCT.md` as authorized scope.

Populate `bet` per `schemas.md`: approval provenance, actual appetite/accounting and one
integrated outcome verification. Compare it with the pitch; ask only missing decisions.
A lightweight ask needs the same boundaries, but can use a few sentences instead of a large
pitch. Per-story context size and optional agent resource limits do not replace appetite.
An unresolved critical mechanism or source/design conflict pauses the affected commitment:
return to a targeted spike or reshape before execution. No DESIGN.md is required when the
scope does not need one. Keep the experience breadboard distinct from the story DAG.

### 3. Establish the non-negotiables

Record the invariants that outrank every story — the things that, if violated, kill
the product regardless of what a story says (e.g. a safety rule, a data-integrity
rule). A proposed story that breaks one is rejected, not queued.

### 4. Decompose per the sizing rule

Apply the full sizing rule from `conventions.md`. In short: one story = one session
(≤ ~250k context, ≤ ~10 files, ≤ 7 ACs, one vertical concern, one contract change).
Then:

- Make the **first** story a **walking skeleton** — the thinnest end-to-end thread
  that runs. Deepen it in later stories. Prefer vertical threads over horizontal
  layer-by-layer stories. Label internal demos as increments, not shipped bets. State
  what action/result each increment demonstrates, and map it to the selected pitch.
  Only cover layers required for this outcome; do not add future subsystems.
- Wire `depends_on` / `blocks` into a **DAG** with no cycles.
- For each story write **`context.read_first`** — the ordered, specific reading path a
  fresh squad follows before touching anything. This is the highest-value field you
  write; it is what keeps the story inside one session. (There is **no** `context.touches`
  / file-budget field — the squad decides which files the story needs, and scope + AC
  review catches unrelated changes.)
- Set `squad.members` to **only** the roles this story needs — execution spawns exactly
  those. Don't list a role that merely *could* apply (no Designer just because copy exists).
- Give each story real `acceptance_criteria` and a `verification` block with exact,
  re-runnable commands and a `done_when` a reviewer can confirm without reading the
  diff. A story with no way to prove it is done is underspecified — fix it now.

### 5. Write `user-story.json` and STOP

Write the file to the calibrated location using the schema — including `schema_version: 2`, `bet`,
`scope_authority` / `constraint_docs`, and (if the work will mutate anything outside the
repo) an `external_actions` policy. Stamp `generated_at` with the real date. Then end the
turn with:

- A **summary table**: id, title, size estimate, `depends_on`, verification method.
- Any **open_questions** that block execution.

Do **not** begin implementation. Wait for approval.

## Re-decomposition (amending a live backlog)

Follow `conventions.md`: classify the request as a clarification/discovered work within
the contract, a human-approved scope swap within the same appetite, or a future candidate /
new bet. Do not automatically insert an addition into the active DAG. For an approved swap,
record what leaves, update pitch/revision/visual and plan together, and append the decision
to `bet_checks`. Never rewrite done stories or silently weaken ACs. Repair dependencies,
check coverage and remaining appetite, and stop for approval of the amended execution plan.

## Handoff

On approval, the human runs `squad-execute`, which reads `user-story.json`, walks the
DAG, and executes one story at a time behind the evidence gate.
