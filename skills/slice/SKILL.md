---
name: slice
description: This skill should be used when the user asks to "suggest slices", "what's the right first vertical slice", "shape this into a Shape Up pitch", "what should I build first", "give me slice candidates", "options for slices", or "shaped bets from product.md". It uses product intent, available design and evidence, and the builder's appetite to propose bounded bets, check critical mechanisms, and recommend a first bet. The human-selected pitch becomes the scope contract for squad-decompose. Written for a non-expert builder; cites Shape Up.
---

# slice

Choose a useful serving of the product that fits the builder's **appetite**: the investment
of time and attention they are willing to make. `PRODUCT.md` is the whole cake; a **bet** is
one useful serving. **Stories** are the integrated increments that build that serving.
Cross the layers needed for this outcome, not every subsystem in the eventual product.

Use Shape Up (Ryan Singer, Basecamp) to shape work that is rough enough to leave room for
implementation, understood enough to bet on, and bounded. Keep the language plain and the
paperwork proportionate: a tiny bet can have a short pitch. Shaping and de-risking can
iterate; neither a giant design document nor answers to all future-product questions are
prerequisites.

Supporting files (relative to this directory):

- **`references/shape-up.md`** — principles and primary sources.
- **`templates/slice-candidates.template.md`** — options and a selected-pitch contract.
- **`examples/shiori-slices.md`** — appetite-led choices and an honest readiness check.

## Modes — do only what's asked

| The ask sounds like… | Mode | Output |
| --- | --- | --- |
| "suggest slices / options / what should I build first" | **options** | candidates + recommendation + comparison, in the conversation |
| "shape <slice> into a pitch" | **shape** | one pitch, with readiness and missing decisions visible |
| "write slice-candidates.md" | **write** | candidates on disk, still options until selected |

Never place the bet for the builder or auto-decompose. Honor a choice already made.
Selection for execution makes the pitch durable: save it (default `slice.md`, or an
existing scope path) with a stable ID/revision and the human's approval reference. A
candidate document may be used if an exact selected section and revision are identified;
its other options are not authorized scope. `squad-decompose` can persist an already
selected conversational pitch at handoff without asking the human to select again.

## Procedure

### 1. Read the available sources and establish their roles

Read `PRODUCT.md` / `product.md` and the builder's instructions. Use relevant available
`DESIGN.md`, whiteboards/diagrams, spike findings and evidence, and existing implementation
where they affect this bet. Record paths/sections and versions, dates or commits, what
each source supports, and whether it is intent, an approved constraint, evidence or a
proposal. A sketch is not automatically a decision; a spike supports only what it tested.
Missing artifacts are fine when the scope does not need them. Never invent their contents.

Product intent guides the outcome. The human-approved pitch defines the current bet;
approved design constraints restrict how it can be built. Existing code describes reality,
not permission to expand scope. Surface disagreements or uncertain authority as open
questions and pause the affected commitment. Do not silently override product intent or a
constraint. Keep the product, design, pitch and later story plan consistent; record any
human-approved resolution. No `DESIGN.md` is required for a trivial change.

### 2. Establish the appetite and intended learning

Reuse the appetite and intended learning already supplied. Ask only for missing decisions
needed to select a bet. Record a concrete time/investment limit, who is available, when the
clock starts and how usage is counted (e.g. elapsed deadline or cumulative working hours).
Include integration and verification in that limit; make any earlier shaping/spike time's
inclusion explicit. If appetite is still unknown, give conditional options, not an approved
commitment. Do not invent approval or a start time.

