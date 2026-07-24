---
name: spike
description: This skill should be used when the user asks to "create a spike", "write a spike.md", "spec out this spike", "turn this scope into a spike", or picks one of the candidate spikes from a derisk run and wants it written up. It takes a chosen spike (or a rough scope), invokes the grill-me skill to gather the minimum viable decisions — including local setup, how the evidence loop runs, and where it deploys — asks where the file should live, and writes a concrete spike.md. Feeds squad-decompose.
version: 0.1.0
---

# spike

Turn a **chosen** spike (or a rough scope the builder hands you) into a concrete
`spike.md` — the spec for a small, throwaway, end-to-end investigation. `derisk`
proposes candidate spikes; the builder picks one; this skill writes it up.

Two things make this skill work: it **grills before it writes** (via the `grill-me`
skill), and it **asks where the file goes** rather than guessing.

Supporting files (relative to this skill's directory):

- **`../grill-me/SKILL.md`** — the clarify primitive this skill invokes. Read/run it.
- **`templates/spike.template.md`** — the shape of the output.

## Procedure

### 1. Take the chosen spike + scope

Start from the candidate spike (its question and options from `derisk`) plus whatever
scope bullets the builder gave. Carry their wording **verbatim** — it is the intent.

### 2. Grill for the minimum viable decisions — invoke `grill-me`

Run the `grill-me` skill against the scope. For a spike, the dimensions that usually
matter (grill-me still cuts any it can detect or safely default) are:

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

- **Claude Code** — invoke `grill-me` (which uses `AskUserQuestion`) and the placement
  question, then write the file.
- **Codex** — follow `../grill-me/SKILL.md` inline (numbered questions), ask placement,
  then write the file.
