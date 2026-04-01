# Server (Epics E2–E3)

Express runs in the Electron **main** process. The `server` layer stays separate from `renderer/` (UI) and `shared/` (Zod types and DTOs).

**Epic E2:** SQLite via `better-sqlite3` (`src/server/db/`), migrations, `PersistencePort` + [`sqlite-persistence.ts`](persistence/sqlite-persistence.ts). Constraint mapping: [`db-errors.ts`](db/db-errors.ts).

**Epic E3:** REST on loopback — [`create-app.ts`](create-app.ts) (`/health`, OpenAPI at `/api/openapi.json`, Swagger UI at `/api/docs`). Resources: [`reservations/`](reservations/), read-only [`guests/`](guests/) and [`rooms/`](rooms/) for MVP pickers; shared Zod in [`src/shared/schemas/`](../shared/schemas/). Traceability: [docs/E3-BACKEND-API.md](../../docs/E3-BACKEND-API.md).
