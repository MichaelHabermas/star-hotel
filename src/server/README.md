# Server (Epics E2–E3)

Express runs in the Electron **main** process. The `server` layer stays separate from `renderer/` (UI) and `shared/` (Zod types and DTOs).

**Epic E2:** SQLite via `better-sqlite3` (`src/server/db/`), migrations, `PersistencePort` + [`sqlite-persistence.ts`](persistence/sqlite-persistence.ts). Constraint mapping: [`db-errors.ts`](db/db-errors.ts).

**Epic E3:** REST routes and domain services (in progress).
