# Architecture & product decisions (StarHotel)

Canonical decisions for **E1.5 (visual design)** and gates **T4**, **T5**, and **T2**. Other docs should link here instead of duplicating rationale.

**Related:** [PRE-SEARCH.md](./PRE-SEARCH.md), [ROUTE-MAP.md](./ROUTE-MAP.md), [TODOS.md](./TODOS.md), [PRD.md](./PRD.md), [STYLE-GUIDE.md](./STYLE-GUIDE.md), [DESIGN-DIRECTION.md](./DESIGN-DIRECTION.md).

---

## E1.5 Visual design and style lab scope

| Field | Value |
| -------- | -------- |
| **Status** | Accepted |
| **Date** | 2026-04-01 |

### Context

[PRD](./PRD.md) Epic E1.5 originally described an optional **in-app** design lab (React + Tailwind + shadcn under Electron). That would duplicate maintenance with the static exploration already captured in-repo.

### Decision

1. **Canonical visual system:** [STYLE-GUIDE.md](./STYLE-GUIDE.md) — **Lakeside Console** (light mode default), **Night Audit** (dark mode). Token mapping (colors, typography, spacing, density) and UI rules for implementation live there.
2. **Static style lab:** [style-test/](../style-test/) — plain HTML/CSS prototypes (`index.html`, `lakeside-console.html`, `night-audit.html`) for side-by-side comparison in a browser. **Not** bundled into the Electron production app; no IPC or Express surface.
3. **No in-app dev lab:** We are **not** shipping a `/dev/design-lab` React route. Rationale: scope and ROI; the STYLE-GUIDE plus `style-test/` satisfy exploration and lock for E5+.
4. **Index:** [DESIGN-DIRECTION.md](./DESIGN-DIRECTION.md) points here and to the guide and prototypes.

### Rejected options

- Additional distinct visual “C” directions beyond the two locked in STYLE-GUIDE (unless product explicitly expands scope).
- In-app Electron/Vite design lab for A/B (per above).

### Consequences

- UI work in E5+ follows **STYLE-GUIDE.md**; apply tokens to the shared shell as screens land (E5/E8), not a separate fake lab route.
- [README.md](../README.md) documents how to open `style-test/` for reviewers.

---

## T4 — Migration fork (clean install vs `.mdb` import)

| Field | Value |
| -------- | -------- |
| **Status** | Accepted |
| **Date** | 2026-03-31 |

### Context

E2 must freeze SQLite schema and migration strategy. Legacy data lives in `StarHotel.mdb` (see [PRE-SEARCH.md](./PRE-SEARCH.md)). T3 (golden export / diff) depends on whether import is in scope.

### Decision

**Phased approach:**

1. **MVP / E2 baseline:** **Clean install** — apply forward migrations only; populate development via **deterministic seeds** (fixtures), not production `.mdb` bytes.
2. **Post-MVP / optional:** A **one-time import pipeline** (explicit operator action, idempotent or clearly documented re-run rules) may be added **after** the MVP gate, if stakeholder needs legacy rows for demo or parity claims.

### Rationale

- Unblocks schema freeze and E5 CRUD without blocking on Access export tooling.
- Keeps MVP test matrix small; import adds encoding, duplicate key, and quarantine edge cases (see T3).

### Consequences — T0.1.1.1 (migrations, seeds, T3)

**Migrations (`server` layer, E2)**

- Single forward-only migration chain from empty DB.
- No import-specific DDL in the initial migration set unless/until Phase 2 is scheduled.

**Seeds (`server` or tooling)**

- Dev/staging: small fixture dataset aligned with Vitest and manual QA.
- Production narrative: “fresh install” unless import epic is executed.

**T3 — `.mdb` parity verification suite**

- **N/A for MVP** while on Phase 1 only; document as “deferred until import pipeline is Accepted.”
- If Phase 2 is implemented: T3 becomes **in scope** — golden export from legacy + diff against SQLite invariants.

### Layering (SOLID / modular preview)

| Layer | T4 impact |
| -------- | ----------- |
| **domain** | Pure rules unchanged; import adapters would map legacy rows → domain DTOs if Phase 2 ships. |
| **server** | Owns migrations, WAL SQLite, and (later) import command/service boundary. |
| **shared** | Zod schemas for API + any future import row shape. |
| **renderer** | No DB access; no import UI required for MVP unless product asks. |

