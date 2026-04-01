# Performance notes

## Cold start (Epic E1)

**Target:** application UI interactive within **≤2000 ms** from launch ([PRD §1](../PRD.md)).

**What we measure (dev, informal):**

1. Start `pnpm dev` from a warm machine.
2. Note the log line from main: `[star-hotel] app.whenReady() + Nms from process start`.
3. Subjectively note when the window first paints (first meaningful content).

**Interpretation:** The logged interval covers **Node/Electron process start → `app.whenReady()`** only. It does **not** include renderer Vite HMR attach or first paint; treat those separately when tightening the budget (Epic E7).

**Remediation ideas if over budget:** defer non-critical main work, trim renderer entry imports, review dev vs prod (production `pnpm build` + `pnpm preview` is the fair packaging comparison).
