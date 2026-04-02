# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modernization of a legacy Visual Basic 6.0 + Microsoft Access hotel reservation system into a production-ready desktop application. Target audience: hotel-tech hiring partner; code is interview-grade.

## Stack (non-negotiable per spec)

| Layer | Technology |
| ------- | ----------- |
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

Epic **E1** scaffold is in place (`electron-vite`, strict TypeScript, Tailwind v4 + shadcn baseline).

```bash
pnpm install
pnpm dev             # Start Electron + Vite in dev mode
pnpm build           # Build for production (output under out/)
pnpm preview         # Preview production build
pnpm test            # Run Vitest
pnpm test -- src/path/to/file.test.ts  # Single test file
pnpm lint            # ESLint
pnpm format          # Prettier
pnpm typecheck       # tsc --noEmit (main/preload + renderer)
```

## Architecture

```text
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
- `docs/StarHotel-Modernization-Design.md` — pointer to sequencing (B+A); canonical detail in `DESIGN-DOC.md`
- `docs/DECISIONS.md` — **E1.5** (visual design scope), **T4, T5, T2** (Epic E0); canonical product/architecture gates
- `docs/STYLE-GUIDE.md` — locked UI directions (Lakeside Console / Night Audit) and tokens for implementation
- `docs/DESIGN-DIRECTION.md` — short index to E1.5 decisions and style guide
- `docs/ROUTE-MAP.md` — legacy forms/modules → planned React routes
- `docs/AUTOPLAN-Full-Review.md` — CEO/Design/Eng review consensus, failure modes
- `docs/TODOS.md` — deferred items (T1, T3, T6–T8); T2/T4/T5 resolved in `DECISIONS.md`

## Resolved gates (Epic E0)

**E1.5** (static style lab + [STYLE-GUIDE.md](docs/STYLE-GUIDE.md), no in-app lab) and **T4, T5, T2** are recorded in [`docs/DECISIONS.md`](docs/DECISIONS.md). Remaining deferrals: **T1, T3, T6–T8** in [`docs/TODOS.md`](docs/TODOS.md).

## Business Logic to Port

1. **Room rate calculation** (`modLogic.bas`): daily pricing, partial-day handling
2. **Concurrency**: replace Access file-locking with SQLite WAL + transactions
3. **Reports**: Crystal Reports (P2smon.dll) → React-to-PDF + HTML print views

## Knowledge management (repo-local, portable)

This section is **repository-agnostic**: copy it into any project’s `CLAUDE.md` (or `AGENTS.md`). It does not assume a product name or stack beyond a repo root.

**Scope.** All paths are relative to the **repository root**. Maintain a `knowledge/` directory here — not a global path on disk, and not outside the repo.

**Relationship to `docs/`.** Authoritative product specs, PRDs, ADRs, and course requirements stay in `docs/` (or your project’s usual docs tree). Use `knowledge/` for **recurring engineering facts**, **validated rules**, and **testable hypotheses**, grouped by **domain** (e.g. `workspace`, `pricing`, `auth`). If `docs/` does not exist in a repo, still use `knowledge/` for the same purpose alongside whatever docs you have.

**Directory contract:**

```text
knowledge/
  INDEX.md                 # lists domains; create if missing
  <domain>/
    knowledge.md           # facts and patterns
    hypotheses.md          # needs validation
    rules.md               # confirmed — apply by default
```

**Bootstrap (first use — run if anything is missing):**

1. Create `knowledge/` at the repo root.
2. Create `knowledge/INDEX.md` listing each domain with a one-line description and a relative link to `<domain>/`.
3. Choose a domain folder name (lowercase, hyphenated if needed, e.g. `workspace`, `api-clients`).
4. In that folder, create `knowledge.md`, `hypotheses.md`, and `rules.md` (empty or with a one-line purpose at the top).
5. Add the domain to `INDEX.md`.

**Workflow.** Before starting a task: skim `rules.md` and relevant `hypotheses.md` for the active domain. Apply `rules.md` by default; use work in this session to confirm or refute open hypotheses. After the task: append concise insights to `knowledge.md`, update `hypotheses.md`, or promote/demote content in `rules.md` as appropriate. When a hypothesis has been confirmed **five or more** times under real use, promote it to `rules.md`. When a rule is contradicted by new evidence, remove or rewrite it and record the correction in `knowledge.md` or move it back to `hypotheses.md`.

**Optional integrations** (do not create these files solely for knowledge — only patch if they already exist):

- **If `AGENTS.md` exists**, add this bullet under **Learned Workspace Facts** (or the closest equivalent heading) (if it doesn't exist, create it):

  ```markdown
  - Learned engineering patterns and cross-cutting facts live in `knowledge/` (see `knowledge/INDEX.md`). Authoritative product specs and decisions stay in `docs/`.
  ```

- **If `README.md` exists** and it already has a **Documentation**, **Contributing**, or **Project layout** section where repo folders are listed, add **one** of the following (whichever fits):

  ```markdown
  - Learned patterns (agent-maintained): [knowledge/INDEX.md](knowledge/INDEX.md).
  ```

  Or a row in a layout table:

  ```markdown
  | `knowledge/` | Learned patterns and rules (see INDEX.md) |
  ```
