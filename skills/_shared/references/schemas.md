# Schemas — the two state files

The workflow is driven by two machine-readable files. `squad-decompose` writes
the plan; `squad-execute` reads the plan and writes the ledger. They live
together at a location chosen during calibration (default: repo root).

Keep these schemas identical across both skills and both harness adapters — they
are the contract. Copyable starting points live in `../templates/`.

Both files carry **`schema_version`** (currently `2`). Before acting, a skill
validates it: an unknown/older version is migrated or flagged, never silently
interpreted under newer rules.

---

## `user-story.json` — the plan

Written by `squad-decompose`. Read by `squad-execute`. Amended (never rewritten)
when approved changes to the current bet arrive.

### Top level

| Field | Meaning |
| --- | --- |
| `schema_version` | Integer, currently `2`. Validate before acting. |
| `slice` / `project` | Identifier for this body of work. |
| `mode` | `"formal"` \| `"lightweight"`. Formal derives stories from authority docs; lightweight from captured asks. |
| `generated_at` | ISO-8601. Stamp with the real date at write time — never invent a clock mid-run. |
| `scope_authority` | Paths to the selected pitch/scope that **define this bet**, not every feature in the product vision. |
| `constraint_docs` | Paths to docs that **restrict implementation** (RFC/ADR). They constrain *how*, not *what*. |
| `bet` | Required execution contract: selected pitch reference, approval, appetite and integrated verification (below). |
| `non_negotiables` | Invariants that outrank every story. A story that violates one is rejected, not queued. |
| `external_actions` | Mutation-authority policy (object below). Governs anything that changes the world outside the repo. |
| `stories` | Array of story objects (below). |
| `open_defects` | Known-broken things not yet promoted to a story. |

**Scope authority vs constraints.** Authority docs define *what* is in scope;
constraint docs restrict *how* it may be built. If they disagree, do **not** pick a
winner — raise an `open_question`. The mere presence of an RFC/ADR does not make it
authoritative or required; in formal mode the selected `scope_authority` defines scope. In lightweight mode the
verbatim asks plus their approved, saved `bet.contract_ref` define the current boundary.

### `bet` object (required in both modes)

The selected pitch carries the full reasoning, mechanisms/evidence, diagram (unless text-only),
no-gos, cuts and decisions. The plan carries only what execution needs to enforce it:

| Field | Meaning |
| --- | --- |
| `id` | Stable selected-bet ID; matches the pitch. |
| `contract_ref` / `contract_revision` | Exact path + section and explicit revision (or commit); never an ambiguous candidates file. In lightweight mode a short saved human ask plus boundaries is sufficient. |
| `approved_by` / `approved_at` / `approval_ref` | Human selection/approval provenance. Null while proposed; must be resolved before execution. Reuse existing approval. |
| `appetite.limit` / `unit` | Positive numeric limit and a clear time/investment unit, e.g. `4` / `working-hours`. |
| `appetite.capacity` | Who/what capacity the limit covers; parallel agents do not each receive a fresh bet budget. |
| `appetite.accounting` | How to measure usage, including whether shaping/spikes count. Covers implementation, integration and verification. No invented precision. |
| `appetite.starts_when` / `started_at` | Agreed start trigger and actual ISO timestamp (null until triggered). A resume never resets the clock. |
| `appetite.deadline_at` | ISO timestamp for an elapsed-time deadline, otherwise null. Resolve from the approved limit/start when triggered. |
| `agent_budget` | Optional resource cap, `{limit, unit, accounting}` (e.g. tokens or cost); omit if not requested. Independent of appetite and context sizing; stop if either cap is exhausted. |
| `verification` | Same structure as story verification, but for the integrated outcome. Use `evidence/<bet-id>/`; include exact manual steps if commands cannot establish the result. |

Execution compares these fields to the selected pitch revision. A mismatch blocks affected
work; synchronize the pitch, plan and approval instead of choosing whichever is convenient.
Do not duplicate the whole pitch in every story: use `scope_refs` and `context.read_first`.

### Migration from version 1

Version 2 adds `bet` to the plan and `bet_checks` to the ledger; story objects and historical
`log` entries keep their shape. Before new execution, preserve existing IDs, statuses,
approvals and log entries, save/reference the selected scope, populate `bet` from approved
context, and initialize `bet_checks: []`. Missing appetite, accounting or authority is a
question for the human, never a six-week default. Record already consumed investment with
evidence in an initial check; if it is unknown, pause to resolve it rather than resetting
to zero. Stamp both files version 2 together only once the contract is complete. Do not
backfill invented historical checks. An unknown version is flagged, not guessed at.

### `external_actions` object

Anything that mutates the world outside the working tree (a database, a deployment, a
webhook, a running service) is gated here.

| Field | Meaning |
| --- | --- |
| `allowed` | Action kinds that may run unattended (e.g. `disposable-db-reset`). |
| `approval_required` | Action kinds that pause for explicit human approval (e.g. `production-db-migration`, `deployment`, `webhook-cutover`, `service-restart`). |
| `targets.allow` | The exact resource identities that may be mutated (e.g. `shiori-slice-01`). |
| `targets.deny` | Identities that must **never** be mutated (e.g. a legacy service). |

`squad-execute` resolves the **exact** target identity before any mutation, refuses a
`deny` target, requires approval for an `approval_required` kind, and records the
resolved identity in evidence. An action not listed anywhere defaults to
approval-required.

### Story object