Shape Up's one-to-two-week and six-week team cycles are examples, not defaults for a
workshop. An afternoon or two sessions can be appropriate. Appetite is a constraint, not an
estimate. Per-story context sizing and optional agent token/cost limits are separate;
neither resets or replaces the overall bet limit.
[Set boundaries](https://basecamp.com/shapeup/1.2-chapter-03)

### 3. Shape candidates and check readiness

For each serious candidate describe:

- **Problem and outcome** — who can do what, and the value hypothesis to test.
- **Appetite** — the approved boundary or clearly labeled conditional assumption.
- **Solution / user experience** — user action → mechanism → observable result.
- **Included scope** and **no-gos** — what is in and explicitly excluded.
- **Permissible cuts** — simplifications that preserve the useful outcome. Protect essential
  quality, permissions, data integrity and truthfulness; these are never scope cuts.
- **Mechanisms and evidence** — for the few mechanisms that could sink this bet, record
  the proposed approach, supporting evidence and its limits, and remaining unknowns.
- **Rabbit holes and readiness** — label critical unknowns. A plausible name such as
  "durable scheduler" is not evidence that the design works.
- **Integrated verification** — one concrete end-to-end scenario, observable success,
  essential failure cases and where its evidence will live. Reuse existing checks.

If an unresolved mechanism could invalidate this outcome or appetite, mark the candidate
**not ready to bet**. Recommend a targeted `derisk` / `spike` investigation or a narrower
outcome that avoids that risk, then revisit the pitch. An established pattern, inspected code or a small targeted probe may supply
enough feasibility evidence; do not require the completed feature before betting. Ordinary
implementation details can remain open; unknowns belonging only to excluded future scope need not block this bet.
[Risks and rabbit holes](https://basecamp.com/shapeup/1.4-chapter-05)

### 4. Recommend and compare

Recommend the smallest useful outcome that fits the actual appetite and tests the intended
value hypothesis. A release supplies evidence to evaluate value; shipping does not prove
value. A small capture-and-visible-status outcome may be worth choosing even if the full
vision includes reminders. Compare outcome, appetite, learning and critical readiness.
Only the next bet is committed; possible later bets remain options, not a promised backlog.
[Place your bets](https://basecamp.com/shapeup/2.3-chapter-09)

The bet aims at a useful released outcome. Stories may be honestly labeled **internal,
demoable increments**, beginning with a walking skeleton. Each connects an action to an
observable result through the layers it needs; it need not be a separately released
product. A demo or green story is not evidence that the entire bet has shipped.
[Get one piece done](https://basecamp.com/shapeup/3.2-chapter-11)

### 5. Show the choices visually

Default to compact, editable **Mermaid embedded in Markdown**, alongside the short pitch.
Respect a text-only preference or deliberately tiny answer. For a small decision, a few
nodes are enough; do not require an external tool or a large notation system.

- Draw a candidate overview: stable candidate ID, outcome, appetite/boundary, and the
  meaningful addition or exclusion. Label mutually exclusive choices **alternatives for
  this bet**. Show potential later increments separately as **uncommitted options**, with
  no roadmap arrows implying approval.
- For each serious candidate, draw a small experience breadboard: user action or trigger
  → necessary system/agent mechanism → observable result. Include confirmation and external
  action boundaries, plus failure/recovery paths essential to usefulness. Mark unresolved
  mechanisms **UNKNOWN** with dashed lines. APIs and event-driven systems can end in a
  response, emitted event, stored result or operator-visible log; no graphical UI is required.
- Distinguish **EXISTS**, **CANDIDATE** and **OUT / future** with node labels/line styles as
  well as restrained colors. Use only the out-of-scope context that helps explain a boundary.
  Label required layers (interaction/trigger, logic, storage/delivery/result) so readers can
  see the complete thread. This is an experience flow, not the later story dependency DAG.
- Render/embed diagrams in conversation-only options mode without writing files or
  publishing. In requested write mode, persist them with the candidates. Respect an
  explicitly requested destination such as Miro if supported; if unavailable, say so and
  provide portable Mermaid plus readable action→result text. No connector, image generation
  or remote publication is a prerequisite. Include the text fallback when rendering fails.
- Check syntax with a Mermaid parser/renderer when available, and inspect readability.
  Otherwise state that rendering is unverified and provide a text fallback. Check every
  node/edge against scope and source evidence; an attractive diagram must not turn an
  unknown into a solved mechanism. Compare at least two candidates when offering options,
  unless the user requested one/tiny output. Ensure later options appear uncommitted.

### 6. Make the selected pitch the handoff

Use the template's selected-pitch section to retain outcome, approved appetite, source and
design references, mechanisms/evidence/unknowns, included scope, no-gos, cuts, integrated
verification, and stop/reshape decisions. Include ID/revision and approval provenance. Carry the selected candidate's visual into
this artifact (or its textual equivalent if requested). Update it with scope/design/evidence
changes so the drawing, pitch and execution handoff say the same thing.
`PRODUCT.md` remains the vision; the selected pitch is the current scope contract.

No-gos exclude scope; cuts simplify included scope. The **circuit breaker** means the bet
gets **no automatic extension** when its investment limit is reached. Before that limit,
use approved cuts or stop to reshape. At the limit, stop work, preserve unfinished code,
evidence, open questions and a resumable checkpoint, and report what did and did not work.
Preservation is not shipped value or a promise of continuation. Further investment needs a
fresh human-approved bet. If the bet finishes early, inspect the outcome and learning, then
let the human deliberately choose another serving; do not fill spare capacity automatically.
[The circuit breaker](https://basecamp.com/shapeup/2.2-chapter-08)

Suggest `squad-decompose` as the next step, without running it unless requested. It consumes
the selected contract and carries the appetite and integrated check into `user-story.json`.
If unavailable, the same contract supports manual story planning. Tell users precisely
what the selected outcome does and does not support.
