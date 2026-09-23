# Shape Up, for builders

Shape Up (Ryan Singer, Basecamp) is the primary method reference:
https://basecamp.com/shapeup. Cite the relevant chapter when applying it. The contract and
ledger fields in Overclock are our adaptation for agent execution, not book terminology.

## Appetite

Choose an investment boundary before designing the scope. The book's small batches
(one or two weeks) and six-week cycles describe its team practice; use the builder's actual
capacity and time boundary, including much shorter workshop bets. Record how time is counted.
Context-window sizing and optional agent resource budgets serve different purposes.
[Set boundaries](https://basecamp.com/shapeup/1.2-chapter-03)

## Rough, solved, bounded

Leave implementation room, but work out the core mechanisms that make the proposed outcome
credible. Check evidence and remaining risks rather than declaring everything solved after
one spike. Shaping may uncover another targeted investigation or lead to a narrower bet.
Only critical unknowns within this bet block selection; unrelated future unknowns can wait.
[Principles of shaping](https://basecamp.com/shapeup/1.1-chapter-02),
[Risks and rabbit holes](https://basecamp.com/shapeup/1.4-chapter-05)

## Vision, bet and integrated pieces

The product vision can span many bets. One release bet aims at a useful outcome and offers
evidence about a value hypothesis. Its stories build integrated, demoable pieces early,
starting with a walking skeleton. Cover the layers needed for that piece, not every future
subsystem. Label internal increments honestly; a working demo does not imply a released bet.
[Get one piece done](https://basecamp.com/shapeup/3.2-chapter-11)

## The pitch

The book's five ingredients are problem, appetite, solution, rabbit holes and no-gos.
Overclock retains those and adds a lightweight execution handoff: source/constraint
provenance, readiness evidence, permitted cuts, integrated verification and approval.
Requirements describe needed outcomes; mechanisms describe ways to achieve them. Compare
alternatives honestly instead of counting an untested mechanism as satisfying a requirement.
[Write the pitch](https://basecamp.com/shapeup/1.5-chapter-06)

## No-gos, cuts and the circuit breaker

No-gos exclude scope. Cuts simplify included scope while preserving the outcome and
essential quality, permission and truthfulness requirements. Neither is the circuit breaker:
that is the rule against automatically extending a bet beyond its investment limit.
An unfinished bet stops; preserve work and evidence for review, then reshape and seek a fresh
bet before investing more. Unfinished artifacts are not a shipped outcome or an entitlement
to continuation. Finishing early is also a decision point, not permission to add another bet.
[The betting table](https://basecamp.com/shapeup/2.2-chapter-08)

## Betting

Only the next bet is a commitment; candidates remain options. Consider whether the problem
matters and the appetite and timing fit. Shipping enables learning about value; it does not
prove the product's value hypothesis.
[Place your bets](https://basecamp.com/shapeup/2.3-chapter-09)

## Historical design reference

Ryan Singer's [shaping-skills](https://github.com/rjs/shaping-skills) repository was archived
September 21, 2026 and its README marks the skills obsolete. We use it only as historical
inspiration, not an installation dependency or current authority. Useful ideas from
[shaping](https://github.com/rjs/shaping-skills/blob/main/shaping/SKILL.md) and
[breadboarding](https://github.com/rjs/shaping-skills/blob/main/breadboarding/skill.md) are
explicit unknowns, requirements versus mechanisms, consistency across documents, and
connecting actions to observable results. No large notation system, UI-only restriction or
fixed slice-count limit is required here.
