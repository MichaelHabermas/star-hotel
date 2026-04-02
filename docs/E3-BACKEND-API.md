# Epic E3 — Backend API traceability (PRD matrix)

Authoritative epic text: [PRD.md § Epic E3](./PRD.md). This matrix maps PRD user stories and tasks to implementation for sign-off.

| PRD item | Requirement | Implementation |
| ---------- | --------------- | ---------------- |
| **US3.1** | Server bootstrap in main; lifecycle tied to app ready/quit | [`startStarHotelMain`](../src/main/bootstrap.ts) awaits `ensureEmbeddedApiAndIpc()` after `whenReady` (Express + SQLite + IPC); quit on listen failure. Shutdown: [`createEmbeddedApiStack`](../src/main/embedded-api-stack.ts) `before-quit` closes HTTP server then SQLite. |
| **T3.1.1.1** | Port selection / conflict handling documented | [README § Embedded Express API](../README.md#embedded-express-api-epic-e3): `STAR_HOTEL_PORT`, `--star-hotel-api-base=`, `EADDRINUSE` (no auto port bump). |
| **US3.1 DoD** | Health returns 200 | [`GET /health`](../src/server/create-app.ts) after `persistence.isReady()`. |
| **US3.2** | MVP REST CRUD; stable 4xx/5xx JSON | [`/api/reservations`](../src/server/reservations/reservation-router.ts); [`mapErrorToHttp`](../src/server/http/json-error.ts) + [`mapUnknownErrorToHttpPayload`](../src/server/http/map-error-to-http-payload.ts). Integration: [`create-app.reservations.test.ts`](../src/server/create-app.reservations.test.ts). |
| **US3.2** | Supporting resources for reservation UI (E5 pickers) | `GET /api/guests`, `GET /api/guests/:id`, `GET /api/rooms`, `GET /api/rooms/:id` — see [`src/server/guests/`](../src/server/guests/), [`src/server/rooms/`](../src/server/rooms/). |
| **US3.3** | Domain pricing in testable pure functions; not copy-paste in routes | [`src/domain/reservation-pricing.ts`](../src/domain/reservation-pricing.ts); used by [`ReservationService`](../src/server/reservations/reservation-service.ts). Tests: [`reservation-pricing.test.ts`](../src/domain/reservation-pricing.test.ts). |
| **US3.3** | Transactional overlap + write | [`ReservationRepository.insertWithNoOverlap` / `updateWithNoOverlap`](../src/server/reservations/reservation-repository.ts) (`better-sqlite3` `transaction()`). |
| **Epic DoD** | Structured logging stub | [`src/server/http/logger.ts`](../src/server/http/logger.ts) (`logApiInfo` / `logApiError`). |
| **Epic DoD** | Zod at boundary; parameterized SQL | Routers parse with Zod; repositories use `prepare()` placeholders. |
| **API exploration** | OpenAPI + Swagger UI (loopback) | [`registerOpenApiRoutes`](../src/server/openapi/register-openapi-routes.ts): `GET /api/openapi.json`, `GET /api/docs`. |

**MVP entity assumption:** Reservations are the primary MVP resource (aligned with [DECISIONS.md — T2](./DECISIONS.md)); guests and rooms are exposed read-only for FK pickers and consistency with `tbl_guest` / `tbl_room`.
