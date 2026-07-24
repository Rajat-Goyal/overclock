# De-risking: a personal assistant over Telegram

*Worked example for the `derisk` skill. Product (inferred from the concerns): a
personal assistant the builder talks to in **Telegram**, that can read their **Google
Calendar** and **Gmail**, and holds **multi-turn conversations that pause and resume**.
Built by someone who is **not an engineering expert**, for their own use.*

The four concerns the builder raised are all in one quadrant — *known unknowns* — which
is exactly why they feel like the scary part. The value of the matrix is the **other
three quadrants**: the things they didn't list but should worry about (or stop worrying
about).

## The Rumsfeld matrix

### 🟢 Known knowns — we know how (confidence, no spike)
- **Creating the bot** — a Telegram bot is registered with @BotFather, which issues a
  token; that token is how your code authenticates. Well-trodden, thousands of guides.
- **The "brain"** — the assistant's replies are an API call to an LLM provider; that
  part is a solved, documented integration.

### 🔵 Known unknowns — we know we don't know → **spikes**
- **How does the app connect to Telegram?** → Spike 2.
- **What does deployment look like?** → Spike 3.
- **How do I give it access to my Calendar and Gmail?** → Spike 1.
- **How does it pause and resume a multi-turn conversation?** → Spike 4.

### 🟡 Unknown knowns — assumptions you're leaning on (make them explicit)
- **"It's just me."** The whole design silently assumes a single user, so no login, no
  per-user data separation. Fine — but write it down: the day you want to share it, that
  assumption is a rebuild, not a tweak.
- **"Google will just let my app read my email."** You're assuming access is a
  formality. It is not always (see the red quadrant) — this assumption is doing a lot of
  quiet load-bearing.
- **"Telegram is the right front door."** Assuming the interface is settled; cheap to
  accept, worth saying out loud.

### 🔴 Unknown unknowns — blind spots (go scouting)
- **Google's verification wall.** Reading Gmail uses a *restricted* permission. Google
  can require an app-verification / security review before it will grant that to a real
  account — potentially **weeks**, and a first-time builder never sees it coming. Go
  scout this **first** (it drives Spike 1's priority).
- **What happens to a paused conversation when you redeploy or the token expires.** State
  that lives only in memory vanishes on restart; access tokens expire and must refresh.
- **Real-world limits & cost.** Telegram and Gmail both rate-limit; "always-on" hosting
  and per-message LLM calls cost money. Read each provider's *limits* and *pricing* pages.

---

## Spikes, in priority order

> Do **Spike 1 first.** Not because it's the hardest to code, but because the answer is
> partly **outside your control** (Google's approval timeline). If it's going to take
> weeks, you want that clock started before you build anything on top of it.

### Spike 1 — How do I let the app read my Google Calendar and Gmail, securely?
- **Why it's risky:** access to Gmail is a sensitive/restricted permission; Google may
  demand app verification before granting it, which can block launch for weeks. Guessing
  wrong here doesn't cost a re-code — it costs the timeline.
- **Options:**
  1. **Google OAuth directly** — create a Google Cloud project, configure a consent
     screen, request calendar + gmail scopes, store the tokens. Most control, most setup,
     you hit the verification question head-on.
  2. **A connector service** (Composio / Nango / Pipedream, or a Google MCP connector) —
     it handles the OAuth dance for you; you get an API. Faster start, a dependency and
     possibly a cost.
  3. **Narrow the ask** — start read-only, calendar-only (a *non*-restricted scope), add
     Gmail later. Smallest permission that proves the idea, least verification friction.
- **Time-box:** 1 day (plus however long Google's review takes — start it now).
- **Done when:** the app can print today's calendar events and the subject of your latest
  email, using stored credentials — **and** you know whether/how long verification takes.

### Spike 2 — How does my code receive and reply to Telegram messages?
- **Why it's risky:** low. It's well-trodden — the risk is picking an approach that
  fights your hosting choice (Spike 3), so decide them together.
- **Options:**
  1. **Webhook** — Telegram POSTs each message to a public URL of yours. Efficient; needs
     an always-reachable URL (pairs with serverless/PaaS hosting).
  2. **Long-polling** — your code continuously asks Telegram "anything new?". Simplest to
     run locally; needs a process that's always on.
  3. Use a **library** (grammY, python-telegram-bot) over the raw Bot API either way — it
     handles the fiddly parts.
- **Time-box:** a few hours.
- **Done when:** you send the bot a message and it echoes it back, end-to-end.

### Spike 3 — Where does this run so Telegram can always reach it?
- **Why it's risky:** low — many easy options. The only real trap is a choice that can't
  keep state or costs a lot when idle.
- **Options:**
  1. **Platform-as-a-Service** (Railway / Render / Fly.io / Vercel) — push code, get a
     URL, minimal ops. Best fit for a non-expert.
  2. **A small always-on VPS** — most control, most babysitting.
  3. **Serverless functions** behind the Telegram webhook — cheap at rest, but pause/
     resume state must live in a database (see Spike 4), never in memory.
- **Time-box:** a few hours.
- **Done when:** the Spike-2 echo bot replies from a deployed URL, not your laptop.

### Spike 4 — How does a conversation survive across messages and restarts?
- **Why it's risky:** high, and architectural. It's the core of the product ("pause and
  resume"), and the naive approach (keep it in memory) silently loses every conversation
  on each redeploy.
- **Options:**
  1. **A database keyed by chat id** — store the conversation state per Telegram chat;
     reload it on each message. Simplest, robust across restarts.
  2. **A durable workflow engine** (Vercel Workflow / Inngest / Temporal) — built to
     pause a task and resume it later; more power, more concepts to learn.
  3. **In memory only** — reject except for a throwaway prototype; it fails the moment you
     redeploy.
- **Time-box:** 1 day.
- **Done when:** you message the bot, restart the app, send a follow-up, and it still
  remembers the thread.

---

## Not yet answered (after these spikes)
- Whether Google requires verification for your scopes, and the timeline — **the biggest
  external risk; go ask before you build.**
- Token refresh and secret storage (where the OAuth tokens live safely).
- Rate limits and monthly cost at your real usage.

*Once a spike lands, its answer is a known-known — hand it to `squad-decompose` to turn
into stories.*
