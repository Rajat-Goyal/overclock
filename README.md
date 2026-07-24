# squad

A portable method — and two agent skills — for breaking work into right-sized,
independently-verifiable **stories**, then executing them with a **squad** of
subagents behind an **evidence gate**. Works with both **Claude Code** (dynamic
Workflows) and **Codex** (subagents) from a single shared definition.

It grew out of a real project that shipped this way: every ask became a story
*before* it was built, and no story closed until a runnable check *proved* it —
measured, not suspected.

## The idea in one screen

Two phases, two state files, one rule that outranks everything.

1. **Decompose** (`squad-decompose`) — turn scope (or a stream of asks) into a DAG of
   stories in `user-story.json`. Each story fits in one session, leaves the repo
   green, and names how it will be proven. Then **stop** for human approval.
2. **Execute** (`squad-execute`) — walk the DAG one story at a time. A **lead**
   orchestrates and owns the state files but writes no code; **squads** (subagents)
   implement; an **independent** QA agent verifies each acceptance criterion and writes
   evidence to disk. A story closes only when the gate is green. Every run is recorded
   in an append-only `progress.json`.

The rule that outranks everything: **never weaken an acceptance criterion to make it
pass.** Only a human changes an AC, and only with the reason logged.

## Why it holds up under autonomy

- **One story = one session.** Sized so a fresh squad can load context, build, verify,
  and commit in a single window. (≤ ~250k context, ≤ ~10 files, ≤ 7 ACs, one vertical
  concern.)
- **Context is pre-computed, not rediscovered.** `context.read_first` gives each squad
  an ordered reading path; `context_for_next` is the baton each finished story hands the
  next. Squads stop burning their window relearning the repo.
- **Evidence is a committed artifact, not console output.** Checks are re-runnable from
  a clean checkout; artifacts live in `evidence/<story-id>/`.
- **Independent QA.** Whoever verifies an AC is never the agent that wrote the code.
- **Circuit-breakers.** Two honest fix attempts, then `blocked` and escalate. Scope
  conflicts, dependency mismatches, and oversized stories stop the run rather than being
  guessed through.

## Install

One command, no npm publish or auth needed — `npx` runs the installer straight from
this repo. Run it **from your project directory**:

```bash
npx github:Rajat-Goyal/squad          # interactive: pick Claude / Codex / both
```

Or skip the prompts with flags:

```bash
npx github:Rajat-Goyal/squad --claude            # Claude, project-level (.claude/skills)
npx github:Rajat-Goyal/squad --claude --user     # Claude, user-level (~/.claude/skills)
npx github:Rajat-Goyal/squad --codex             # Codex (.squad + an AGENTS.md block)
npx github:Rajat-Goyal/squad --all --yes         # both, project-level, no prompts
```

What it does:

- **Claude Code** — copies `squad-decompose`, `squad-execute`, and `_shared/` into
  `./.claude/skills/` (project) or `~/.claude/skills/` (user). They auto-discover.
- **Codex** — copies the shared references into `./.squad/` and adds a managed
  `squad` block to your `AGENTS.md` (created if absent, updated in place on re-run).

Then just ask, e.g. *"decompose this slice into stories"* or *"run the squad on the
backlog"*. Re-running the installer is safe and idempotent.

<details>
<summary>Manual install (no npx)</summary>

```bash
git clone https://github.com/Rajat-Goyal/squad.git
cp -r squad/skills/* ~/.claude/skills/        # Claude
# Codex: copy squad/skills/_shared into your project and reference it from AGENTS.md
```
</details>

## Layout

```
skills/
├── squad-decompose/SKILL.md      # Phase 1 — plan, then STOP
├── squad-execute/SKILL.md        # Phase 2 — execute behind the evidence gate
└── _shared/
    ├── references/
    │   ├── schemas.md            # user-story.json + progress.json (the contract)
    │   ├── conventions.md        # sizing, gate, anti-drift, commit protocol
    │   └── adapters.md           # Claude Workflows vs Codex subagents
    └── templates/
        ├── user-story.template.json
        └── progress.template.json
AGENTS.md                         # Codex / harness-neutral entry point
```

## Pacing

`squad-execute` asks how autonomous to be at the start of a run:

- **Stop after every story** — close one, review its evidence packet, continue.
- **Stop at chunk/milestone edges** — run a milestone through, then review.
- **Unattended + circuit-breakers** (default) — run the DAG to completion, stopping only
  on a stop-condition. Evidence is written per story regardless, so an unattended run
  still leaves a full audit trail.

## License

MIT — see [LICENSE](./LICENSE).
