# Performance notes

## Cold start (Epic E1)

**Target (PRD):** application UI **interactive** within **≤2000 ms** from launch ([PRD §1](../PRD.md)).

### Recorded measurement (today)

| Metric | What it covers | How to read it |
|--------|----------------|----------------|
| Main-process readiness | Process start → `app.whenReady()` | Log: `[star-hotel] app.whenReady() + Nms from process start` ([`src/main/bootstrap.ts`](../src/main/bootstrap.ts)) |

**Procedure (dev, informal):**

1. Start `pnpm dev` from a warm machine.
2. Note the log line above in the terminal.
3. Optionally note when the window first shows meaningful content (not yet automated).

### Gap vs full PRD target (documented)

The **≤2000 ms** PRD target applies to **perceived UI readiness**, not only `app.whenReady()`. Today we **record** the main-process slice only; we do **not** yet have an automated number for **first paint** or **time-to-interactive**. That gap is acceptable for Epic E1 per PRD (“measured and recorded **or** gap documented with remediation plan”).

**Remediation plan**

- **Epic E7:** add timestamps for IPC round-trip, representative query, and (where feasible) first paint / route transition; document methodology in this file or `README`.
- **If `app.whenReady()` alone exceeds budget:** defer non-critical main work before `whenReady`, trim renderer entry imports, compare **production** `pnpm build` + `pnpm preview` (fairer than dev+HMR for packaging targets).

**Interpretation:** Dev HMR and renderer attach are **out of scope** for this E1 metric; treat them separately when tightening the budget.
