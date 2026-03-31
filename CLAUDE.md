# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modernization of a legacy Visual Basic 6.0 + Microsoft Access hotel reservation system into a production-ready desktop application. Target audience: hotel-tech hiring partner; code is interview-grade.

## Stack (non-negotiable per spec)

| Layer | Technology |
|-------|-----------|
| Desktop shell | Electron |
| Frontend | React 19 + Tailwind CSS v4 + shadcn/ui |
| Backend | Express.js (runs in Electron Main process) |
| Database | SQLite via `better-sqlite3` (WAL mode) |
| Language | TypeScript (strict) |
| Build | Vite |
| Testing | Vitest + React Testing Library |
| Validation | Zod (at all boundaries) |
| Packaging | Electron Builder |
| Observability | Sentry + PostHog (post-MVP) |

## Commands

> Commands are not yet implemented — app scaffolding has not started. Treat as the intended interface.

```bash
pnpm install
pnpm dev             # Start Electron + Vite in dev mode
pnpm build           # Build for production
pnpm test            # Run Vitest
pnpm test -- --run src/path/to/file.test.ts  # Single test file
pnpm lint            # ESLint
pnpm format          # Prettier
```

## Architecture

```
Electron Main Process (Node.js)
├── Express.js server  ← all business logic & DB operations
├── SQLite (better-sqlite3, WAL mode)
└── Preload script (contextBridge IPC contract)
        ↕ typed IPC only — no direct Node access from renderer
Electron Renderer Process (sandboxed)
├── React 19 (UI)
├── shadcn/ui components
└── Tailwind v4 styling
```

**Security model:** `contextIsolation: true`, `nodeIntegration: false`. Renderer communicates with main exclusively via the typed `contextBridge` preload. All data operations flow through Express REST endpoints inside main.

## Database Schema (from legacy Access migration)

```sql
tbl_room        -- RoomID, RoomType, Price, Status
tbl_guest       -- GuestID, Name, ID_Number, Contact
tbl_reservation -- ResID, RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount
tbl_user        -- UserID, Username, Password (Argon2), Role
```

Passwords are upgraded from legacy plaintext/MD5 to Argon2.

## MVP Gate Criteria (24-hour checkpoint)

- Secure IPC via `contextBridge` (no `nodeIntegration`)
- SQLite WAL mode instantiated with migration runner
- Express server operational in main process
- ≥1 legacy form fully recreated (React + Tailwind v4)
- Full CRUD cycle: frontend → IPC → Express → SQLite → frontend
- ≥5 Vitest tests on extracted business logic
- ESLint + Prettier passing

## Key Documentation

All authoritative specs live in `docs/`:

- `docs/VB6-Hotel-App-Modernization-Project-specs.md` — requirements, checkpoint gates, evaluation rubric
- `docs/PRE-SEARCH.md` — legacy schema map, VB6 forms → React component mapping, logic extraction
- `docs/StarHotel-Modernization-Design.md` — approved sequencing (Approach B+A), open questions
- `docs/AUTOPLAN-Full-Review.md` — CEO/Design/Eng review consensus, failure modes
- `docs/TODOS.md` — 8 ranked deferred items (T1–T8); check before making scope decisions

## Open Decisions (check `docs/TODOS.md` before acting)

- **T4** Clean install vs. legacy `.mdb` data import → blocks schema freeze
- **T5** Report scope (receipt-only vs. grouped financials) → blocks report sprint
- **T2** Primary workflow priority (front desk / night audit / reporting) → needs stakeholder input

## Business Logic to Port

1. **Room rate calculation** (`modLogic.bas`): daily pricing, partial-day handling
2. **Concurrency**: replace Access file-locking with SQLite WAL + transactions
3. **Reports**: Crystal Reports (P2smon.dll) → React-to-PDF + HTML print views
