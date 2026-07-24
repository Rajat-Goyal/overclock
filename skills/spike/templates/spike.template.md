# Spike: <short name>

*A small, time-boxed, throwaway investigation. The code is disposable; the answer is the
deliverable. Source: <product.md / scope as of DATE>.*

## Goal — the question this spike answers
<one sentence: the single thing we need to prove or learn>

## Why it de-risks
<what we stop guessing about once this is done; which known-unknown it retires>

## Scope
**In:**
- <the thing(s) being built — verbatim from the builder where possible>

**Out:**
- <explicitly not now — so the spike stays small>

## Decisions (from grill-me)
- **Behaviour:** <what "done" looks like>
- **Stack:** <language / framework>
- **Local setup:** <native (e.g. `npm run dev`) | Docker (`docker compose up`)>
- **Evidence loop runs:** <native-local | docker-local | against the deployed URL>
- **Deploy target:** <host, e.g. Vercel / Railway / Render>
- **Access:** <public / gated>
- *Assumed:* <safe defaults grill-me stated rather than asked>

## Plan
<the few steps to build the thinnest end-to-end thread>

## Done when (observable)
- <smallest visible proof, e.g. "clicking the button shows 'pong'">
- <e.g. "GET /api/health returns {status:'ok'} on the public URL">
- <e.g. "README lets a stranger run it locally and deploy it">

## Run locally
```
<the exact commands — native or docker, per the decision above>
```

## Deploy
```
<the exact steps to make it publicly reachable>
```

## Evidence loop
<how the verification checks are run, and where (local / docker / deployed) — this is
what squad-execute's gate will execute later>

## Open questions
- <anything still unknown after this spike, incl. unknown-unknowns to go scout>
