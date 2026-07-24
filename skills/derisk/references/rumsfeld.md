# The Rumsfeld matrix, for builders

> "There are known knowns … known unknowns … but there are also unknown unknowns —
> the ones we don't know we don't know." — Donald Rumsfeld

Two axes: **do we know it?** (the answer) × **do we know we're missing it?** (the
question). Four quadrants. The point of the exercise is not to be clever about the
labels — it is to route each concern to the *right kind of action*.

```
                        Are we AWARE of it?
                     aware              unaware
                 ┌───────────────┬───────────────┐
      know   yes │ KNOWN KNOWN   │ UNKNOWN KNOWN │
   the answer?   │ → confidence  │ → assumption  │
                 ├───────────────┼───────────────┤
             no  │ KNOWN UNKNOWN │ UNKNOWN       │
                 │ → SPIKE       │ UNKNOWN       │
                 │               │ → go scouting │
                 └───────────────┴───────────────┘
```

## Known known — "we know how"

We know both that we need it and how to do it. Output: **a one-line brief** recording
the answer so the team stops re-debating it. No spike. The trap: labelling something a
known-known out of optimism ("auth is easy") when it is really a known-unknown. If you
cannot state the *how* in one sentence, it is not a known-known.

## Known unknown — "we know we don't know" → the spike

The productive quadrant. We know the thing is required; we do not yet know how, or which
option is right, or whether it even works. This is what a **spike** exists for: a small,
time-boxed, throwaway investigation that answers exactly one question.

Anatomy of a spike:

- **Question** — one sentence. If it needs "and", it is two spikes.
- **Why it's risky** — the cost of guessing wrong (rework, spend, a multi-week external
  wait, a security hole).
- **Options** — 2–3 concrete approaches to actually try. Name real tools/paths, in plain
  language. These are the options the matrix hands you.
- **Time-box** — hours to a day. A spike that grows into a week is a project; stop and
  re-plan.
- **Done when** — the smallest observable proof (a bot that echoes; a script that lists
  today's events). Not "we understand it better" — something you can see.

A spike's job is to *convert* a known-unknown into a known-known. Its code is disposable;
its **answer** is the deliverable.

## Unknown known — "we didn't realize we were assuming it"

Tacit knowledge and buried assumptions: things the plan silently depends on that nobody
wrote down. "It's just me using it, so no login." "Google will obviously let my app read
my mail." "Telegram is fine as the interface." Each is load-bearing, and each is a guess.

Output: **a one-line brief that makes the assumption explicit** and states the risk if it
is wrong. Surfacing it is most of the win — an assumption you can see is one you can
choose to cheaply validate (a quick check) or consciously accept. The danger of an
unknown-known is that it fails *late*, after you have built on top of it.

## Unknown unknown — "we don't know what we don't know"

Blind spots. By definition you cannot list them — but you can point at the **territory**
where they cluster and go looking:

- Third-party **review / verification** gates (e.g. an API provider requiring an app
  security assessment before granting sensitive access) — classic launch-blockers a
  first-time builder never sees coming.
- What happens under **failure and change**: a redeploy mid-conversation, a revoked
  token, a service outage.
- **Limits and cost** at real usage: rate limits, quotas, always-on billing.

The move: **turn unknown-unknowns into known-unknowns** by talking to someone who has
shipped this before, or reading the "limits", "pricing", and "going to production" pages
of every third party. A short conversation is the cheapest de-risking there is.

## Prioritizing spikes

Do first the spike whose wrong answer costs the most, not the one that is most obvious.
Rank by:

1. **Blocking** — does everything else depend on the answer?
2. **Uncertainty** — how likely are we to be wrong?
3. **Blast radius** — redesign, real money, or a long external wait if we are?

An external-dependency spike (a verification process you don't control the timeline of)
usually outranks anything you can build yourself on your own schedule — start the clock
on it first.

## Where this feeds

A resolved spike is a known-known. Feed it to `squad-decompose`: the answer becomes the
`context.read_first` and the constraints for the stories that implement it for real.
