# overclock

A collection of agent skills for building **faster and safer** — de-risk the unknowns,
decompose the work into verifiable stories, then execute them with a squad of subagents
behind an evidence gate. Works with both **Claude Code** (dynamic Workflows) and **Codex**
(subagents) from a single shared definition.

It grew out of a real project that shipped this way: unknowns were spiked before they
were built, every ask became a story *before* it was written, and no story closed until
a runnable check *proved* it — measured, not suspected.

## The skills

Five focused skills. **Use any one on its own** — they are not a rigid pipeline. They do
compose, though: a common path is derisk → spike → **slice** → decompose → execute, with
every step optional.

| Skill | You have… | You get… |
| --- | --- | --- |
| **`derisk`** | a `product.md` or a pile of concerns | a Rumsfeld-matrix map + prioritized **candidate spikes** |
| **`spike`** | a chosen candidate + rough scope | a concrete **`spike.md`**, grilled for the minimum viable decisions |
| **`slice`** | a de-risked `product.md` | **candidate vertical slices** shaped by Shape Up + a recommended first bet |
| **`squad-decompose`** | a chosen slice / settled scope | a DAG of right-sized, verifiable **stories** (`user-story.json`), then a STOP |
| **`squad-execute`** | an approved backlog | the stories built by a squad, each behind an **evidence gate**, logged to `progress.json` |

`spike` delegates its questioning to **`grill-me`** (Matt Pocock's skill) when it's
installed — that one is external, not bundled here.

## The rules that make it hold up

- **Spike what you don't know before you build it.** Known-unknowns become small,
  time-boxed, throwaway investigations with concrete options — not guesses baked into
  production code.
- **One story = one session.** Sized so a fresh squad can load context, build, verify,
  and commit in one window (≤ ~250k context, ≤ ~10 files, ≤ 7 ACs, one vertical concern).
- **Context is pre-computed, not rediscovered.** `context.read_first` gives each squad an
  ordered reading path; `context_for_next` is the baton each finished story hands the next.
- **Evidence is a committed artifact, not console output.** Checks re-run from a clean
  checkout; artifacts live in `evidence/<story-id>/`.
- **Independent QA.** Whoever verifies an acceptance criterion is never the agent that
  wrote the code.
- **Never weaken an acceptance criterion to make it pass.** Only a human changes an AC,
  and only with the reason logged. Two honest fix attempts, then `blocked` and escalate.

## Install

One command, no npm publish or auth needed — `npx` runs the installer straight from this
repo. Run it **from your project directory**:

```bash
npx github:Rajat-Goyal/overclock          # interactive: pick Claude / Codex / both
```

Or skip the prompts with flags:

```bash
npx github:Rajat-Goyal/overclock --claude          # Claude, project (.claude/skills)
npx github:Rajat-Goyal/overclock --claude --user   # Claude, user (~/.claude/skills)
npx github:Rajat-Goyal/overclock --codex           # Codex (.overclock + an AGENTS.md block)
npx github:Rajat-Goyal/overclock --all --yes       # both, project-level, no prompts
```

What it does (skills are **auto-discovered**, so the collection can grow without changing
the installer):

- **Claude Code** — copies every skill + `_shared/` into `./.claude/skills/` (project) or
  `~/.claude/skills/` (user). They auto-discover.
- **Codex** — copies the skills into `./.overclock/skills/` and adds a managed `overclock`
  block to your `AGENTS.md` indexing them (created if absent, updated in place on re-run).

Then just ask, e.g. *"de-risk this product.md"*, *"decompose this into stories"*, or
*"run the squad on the backlog"*. Re-running the installer is safe and idempotent.

<details>
<summary>Manual install (no npx)</summary>

```bash
git clone https://github.com/Rajat-Goyal/overclock.git
cp -r overclock/skills/* ~/.claude/skills/     # Claude
# Codex: copy overclock/skills/* into .overclock/skills/ and index them from AGENTS.md
```
</details>

## Layout

```
skills/
├── derisk/                       # fears + concerns → Rumsfeld matrix → spike-candidates.md
│   ├── SKILL.md
│   ├── references/rumsfeld.md
│   ├── templates/spike-candidates.template.md
│   └── examples/telegram-assistant.md
├── spike/                        # a chosen spike, grilled → spike.md (uses external grill-me)
│   ├── SKILL.md
│   ├── templates/spike.template.md
│   └── examples/example-invocation.md
├── slice/                        # de-risked product.md → Shape Up slice candidates
│   ├── SKILL.md
│   ├── references/shape-up.md
│   ├── templates/slice-candidates.template.md
│   └── examples/shiori-slices.md
├── squad-decompose/SKILL.md      # a chosen slice / scope → a DAG of verifiable stories, then STOP
├── squad-execute/SKILL.md        # execute the backlog behind the evidence gate
└── _shared/                      # the squad contract, shared so the two can't drift
    ├── references/{schemas,conventions,adapters}.md
    └── templates/{user-story,progress}.template.json
AGENTS.md                         # Codex / harness-neutral entry point
```

## Pacing (`squad-execute`)

Asked at the start of a run; default is the last:

- **Stop after every story** — close one, review its evidence packet, continue.
- **Stop at chunk/milestone edges** — run a milestone through, then review.
- **Unattended + circuit-breakers** (default) — run the DAG to completion, stopping only on
  a stop-condition. Evidence is written per story regardless, so an unattended run still
  leaves a full audit trail.

## License

MIT — see [LICENSE](./LICENSE).
