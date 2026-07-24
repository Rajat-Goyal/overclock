# Slice candidates (worked example): Shiori

*Worked example for the `slice` skill. Product: **Shiori**, a Telegram assistant that helps
a single owner keep commitments (capture → remind → follow through), with read-only Google
Calendar and a minimal dashboard. The deployment + public-access unknowns were already
de-risked with a spike, so the remaining risk is product behavior, not hosting — which is
exactly when Shape Up says to shape a bet.*

## Is this one bet, or many?

`product.md` is a strong contract but bundles several independently risky systems: intent
classification, commitment clarification, persistence/editing, recurring scheduling,
reminder delivery, outcome handling, Calendar auth + matching, availability calculation,
Telegram commands, a substantial dashboard, owner isolation, duplicate protection, and
production evidence. That's a release vision, not one shaped pitch. Shape Up: appetite first,
then vary scope; break off a *meaningful* piece, not a technical layer.
[Set boundaries](https://basecamp.com/shapeup/1.2-chapter-03)

---

## Recommended first bet — "First Promise Kept"

> In one cycle, ship a production loop in which the configured owner explicitly creates and
> confirms a one-off Telegram commitment, receives exactly one durable reminder, marks it
> Done, and sees the same live state and event history on a protected minimal dashboard.

- **Problem** — People express commitments but fail to follow through, because the intention
  never becomes a concrete, timely loop.
- **Appetite** — one big batch (~6-week cycle) — enough for real production verification, not
  a happy-path demo.
- **User experience**
  1. Owner: "Remind me to send the proposal tomorrow at 9."
  2. Shiori asks for any essential missing info, one question at a time.
  3. Shiori shows exactly what it will save; owner confirms.
  4. It appears in `/status` and a minimal dashboard.
  5. At the time, Shiori sends **exactly one** reminder.
  6. Owner replies **Done**; the dashboard reflects the completed occurrence + history.
- **Included** — one configured owner; explicit one-off commitments; structured extraction;
  missing-field clarification; confirm-before-save; Supabase persistence; `/status`;
  restart-safe one-time scheduling; duplicate webhook/reminder protection; Done outcome; a
  minimal protected dashboard (active commitments, definition of done, target time, reminder
  delivery, Done); **live data only**; Railway deploy + end-to-end evidence.
- **No-gos** — implied-intent classification; general Q&A; recurrence; snooze/skip; Google
  Calendar; editing/cancelling; `/today`; dashboard analytics/free-windows/calendar; rich NL
  beyond the shaped examples. For unsupported input Shiori is honest: "For now I can manage
  explicit one-off reminders" — it must not pretend to support the full contract.
- **Rabbit holes** — Telegram retries creating duplicate commitments; restart-safe
  scheduling; associating "Done" with the right outstanding reminder; time-zone / relative
  dates; model output that is structurally valid but semantically unsafe; a confirmation that
  differs from what is stored.
- **Why it fits Shape Up** — rough, solved, bounded, and it ends in a *meaningful result*: a
  promise captured, recalled at the right time, and closed. Stop after this cycle and you
  have a small but real Shiori, not disconnected foundations.
  [Principles of shaping](https://basecamp.com/shapeup/1.1-chapter-02)

---

## Other candidates (condensed)

### "Trusted Commitment Capture" — small batch (1–2 wk)
Explicit one-off commitment → clarification → confirm → `/status` + minimal dashboard.
**Why not first:** proves *capture*, not *follow-through* — risks feeling like a to-do list.
A fine fallback if the true appetite is only two weeks.

### "Find Me a Real Time" — big batch
Read-only Calendar availability → offer 1–2 slots → save the commitment. **Why not first:**
front-loads Calendar auth, time-window policy, and availability logic before proving the
basic loop is useful. Choose only if your strongest hypothesis is "calendar-aware timing,
not reminder execution, is why people use Shiori."

### "Daily Follow-Through Ritual", "Recurring Rhythm", "Reschedule Without Lying"
Strong *later* bets — each depends on the one-off loop existing first (a read model with no
real commitments, or recurrence/snooze edge cases on an unproven state machine).

---

## Comparison

| Slice | User value shipped | Appetite | Product risk tested | Good first bet? |
| --- | --- | ---: | --- | --- |
| First Promise Kept | Full capture→completion loop | 6 wk | Highest-value core risks | **Yes** |
| Trusted Commitment Capture | Clear, saved intentions | 1–2 wk | Conversation + persistence | Only with a small appetite |
| Find Me a Real Time | Calendar-aware planning | 6 wk | Calendar + time selection | Conditional on hypothesis |
| Daily Follow-Through Ritual | Unified daily view | 6 wk | Read model + daily usefulness | No — needs real commitments |
| Recurring Rhythm | Repeated follow-through | 6 wk | Recurrence state machine | After the one-off loop |
| Reschedule Without Lying | Honest recovery after interruption | 6 wk | Snooze + Calendar | Strong later bet |

## Suggested sequence (options, not promises)

1. First Promise Kept
2. Recurring Rhythm *or* Find Me a Real Time (depending on observed user pain)
3. Reschedule Without Lying to Yourself
4. Daily Follow-Through Ritual
5. Expand the dashboard only once the underlying live data exists

Only the next bet gets shaped and chosen; the rest stay options.
[Place your bets](https://basecamp.com/shapeup/2.3-chapter-09)

## Next step (your call)

Pick a slice — if it's "First Promise Kept," hand its Included/No-gos/appetite to
`squad-decompose` to break into stories. Keep `product.md` as the north-star contract and add
this pitch as the first bet; don't let the pitch overwrite the contract.
