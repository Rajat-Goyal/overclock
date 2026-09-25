# Harness adapters

The method, schemas, gate, and anti-drift rules are identical everywhere. Only the
*mechanism* for running a squad differs. Detect the harness and use the matching
adapter. Everything else (`schemas.md`, `conventions.md`) is shared.

Both adapters enforce schema version 2's selected-bet contract. Before dispatch and after
stories (including parallel completions), the lead appends `bet_checks` under one shared
appetite/accounting rule. Serialize ledger writes; concurrent squads do not each get the
whole remaining allowance. Pass the selected pitch and relevant visual/constraints in
context. Halt dispatch and checkpoint active work when the limit is reached, including
mid-story; use notifications or bounded work chunks as available, and disclose monitoring
limits. An empty frontier is not bet completion: run independent `bet.verification` first.

---

## Claude Code → dynamic Workflows

Claude Code has a `Workflow` tool: deterministic multi-agent orchestration written
as a JavaScript script (`agent()`, `parallel()`, `pipeline()`, `phase()`, `log()`).
It is the squad fan-out primitive. Build the script **dynamically from the story
DAG** at run time rather than hand-writing one workflow per story.

### Mapping the execution loop to a Workflow

- **Read the plan, compute the frontier.** The script loads `user-story.json`,
  filters to stories whose `status` is `todo` and whose `depends_on` are all `done`.
- **`pipeline()` the ready stories** so each flows through its stages independently —
  no artificial barrier between them. Each story's stages are:
  1. `agent(implement …)` — the staff-engineer squad member. Feed it the story object
     and `context.read_first` up front so it does not rediscover the repo.
  2. `agent(verify …)` — an **independent** QA agent that did not write the code. It
     runs `verification.commands`, writes artifacts to `evidence/<id>/`, and returns a
     per-AC pass/fail with a `schema`. This is the adversarial-verify pattern: the
     grader is never the author.
- **Spawn only `story.squad.members`.** One `agent()` per listed role (typically
  staff-engineer + an independent QA); add no role that isn't listed. A role deferred by
  the pacing mode is recorded in `pending_reviews`.
- **Fresh by construction — a new squad every story.** Each `agent()` call spawns a new
  subagent with an empty context window; a plain call always starts fresh. Reusing an
  agent across stories would require deliberately continuing it (`SendMessage`) or a
  `fork` — the loop never does that for cross-story work. Per-story `pipeline()` items ×
  per-role `agent()` calls means a new squad each story, guaranteed. Do **not** try to
  keep an implementer warm to "save" context — hand the next story its `read_first` and
  the prior `context_for_next` batons instead.
- **Isolate parallel writers.** The parallel frontier is the ready stories in
  `current_stories` whose anticipated work areas don't materially overlap; when
  independent branches write concurrently, spawn implementers with `isolation: 'worktree'`
  so their diffs and migrations can't collide, then merge in a controlled order.
- **Gate in code, not vibes.** A story advances to `done` only when the verify agent
  returns all ACs green *and* the gate in `conventions.md` holds. A red verdict keeps
  the story `in_progress` and records failing evidence.
- **Pacing is a Workflow-level choice.** The three pacing modes map to how the script
  loops:
  - *stop-after-every-story* → run one story pipeline, return, let the human review.
  - *stop-at-chunk* → loop over a milestone's stories, then return.
  - *controlled-unattended* (recommended default) → loop until the DAG is drained or a
    stop-condition fires. Honor any existing pacing contract before defaulting. Use a long
    `ScheduleWakeup` fallback only if waiting on external state the harness can't notify
    you about.

### Individual squads without a full Workflow

For a single story or a quick amend, the `Agent` tool (one subagent per role) is
lighter than a Workflow. Keep the same role wall and the same gate.

### Pre-flight (hard-won)

Any artifact a subagent **cannot fetch itself** — designs behind a tool not in the
subagent's registry, seed/ground-truth data, credentials — must be written into the
repo by the lead **before** fan-out, or the squad blocks or invents. Materialize the
`context.read_first` path first.

---

## Codex → agents / subagents

Codex reads `AGENTS.md` from the working project and can spawn subagents. It has no
deterministic JS Workflow harness, so the **lead orchestrates the loop directly** and
delegates each squad role to a subagent.

### Mapping the execution loop to Codex subagents

- **The lead stays the orchestrator.** It selects the ready story from the DAG,
  bootstraps context, marks start, and owns the two state files — but never writes
  implementation code itself.
- **One subagent per listed role.** Spawn only the roles in `story.squad.members` —
  typically an implementer plus a **separate** QA subagent (never the implementer grading
  its own work). Add no role that isn't listed; a deferred role goes to `pending_reviews`.
- **Fresh squad per story.** Spawn new subagents for each story; never carry one subagent
  from story to story. Give the next story's implementer only its `context.read_first` and
  the last few `context_for_next` batons in its prompt — continuity is passed as text, not
  a warm session. A reused subagent accumulates context and breaks *one story = one session*.
- **Sequential by default; parallel only with isolation.** Run stories one at a time down
  the DAG. If Codex supports concurrent agents, independent branches (tracked in
  `current_stories`) may run in parallel **only** with one of: (a) disjoint file/module
  ownership *plus* coordinated migration numbering, or (b) isolated worktrees merged in a
  controlled order. Without one, two independently valid stories collide in migrations,
  shared wiring, config, or tests — so default to sequential.
- **Same gate, same evidence.** The QA subagent runs `verification.commands` from a
  clean checkout and writes `evidence/<id>/`. The lead closes the story only on green.
- **Pacing** is enforced by the lead: honor any existing pacing contract, else the chosen
  tier — after a story closes, either continue down the DAG (controlled-unattended, the
  recommended default) or stop and hand the human the evidence packet (per-story /
  per-chunk), halting immediately on any stop-condition.

### Pre-flight

Same rule: the lead writes any un-fetchable artifact into the repo before spawning a
subagent. A subagent that cannot see what it needs will invent it.

---

## Detecting the harness

- A `Workflow` tool / `.claude/` skills directory / "Claude Code" context → Claude adapter.
- An `AGENTS.md`-driven Codex session → Codex adapter.
- When unclear, ask once, then proceed.
