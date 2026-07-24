# Schemas — the two state files

The workflow is driven by two machine-readable files. `squad-decompose` writes
the plan; `squad-execute` reads the plan and writes the ledger. They live
together at a location chosen during calibration (default: repo root).

Keep these schemas identical across both skills and both harness adapters — they
are the contract. Copyable starting points live in `../templates/`.

Both files carry **`schema_version`** (currently `1`). Before acting, a skill
validates it: an unknown/older version is migrated or flagged, never silently
interpreted under newer rules.

---

## `user-story.json` — the plan

Written by `squad-decompose`. Read by `squad-execute`. Amended (never rewritten)
when new work arrives.

### Top level

| Field | Meaning |
| --- | --- |
| `schema_version` | Integer, currently `1`. Validate before acting. |
| `slice` / `project` | Identifier for this body of work. |
| `mode` | `"formal"` \| `"lightweight"`. Formal derives stories from authority docs; lightweight from captured asks. |
| `generated_at` | ISO-8601. Stamp with the real date at write time — never invent a clock mid-run. |
| `scope_authority` | Paths to the doc(s) that **define product scope** (e.g. `scope.md`). These win. |
| `constraint_docs` | Paths to docs that **restrict implementation** (RFC/ADR). They constrain *how*, not *what*. |
| `non_negotiables` | Invariants that outrank every story. A story that violates one is rejected, not queued. |
| `external_actions` | Mutation-authority policy (object below). Governs anything that changes the world outside the repo. |
| `stories` | Array of story objects (below). |
| `open_defects` | Known-broken things not yet promoted to a story. |

**Scope authority vs constraints.** Authority docs define *what* is in scope;
constraint docs restrict *how* it may be built. If they disagree, do **not** pick a
winner — raise an `open_question`. The mere presence of an RFC/ADR does not make it
authoritative or required; only `scope_authority` defines scope.

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
| `schema_version` | Integer, currently `1`. |
| `slice` / `project` | Matches `user-story.json`. |
| `updated_at` | ISO-8601, real date. |
| `current_stories` | **Array** of the stories in flight (empty when idle). An array so parallel execution is represented honestly — a single `current_story` cannot describe two branches running at once. |
| `summary` | `"<n>/<total> done"`. |
| `log` | Append-only array of entries (below). |

### `log` entry

| Field | Meaning |
| --- | --- |
| `story_id` | The story this entry closes. |
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
