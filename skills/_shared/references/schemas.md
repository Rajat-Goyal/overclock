# Schemas — the two state files

The workflow is driven by two machine-readable files. `squad-decompose` writes
the plan; `squad-execute` reads the plan and writes the ledger. They live
together at a location chosen during calibration (default: repo root).

Keep these schemas identical across both skills and both harness adapters — they
are the contract. Copyable starting points live in `../templates/`.

---

## `user-story.json` — the plan

Written by `squad-decompose`. Read by `squad-execute`. Amended (never rewritten)
when new work arrives.

### Top level

| Field | Meaning |
| --- | --- |
| `slice` / `project` | Identifier for this body of work. |
| `mode` | `"formal"` \| `"lightweight"`. Formal derives stories from scope docs; lightweight derives them from captured asks. |
| `generated_at` | ISO-8601. Stamp with the real date at write time — never invent a clock mid-run. |
| `source_docs` | Paths to scope / RFC / ADR (formal), or `[]` (lightweight). |
| `non_negotiables` | Invariants that outrank every story. A story that violates one is rejected, not queued. |
| `stories` | Array of story objects (below). |
| `open_defects` | Known-broken things not yet promoted to a story. |

### Story object

| Field | Meaning |
| --- | --- |
| `id` | Stable, ordered. Slice-prefixed (`S01-03`) in formal mode; flat (`S15`) in lightweight. Never reuse or renumber a shipped id. |
| `title` | Short imperative. |
| `user_story` | `As a <role>, I want <capability>, so that <outcome>`. |
| `from_ask` | The human's request, **verbatim**. The most important field in lightweight mode: nothing is paraphrased away, nothing is lost between messages. |
| `why_now` | One line of sequencing rationale. |
| `scope_refs` | `["RFC §x.y", "ADR-00n"]` (formal) — where in scope this is grounded. |
| `in_scope` / `out_of_scope` | Explicit boundaries. |
| `acceptance_criteria` | `[{id, given, when, then}]`. **≤ 7.** Each independently checkable. |
| `verification` | How the story is proven (object below). |
| `depends_on` / `blocks` | DAG edges. **No cycles.** |
| `context.read_first` | **Ordered** list of paths a fresh squad reads before touching anything. The single highest-value field — see below. |
| `context.touches` | Files/globs the story is allowed to change. The diff budget the gate enforces. |
| `squad` | `{type, members[], rationale}`. Composition varies per story. |
| `status` | `todo` \| `in_progress` \| `done` \| `blocked` \| `parked`. |
| `open_questions` | Ambiguities to resolve with the human — **not guessed**. |

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
specific files, in the order they should be read, stopping at "enough to start."
Writing it well is the difference between a story that fits in one session and one
that thrashes. Be specific and ordered; point at the 2–3 modules that matter, not
the whole tree.

---

## `progress.json` — the ledger

Written by `squad-execute`. **Append-only** — never rewrite a past entry.

| Field | Meaning |
| --- | --- |
| `slice` / `project` | Matches `user-story.json`. |
| `updated_at` | ISO-8601, real date. |
| `current_story` | The story in flight, or `null`. |
| `summary` | `"<n>/<total> done"`. |
| `log` | Append-only array of entries (below). |

### `log` entry

| Field | Meaning |
| --- | --- |
| `story_id` | The story this entry closes. |
| `started_at` / `finished_at` | ISO-8601. |
| `squad` | Squad type that ran it. |
| `outcome` | `done` \| `blocked` \| `reverted`. |
| `commits` | `["<sha> <subject>"]`. |
| `ac_results` | `[{id, result: pass\|fail, evidence}]`. |
| `decisions` | Choices a future squad must know about. |
| `deviations_from_plan` | What differed from the story definition. **An AC change is recorded here, with the human's reason.** |
| `follow_ups` | Deferred work + the story it belongs to. |
| `context_for_next` | **≤ 10 lines.** What exists now, which interfaces are stable, what the next squad should assume and not re-derive. The baton passed forward. |

`context_for_next` is to execution what `read_first` is to planning: it stops the
next squad from re-deriving what the last one already settled.