---

## T5 — Report scope contract (E9)

| Field | Value |
| -------- | -------- |
| **Status** | Accepted |
| **Date** | 2026-03-31 |

### Context

Legacy reports use Crystal via `P2smon.dll` ([PRE-SEARCH.md](./PRE-SEARCH.md)). E9 must not balloon before scope is fixed.

### Decision — signed scope bullets (E9)

**In scope (minimum for final submission narrative)**

- **Guest folio / receipt:** print-friendly HTML view (and optional PDF) sourced from Express; data via report service, not renderer SQL.
- **One** operational summary suitable for front desk (e.g. simple occupancy or day sheet) as **HTML print**, if time permits — same stack as folio.

**Explicitly out of scope (unless course time remains after E8 + E9 minimum)**

- Crystal feature parity (grouping engine, subreports, proprietary `.rpt` reuse).
- Full **grouped financials** (e.g. multi-period revenue by room type) as a first-class deliverable.

**Phased stretch (document only — activate only if schedule allows)**

- Grouped financial report: optional P2 after folio ships; must reference this section before implementation.

### Rationale

- Meets “reports exist and are credible” without committing to BI-grade Crystal replacement in a short sprint.

---

## T2 — Primary workflow priority (post-MVP / E8 ordering)

| Field | Value |
| -------- | -------- |
| **Status** | Accepted |
| **Date** | 2026-03-31 |

### Context

Spec rubric rewards coherent breadth; build order should follow **front-desk value** first, then shell and auth, then cross-cutting docs.

### Decision — ranked backlog

| Priority | Workflow | PRD anchor |
| ---------- | ----------- | ------------ |
| 1 | Reservations / check-in (guest + room + dates + totals) | [PRD — US8.5](./PRD.md) |
| 2 | Rooms management (status, rates, inventory) | US8.3 |
| 3 | Guests management | US8.4 |
| 4 | Dashboard / navigation shell | US8.2 |
| 5 | Auth / session (`tbl_user`, Argon2) | US8.1 |
| 6 | State matrix doc (T1) — catalog per screen | US8.6 |
| — | Reports (Crystal → modern) after E8 breadth | Epic E9 (per **T5**) |

**Night audit / deep back-office:** folded into **E9** reporting stretch and **US8.6** state documentation unless a dedicated epic is added later; not ranked above front-desk CRUD for this course.

### Rationale

- Aligns MVP entity choice (reservations or guest/room per E5) with the highest-value operational path.
- Auth after shell lets internal demos use dev bypass until IPC/session hardening.

### Link to PRD

Implementation order is reflected under **Epic E8** in [PRD.md](./PRD.md) (“Implementation order (per T2)”).

---

## Embedded API config and IPC vs HTTP (renderer boundary)

| Field | Value |
| -------- | -------- |
| **Status** | Accepted |
| **Date** | 2026-03-31 |

### Decision

- **Embedded API URL:** `resolveApiPort` and `buildApiBaseUrl` in [`src/shared/embedded-api-config.ts`](../src/shared/embedded-api-config.ts) are the single source for default port (`STAR_HOTEL_PORT` override) and loopback base URL. Main and preload both use these helpers so defaults cannot drift.
- **HTTP (Express):** Hotel domain data and CRUD live on the embedded API; **`GET /health`** is the canonical check that the Express app is up.
- **IPC:** Used for Electron/native seams only (see [`IPC_CHANNELS`](../src/shared/ipc/channels.ts)), not as the primary domain transport.
- **Renderer contract:** [`StarHotelApp`](../src/renderer/src/lib/star-hotel-app.ts) (`createStarHotelApp`) is the facade; feature code uses `api` (embedded REST clients), `pingEmbeddedApi`, `pingIpc`, and `invoke` instead of calling `window.starHotel` or using ad-hoc `fetch` against the embedded API.

### Consequences

- Preload still reads `--star-hotel-api-base=` from the renderer process; when the flag is absent, the fallback uses the same shared URL builder as main.
- Express persistence is composed behind [`PersistencePort`](../src/server/ports/persistence.ts); future SQLite wiring injects a real implementation at `createServerApp` composition time.