| Field | Meaning |
| --- | --- |
| `id` | Stable, ordered. Slice-prefixed (`S01-03`) in formal mode; flat (`S15`) in lightweight. Never reuse or renumber a shipped id. |
| `title` | Short imperative. |
| `user_story` | `As a <role>, I want <capability>, so that <outcome>`. |
| `from_ask` | The human's request, **verbatim**. The most important field in lightweight mode: nothing is paraphrased away. |
| `why_now` | One line of sequencing rationale. |
| `scope_refs` | Where in the authority/constraint docs this story is grounded. |
| `in_scope` / `out_of_scope` | Explicit boundaries. |
| `acceptance_criteria` | `[{id, given, when, then}]`. **≤ 7.** Each independently checkable. |
| `verification` | How the story is proven (object below). |
| `depends_on` / `blocks` | DAG edges. **No cycles.** |
| `context.read_first` | **Ordered** list of paths a fresh squad reads before touching anything. The single highest-value field — see below. |
| `squad` | `{type, members[], rationale}`. `members` lists the roles to spawn for this story — execution spawns **only** these. |
| `status` | `todo` \| `in_progress` \| `done` \| `blocked` \| `parked`. |
| `open_questions` | Ambiguities to resolve with the human — **not guessed**. |

There is **no `context.touches` / file-budget field.** The squad makes the best
file-level decisions for the story; unrelated refactors are rejected in scope + AC
review, not by a declared file list. (`do_not_touch` and `est_files_changed` are
likewise absent by design.)

### `verification` object

| Field | Meaning |
| --- | --- |
| `method` | `automated-test` \| `script` \| `manual-check` \| `inspection`. |
| `commands` | Exact, re-runnable commands. Must pass from a **clean checkout**. |
| `evidence` | `[{type: test-output\|log\|screenshot\|artifact, path: "evidence/<id>/<file>"}]`. Written to disk, committed. |
| `done_when` | One sentence a reviewer confirms **without reading the diff**. |

### Why `context.read_first` matters most

A fresh squad that has to rediscover the codebase burns half its window before it
writes a line. `read_first` is the pre-computed reading path that prevents that:
specific files, in the order they should be read, stopping at "enough to start." Be
specific and ordered; point at the 2–3 modules that matter, not the whole tree.

---

## `progress.json` — the ledger

Written by `squad-execute`. **Append-only** — never rewrite a past entry.

| Field | Meaning |
| --- | --- |
| `schema_version` | Integer, currently `2`. |
| `slice` / `project` | Matches `user-story.json`. |
| `updated_at` | ISO-8601, real date. |
| `current_stories` | **Array** of the stories in flight (empty when idle). An array so parallel execution is represented honestly — a single `current_story` cannot describe two branches running at once. |
| `summary` | `"<n>/<total> done"`. |
| `log` | Append-only array of story entries (below). |
| `bet_checks` | Append-only boundary, change, integrated-check and stop records (below), including stops before any story starts. |

### `bet_checks` entry

| Field | Meaning |
| --- | --- |
| `at` / `bet_id` / `contract_revision` | Real ISO timestamp and exact approved contract checked. |
| `stage` | `before-story` \| `after-story` \| `risk` \| `scope-change` \| `integrated` \| `stop`. |
| `story_id` | Related story ID, or null for a bet-wide check. |
| `consumed` / `remaining` / `unit` | Usage under the approved accounting rule; remaining is never negative. Null if unknown, requiring a pause. |
| `measurement` | Evidence/source and uncertainty for usage; include optional agent-budget usage here when configured. |
| `decision` | `continue` \| `cut` \| `reshape` \| `stop` \| `complete`. Complete requires integrated success and the required release/permissions checks. |
| `reason` / `approval_ref` | Why; reference human approval for a scope swap or AC change, otherwise null. |
| `integrated_result` | `not-run` \| `pass` \| `fail`. Green stories alone are `not-run`. |
| `evidence` | Paths to check results or decision evidence. |
| `checkpoint` | Path to a resumable checkpoint when stopping unfinished work; otherwise null. |
| `external_actions_taken` | Optional `[{kind, target, approved_by}]` for bet-level verification/release mutations outside a story; same exact-identity and approval rules as story logs. |

A checkpoint records the branch/commit and any uncommitted patch or worktree location,
what works, unfinished code, failing/passing evidence, open questions, remaining scope,
and the decision needed to resume. Preserve unfinished work without forcing a broken
commit or labeling it shipped. A stopped active story becomes `blocked` and leaves
`current_stories`; pending stories remain pending or explicitly parked. Append a story
log entry if a started story stops, plus a bet check even if no story started.

### `log` entry

| Field | Meaning |
| --- | --- |
| `story_id` | The story this entry closes or stops. |
| `started_at` / `finished_at` | ISO-8601. |
| `squad` | Squad type + the roles actually spawned. |
| `outcome` | `done` \| `blocked` \| `reverted`. |
| `commits` | `["<sha> <subject>"]`. |
| `ac_results` | `[{id, result: pass\|fail, evidence}]`. |
| `external_actions_taken` | `[{kind, target, approved_by}]` for any world-mutating action, with the resolved identity. |
| `decisions` | Choices a future squad must know about. |
| `deviations_from_plan` | What differed from the story definition. **An AC change is recorded here, with the human's reason.** |
| `pending_reviews` | Roles/checks deferred by the execution mode (e.g. QA deferred) — recorded, never silently skipped. |
| `follow_ups` | Deferred work + the story it belongs to. |
| `context_for_next` | **≤ 10 lines.** What exists now, which interfaces are stable, what the next squad should assume and not re-derive. The baton passed forward. |

`context_for_next` is to execution what `read_first` is to planning: it stops the
next squad from re-deriving what the last one already settled.
