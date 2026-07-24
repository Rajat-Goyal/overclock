# squad — agent instructions

This repo defines a method for decomposing work into right-sized, independently
verifiable **stories** and executing them with a **squad** of subagents behind an
**evidence gate**. It is harness-neutral: the same method runs under Claude Code and
Codex.

If operating in this repo (or one that has adopted this method), follow the two
phases below. The full contract lives in `skills/_shared/references/` — read it.

## Read first

- `skills/_shared/references/schemas.md` — the `user-story.json` and `progress.json` schemas (the contract).
- `skills/_shared/references/conventions.md` — sizing rule, the gate, anti-drift rules, commit protocol, stop conditions.
- `skills/_shared/references/adapters.md` — how to run the squad on this harness. **Codex: use the Codex section (agents/subagents). Claude Code: use dynamic Workflows.**

## Phase 1 — decompose (then STOP)

Act as the **lead**. Do not write implementation code. Detect the repo's build/test
commands and whether a scope layer (slice/RFC/ADR) exists. Produce `user-story.json`:
a DAG of stories, first one a walking skeleton, each sized to one session, each with
`context.read_first`, real acceptance criteria, and a re-runnable `verification`
block. Capture lightweight-mode asks **verbatim** in `from_ask`. End with a summary
table and open questions; wait for approval.

## Phase 2 — execute (one story per iteration)

Ask the human for the pacing (default: unattended with circuit-breakers). Then loop:
select the lowest-id ready story from the DAG → bootstrap only `context.read_first`
plus the last few `context_for_next` batons → mark started and commit → delegate
implementation to a subagent → have a **separate** subagent verify each acceptance
criterion and write evidence to `evidence/<story-id>/` → close only when the gate is
green → append to `progress.json` → report the evidence packet.

## The rule that outranks everything

**Never weaken an acceptance criterion to make it pass.** Only the human changes an
AC, and only with the reason recorded in `deviations_from_plan`. Verification failing
after two honest attempts → mark `blocked` and escalate. Do not thrash, do not guess
through a scope conflict, do not let an implementer grade its own work.
