# Epic E6 — Testing & quality gates (supporting notes)

Supporting documentation for **US6.3**, **US6.4**, and the PRD **50-case evaluation matrix** roadmap. Authoritative checkboxes remain in [PRD.md](./PRD.md).

## US6.3 — IPC / integration (stretch)

**PRD choice:** Supertest against Express or an electron-mock harness; if not implemented, document the substitute and manual follow-up until E10.

**What ships for E6:** Automated HTTP-level integration tests run in **Node** (no Electron shell): `src/server/create-app*.test.ts`, `src/server/reservations/reservation-service.test.ts`, `src/main/embedded-api-stack.test.ts`, and related files. They exercise the Express app, SQLite, Zod boundaries, and reservation CRUD/error paths the renderer uses via the embedded API client.

**Not in scope for this substitute:** A full **Electron end-to-end** harness (renderer + main + preload). That remains a manual smoke path (`pnpm dev`, CRUD on reservations) until E10 packaging or a dedicated E2E tool is added.

**Manual script (until E10):** From a clean checkout: `pnpm install → pnpm test → pnpm dev →` create / list / edit / delete a reservation and confirm totals and dates.

## US6.4 — Golden / migration verification (T3, blocked on T4)

**N/A for MVP:** [DECISIONS.md](./DECISIONS.md) (§ **T4**) locks **clean install** + SQLite migrations; a **one-time `.mdb` import** is post-MVP/optional.

**Golden diff / legacy export parity:** Requires a stable import pipeline and export fixtures. With **no import path** in Phase 1, there is no **legacy export vs SQLite invariant** diff to automate. If T4 is revisited for Phase 2, revisit T3 (golden rows) and add a dedicated migration or import test suite.

## Roadmap — 50-case evaluation matrix (spec)

The course spec references a **~50-case** matrix (happy / edge / concurrency). This is a **roadmap**, not a commitment to 50 automated cases in E6.

| Category | Intent | Examples (planned IDs) | Where covered first |
|----------|--------|------------------------|----------------------|
| **H — Happy path** | Core CRUD and read paths | H1 create reservation; H2 list; H3 edit; H4 delete | Renderer + server tests; manual `pnpm dev` |
| **E — Edge** | Validation, empty DB, bad IDs | E1 Zod field errors; E2 invalid reservation id; E3 empty guest/room catalogs; E4 date ordering / leap years | `use-reservation-editor` tests; `reservation-pricing` tests; form RTL |
| **C — Concurrency / data** | WAL + transactions; overlap rules | C1 overlap rejection; C2 concurrent writes (stretch) | `reservation-service.test.ts`; server integration tests |
| **P — Performance / perf budget** | Latency thresholds | P1 cold start; P2 IPC RTT (post-MVP instrumentation) | Epic E7 |

**Next tranche:** Expand **E** cases with additional Zod messages and API 4xx/5xx paths in `create-app.*.test.ts`; add **C1** overlap cases if not already exhaustive; document **manual** **C2** until a dedicated concurrency test is justified.
