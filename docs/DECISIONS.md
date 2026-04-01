# Architecture & product decisions (StarHotel)

Canonical decisions for open gates **T4**, **T5**, and **T2**. Other docs should link here instead of duplicating rationale.

**Related:** [PRE-SEARCH.md](./PRE-SEARCH.md), [ROUTE-MAP.md](./ROUTE-MAP.md), [TODOS.md](./TODOS.md), [PRD.md](./PRD.md).

---

## T4 — Migration fork (clean install vs `.mdb` import)

| Field | Value |
|--------|--------|
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
|--------|-----------|
| **domain** | Pure rules unchanged; import adapters would map legacy rows → domain DTOs if Phase 2 ships. |
| **server** | Owns migrations, WAL SQLite, and (later) import command/service boundary. |
| **shared** | Zod schemas for API + any future import row shape. |
| **renderer** | No DB access; no import UI required for MVP unless product asks. |

---

## T5 — Report scope contract (E9)

| Field | Value |
|--------|--------|
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
|--------|--------|
| **Status** | Accepted |
| **Date** | 2026-03-31 |

### Context

Spec rubric rewards coherent breadth; build order should follow **front-desk value** first, then shell and auth, then cross-cutting docs.

### Decision — ranked backlog

| Priority | Workflow | PRD anchor |
|----------|-----------|------------|
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
