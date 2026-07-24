# De-risking (worked example): a personal assistant over Telegram

*Shows the `derisk` skill working **source-disciplined**: it decomposes each concern,
labels provenance, classifies the parts, and — crucially — does not spike what the brief
already answered. External facts it leans on are `[verified]` against current docs and
cited; everything else is `[stated]` or `[inferred]`, never dressed up as fact.*

## The source for this example (assumed `product.md`)

> **Product:** a personal assistant you talk to in **Telegram**.
> **Deployment:** **Railway**, always-on.
> **v1 scope:** read your Google **Calendar** (read-only) to see commitments; hold
> conversations that can **pause and resume**.
> **Out of v1:** **Gmail**; email correlation.
> **Users:** single owner (just you).

Everything below reasons from *this* brief. Nothing is invented to fill a gap.

## Concern decomposition

The same concern splits into parts that belong in different quadrants:

| Concern | Known portion | Unknown portion → candidate |
| --- | --- | --- |
| Deployment | `[stated]` Railway, always-on | `[unanswered]` secrets, releases, rollback, monitoring → C3 |
| Telegram | `[stated]` Telegram is the interface | `[unanswered]` bot registration, webhook config → C4 |
| Calendar / Gmail access | `[stated]` Calendar read-only in v1; Gmail **out of v1** | `[unanswered]` Calendar consent, token refresh/reconnect → C1 |
| Conversation pause/resume | `[stated]` conversations can pause/resume | `[unanswered]` where an unfinished conversation persists → C2 |

**The key correction:** Gmail is **not** a candidate spike. The builder mentioned it, but
`product.md` scoped it out of v1 — so it is *answered*, not a risk. Spiking it would be
inventing work the source already closed.

## The matrix

At a glance:

|                     | **Aware of it**                          | **Not aware**                         |
| ------------------- | ---------------------------------------- | ------------------------------------- |
| **Know the answer** | 🟢 Railway target; Telegram UI; single-owner | 🟡 Gmail already out of v1 (answered) |
| **Don't know**      | 🔵 Calendar consent/tokens; persistence; deploy ops; TG config | 🔴 Sensitive-scope verification; token revocation on redeploy; cost at usage |

### 🟢 Known knowns
- **Deploy target** — Railway, always-on. `[stated]`
- **Interface** — Telegram. `[stated]`
- **Single owner** — no login / multi-tenant needed for v1. `[stated]`

### 🔵 Known unknowns → candidates below
- **Calendar consent + token lifecycle** — → C1 `[unanswered]`
- **Unfinished-conversation persistence** — → C2 `[unanswered]`
- **Deploy ops (secrets/releases/rollback/monitoring)** — → C3 `[unanswered]`
- **Telegram bot + webhook config** — → C4 `[unanswered]`

### 🟡 Unknown knowns — already settled, easy to miss
- **Gmail is out of v1** — the brief already answered it; treat as done, not a spike. `[stated]`
- **Single-owner** — means a *personal-use* OAuth path may apply (see C1), which most guides
  aimed at public apps ignore. `[stated]` → connects to `[verified]` below.

### 🔴 Unknown unknowns — go scout, then cite
- **Google verification for a sensitive scope** — reading Calendar events is a **sensitive**
  scope; whether a personal-use app must go through verification (and how long) is the
  territory to confirm from Google's docs *before* ranking C1. See the verified facts below.
- **Token revocation / redeploy** — what happens to a paused conversation or a live token
  across a Railway redeploy.
- **Cost & limits at real usage** — Telegram limits, per-message LLM cost.

## Verified external facts (checked against current Google docs)

Because these drive C1's priority, they are `[verified]` and cited — not recalled:

- Reading Calendar events is a **sensitive** scope. — [Google: sensitive-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification)
- Gmail read scopes such as `gmail.readonly` are **restricted** (a stricter tier). — [Google: restricted scopes list](https://support.google.com/cloud/answer/13464325)
- Google lists a **personal-use exception** to restricted-scope verification — relevant to a
  one-owner product. — [Google: restricted-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)

*(Provider policies drift — re-check these at build time.)* This is what corrects the old
version of this example, which wrongly called Calendar "non-restricted" and treated a Gmail
"verification wall" as the top risk. With Gmail out of v1 and a personal-use path available,
the external blocker is smaller than it first appears.

## Candidate spikes, in suggested priority order

> Suggested first: **C1**, because its risk is partly external (Google consent) — but first
> confirm from the docs above whether personal-use verification even applies; that check is
> 20 minutes and may downgrade C1 from "blocker" to "routine". Your call.

### C1 — Can a single-owner app read my Calendar, and how do tokens refresh/reconnect?
- **Rationale:** Calendar events are a `[verified]` sensitive scope; a wrong guess about
  verification could add an external wait, though the personal-use path may avoid it.
- **Options:** OAuth directly via a personal-use project · a connector service (Composio /
  Nango) · testing-mode app with yourself as the sole test user.
- **Rough time-box:** ~1 day, plus any verification wait.
- **Done when:** the app lists today's events with stored credentials, and you know whether
  verification applies for personal use.

### C2 — Where does an unfinished conversation persist across restarts?
- **Rationale:** "pause and resume" is the product's core `[stated]` promise; the naive
  in-memory approach silently loses every conversation on redeploy.
- **Options:** a DB keyed by chat id · a durable workflow engine (Inngest / Temporal) ·
  in-memory (reject except for a throwaway prototype).
- **Rough time-box:** ~1 day.
- **Done when:** message → restart the app → follow-up still remembers the thread.

### C3 — How do secrets, releases, rollback, and monitoring work on Railway?
- **Rationale:** `[stated]` Railway is the target, but the operational parts are
  `[unanswered]` — and they are what turn a demo into something you can run.
- **Options:** Railway env vars + deploy-on-push + logs · add a health check and an alert ·
  confirm a rollback path.
- **Rough time-box:** a few hours.
- **Done when:** a deploy with a secret set, a rollback tested, logs visible.

### C4 — Register the bot and wire the webhook to the Railway URL
- **Rationale:** low risk, well-trodden; the only trap is a webhook/host mismatch.
- **Options:** webhook (Telegram POSTs to your public Railway URL — fits an always-on host)
  vs long-polling; use a library over the raw Bot API. *(webhook-vs-polling is `[inferred]`
  guidance, not from the brief.)*
- **Rough time-box:** a few hours.
- **Done when:** the bot echoes a message back via the webhook.

---

## Not yet answered
- Whether personal-use verification applies to the Calendar sensitive scope, and any timeline
  — confirm from the cited docs before ranking C1 as a blocker.
- Token refresh/reconnect and where secrets live on Railway.
- Cost and rate limits at real usage.

*Next step (your call): read this, pick the spike(s) to run, then invoke the `spike` skill for
your choice. Once a spike lands, its answer is a known-known that `squad-decompose` can turn
into stories.*
