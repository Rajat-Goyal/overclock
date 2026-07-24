# Example: invoking `spike`

A spike is usually triggered by a prompt like the one below — a rough first-slice scope,
handed to the skill with an instruction to grill for the details before writing anything.

## The kind of prompt that triggers this skill

> There's a `product.md`, but as the very first initial slice I want to build:
> - a ping-pong app with a button that, on click, shows ping-pong behaviour
> - a health API
> - both the APIs and the app publicly accessible to me
> - a README describing how to run locally and how to deploy
>
> Run grill-me to ask me the minimum viable questions needed to completely define this
> spike's scope, then write a `spike.md`.

## What the skill does with it

1. Reads any `product.md` for context; carries the scope bullets **verbatim**.
2. **Delegates to the external `grill-me` skill** (Matt Pocock's) — *"ask the minimum
   viable questions needed to completely define this spike's scope"* — covering behaviour,
   stack, local setup (Docker/native), where the evidence loop runs, deploy target, and
   access. It asks only the real forks and defaults the rest, stating the defaults.
3. Asks where `spike.md` should live (default: beside `product.md`).
4. Writes `spike.md` from the template.

The output is a **spec, not a build** — the code comes later (via `squad-decompose` →
`squad-execute`), and only if you choose to. A spike's code is throwaway; its answers are
the deliverable.
