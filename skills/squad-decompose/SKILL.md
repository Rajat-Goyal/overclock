---
name: squad-decompose
description: This skill should be used when the user asks to "break this into stories", "decompose this slice/feature", "plan this into chunks", "create the backlog", "write user-story.json", "turn this scope/RFC into stories", or to add a new ask to an existing story backlog. It decomposes scope into right-sized, independently-verifiable stories in a machine-readable backlog, then STOPS for approval before any implementation. Pairs with squad-execute.
version: 0.1.0
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

- **Formal** — a `docs/**/slices` dir, an RFC, or an ADR is present. Stories derive
  from those docs and carry `scope_refs`. Ambiguities become `open_questions`, never
  guesses. "They define scope; you do not add to it."
- **Lightweight** — no scope docs. Stories derive from the human's asks. Capture each
  ask **verbatim** in `from_ask`; nothing is paraphrased away or lost between messages.

Ask the human only for the genuinely unknowable: where the state files should live
(default: repo root), the `non_negotiables`, and any credentials the work will need
(assign those back to the human as a task — never invent a secret). Keep it to a few
questions; do not interrogate for what the repo already answers.

### 2. Establish the non-negotiables

Record the invariants that outrank every story — the things that, if violated, kill
the product regardless of what a story says (e.g. a safety rule, a data-integrity
rule). A proposed story that breaks one is rejected, not queued.

### 3. Decompose per the sizing rule

Apply the full sizing rule from `conventions.md`. In short: one story = one session
(≤ ~250k context, ≤ ~10 files, ≤ 7 ACs, one vertical concern, one contract change).
Then:

- Make the **first** story a **walking skeleton** — the thinnest end-to-end thread
  that runs. Deepen it in later stories. Prefer vertical threads over horizontal
  layer-by-layer stories.
- Wire `depends_on` / `blocks` into a **DAG** with no cycles.
- For each story write **`context.read_first`** — the ordered, specific reading path a
  fresh squad follows before touching anything. This is the highest-value field you
  write; it is what keeps the story inside one session. Also set `context.touches`
  (the files the story may change — the diff budget the gate will enforce).
- Give each story real `acceptance_criteria` and a `verification` block with exact,
  re-runnable commands and a `done_when` a reviewer can confirm without reading the
  diff. A story with no way to prove it is done is underspecified — fix it now.

### 4. Write `user-story.json` and STOP

Write the file to the calibrated location using the schema. Stamp `generated_at`
with the real date. Then end the turn with:

- A **summary table**: id, title, size estimate, `depends_on`, verification method.
- Any **open_questions** that block execution.

Do **not** begin implementation. Wait for approval.

## Re-decomposition (amending a live backlog)

Invoked again on an existing backlog, insert the new ask as a story into the DAG with
its rationale in `why_now`. Never rewrite a `done` story; renumber only unshipped ids.
This is how the backlog stays the single source of truth once execution is underway.

## Handoff

On approval, the human runs `squad-execute`, which reads `user-story.json`, walks the
DAG, and executes one story at a time behind the evidence gate.
