# Performance notes

## PRD targets (reference)

| Metric | Target | Notes |
|--------|--------|--------|
| Cold start | ≤2000 ms | UI interactive ([PRD §1](../PRD.md)) |
| IPC round-trip | ≤15 ms | Dev-measured harness |
| Critical DB ops | ≤50 ms | Local WAL |
| Primary view transition | ≤100 ms | Perceived |

## Cold start

**Target (PRD):** application UI **interactive** within **≤2000 ms** from launch.

| Metric | What it covers | How to read it |
|--------|----------------|----------------|
| Main-process readiness | Process start → `app.whenReady()` | JSON log from [`mainProcessLogger`](../src/server/logging/structured-logger.ts) / line: `[star-hotel] app.whenReady() + Nms from process start` ([`src/main/bootstrap.ts`](../src/main/bootstrap.ts)) |

**Procedure (dev):**

1. Run `pnpm dev`.
2. Read the terminal line above (`Nms`).

**Gap:** The **≤2000 ms** bar is for **perceived** readiness; we still do not automate first paint / TTI. Compare **`pnpm build` + `pnpm preview`** for a fairer number than dev+HMR.

## IPC and embedded API round-trip (Epic E7)

| Metric | What it covers | How to measure |
|--------|----------------|----------------|
| Embedded API RTT | Renderer → `GET /health` → main | Home **Perf smoke (E7)** or [`runPerfSmoke`](../src/renderer/src/lib/perf-measurements.ts) (`embeddedApiRttMs`) |
| IPC RTT | Renderer → `ipcMain.handle('ping')` → SQLite readiness | Same (`ipcRttMs`) |
| Representative query | `GET /api/reservations` list | Same (`reservationListMs`); also in **structured logs** as `http.access` with `path` and `durationMs` |

**Procedure:** On Home, click **Perf smoke (E7)**. The UI prints three latencies; copy into this file when recording a baseline.

**Interpretation:** IPC and health checks are **not** identical (HTTP vs IPC channel). The PRD **≤15 ms** IPC target applies to the **IPC ping** number in dev on a warm machine.

## Gap list (owners)

| Item | Status |
|------|--------|
| First paint / TTI | Not automated |
| Route transition ≤100 ms | Not automated; use React Profiler + manual spot checks |

**Remediation:** Trim main work before first paint; avoid heavy synchronous imports in renderer entry; profile `pnpm preview` builds.
