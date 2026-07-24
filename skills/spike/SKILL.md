---
name: spike
description: This skill should be used when the user asks to "create a spike", "write a spike.md", "spec out this spike", "turn this scope into a spike", or picks one of the candidate spikes from a derisk run and wants it written up. It takes a chosen spike (or a rough scope), invokes the grill-me skill to gather the minimum viable decisions — including local setup, how the evidence loop runs, and where it deploys — asks where the file should live, and writes a concrete spike.md. Feeds squad-decompose.
---

# spike

Turn a **chosen** spike (or a rough scope the builder hands you) into a concrete
`spike.md` — the spec for a small, throwaway, end-to-end investigation. `derisk`
proposes candidate spikes; the builder picks one; this skill writes it up.

Two things make this skill work: it **grills before it writes** (delegating to the
external `grill-me` skill), and it **asks where the file goes** rather than guessing.

Supporting files (relative to this skill's directory):

- **`grill-me`** — an **external** skill (by Matt Pocock) this skill delegates the
  questioning to. It is **not** bundled with overclock; install it separately. See step 2.
- **`templates/spike.template.md`** — the shape of the output.
- **`examples/example-invocation.md`** — a sample prompt that triggers this skill.

## Procedure

### 1. Take the chosen spike + scope

Start from the candidate spike (its question and options from `derisk`) plus whatever
scope bullets the builder gave. Carry their wording **verbatim** — it is the intent.

### 2. Grill for the minimum viable decisions — delegate to `grill-me`

Delegate the questioning to the **external `grill-me` skill** (by Matt Pocock). Invoke it
with a prompt that names the target — e.g. *"ask me the minimum viable questions needed to
completely define this spike's scope"* — and let it decide what to ask. If `grill-me` is
not installed, ask the same questions yourself (batched, each with a recommended default).
For a spike, the dimensions that usually matter (grill-me still cuts any it can detect or
safely default) are:

- **Behaviour** — what "done" actually looks like when the scope is ambiguous.
- **Stack** — what it's built in.
- **Local setup** — run it **natively** (e.g. `npm run dev`) or in **Docker**
  (`docker compose up`)? This decides the "run locally" story.
- **The evidence loop** — where do the verification checks run? Options that recur:
  native-local, **docker-local** (reproducible, closest to CI), or against the
  **deployed** instance (smoke-testing the live URL). This is what `squad-execute`'s
  gate will later execute, so pin it now.
- **Deploy target** — the public host (and therefore the "how to deploy" story).
- **Access** — truly public, or gated. Default public/no-auth for a throwaway spike
  unless told otherwise.

### 3. Ask where `spike.md` should live

File organization is the builder's preference, so ask (this is a real fork the skill
owns, separate from grill-me). Detect a `product.md` first; default to **beside
`product.md`**. Offer a `docs/spikes/` (or similar) folder, or a fresh project dir to
scaffold, as alternatives.

### 4. Write `spike.md`

Use the template. It captures: the goal/question, why it de-risks, in/out of scope, the
**decisions** from grill-me, the plan, a **done-when** (observable proof), **run
locally** and **deploy** notes (the readme story), how the **evidence loop** runs, and
any open questions. Keep it readable by a non-expert.

### 5. Hand off

The spike's scope and decisions feed `squad-decompose`: once the spike is built and its
question answered, the decisions become the `context.read_first` and constraints for the
real stories. A spike's code is throwaway; its **answers** are the deliverable.

## Adapters

- **Claude Code** — invoke the external `grill-me` skill (it uses `AskUserQuestion`); if
  it isn't installed, ask the questions yourself via `AskUserQuestion`. Then the placement
  question, then write the file.
- **Codex** — run `grill-me` if available, else ask the questions inline as a numbered
  list; then ask placement and write the file.
