# Star Hotel

Desktop remake of the legacy VB6 + Microsoft Access hotel reservation system. The product goal is **functional parity with the legacy operator workflow** (room board, booking, customer find, room maintenance) while keeping a modern stack and stronger validation—see [docs/2026-04-03-vb6-parity-recovery-plan.md](docs/2026-04-03-vb6-parity-recovery-plan.md), [docs/VB6-LEGACY-DEEP-DIVE.md](docs/VB6-LEGACY-DEEP-DIVE.md), and day-to-day intent in [docs/OPERATOR-HANDBOOK.md](docs/OPERATOR-HANDBOOK.md).

**Epics E0–E9** (through reports) are implemented; **E10** (packaging and course submission) is documented below and in [docs/PRD.md](docs/PRD.md). Stack: Electron + Vite + React 19 + Tailwind CSS v4 + shadcn/ui, strict TypeScript, Vitest, ESLint, and Prettier.

Authoritative requirements: [docs/PRD.md](docs/PRD.md). Manual parity checks: [docs/MANUAL-QA-VB6-PARITY.md](docs/MANUAL-QA-VB6-PARITY.md).

## Prerequisites

- **Node.js** ≥ 20 (see [.nvmrc](.nvmrc) for the team default)
- **pnpm** (recommended: `corepack enable` then use the repo’s `package.json` packageManager if set)

## Commands

| Command                  | Description                                                                    |
| ------------------------ | ------------------------------------------------------------------------------ |
| `pnpm install`           | Install dependencies                                                           |
| `pnpm dev`               | Electron + Vite dev (HMR in renderer)                                          |
| `pnpm build`             | Production build to `out/`                                                     |
| `pnpm preview`           | Preview production build                                                       |
| `pnpm dist`              | `pnpm build` + Electron Builder installer(s) for current OS → `release/`       |
| `pnpm dist:dir`          | Unpacked app only (quick packaging sanity check) → `release/`                  |
| `pnpm dist:linux`        | Linux portable zip (CI)                                                        |
| `pnpm dist:mac`          | macOS DMG + zip                                                                |
| `pnpm dist:win`          | Windows NSIS x64 installer                                                     |
| `pnpm test`              | Vitest (unit + RTL)                                                            |
| `pnpm lint`              | ESLint                                                                         |
| `pnpm format`            | Prettier write                                                                 |
| `pnpm format:check`      | Prettier check only                                                            |
| `pnpm typecheck`         | `tsc --noEmit` for main/preload + renderer                                     |
| `pnpm cleanup`           | Format + lint fix + typecheck (pre-commit / ship)                              |
| `pnpm codegen:api`       | Regenerate OpenAPI JSON + `openapi-types.ts` after changing embedded API paths |
| `pnpm codegen:api:check` | Same as `codegen:api`, then fails if generated files drift (CI)                |

Single test file: `pnpm test -- src/renderer/src/lib/utils.test.ts`

CI (GitHub Actions): on push/PR to `main`, runs `format:check`, `lint`, `typecheck`, `test`, `build`, then **packaging smoke** (Linux zip + Windows NSIS artifacts) — see [.github/workflows/ci.yml](.github/workflows/ci.yml) and [docs/PACKAGING.md](docs/PACKAGING.md) (T6).

## Project layout (modular boundaries)

| Path            | Role                                                                             |
| --------------- | -------------------------------------------------------------------------------- |
| `src/main/`     | Electron main process (window lifecycle, security defaults)                      |
| `src/preload/`  | Typed `contextBridge` IPC (renderer has no Node integration)                     |
| `src/renderer/` | React UI only — no Node, no SQLite                                               |
| `src/shared/`   | Cross-layer types (Zod DTOs land here in later epics)                            |
| `src/server/`   | Express in main + SQLite data layer (Epics E2–E3) — see README there             |
| `style-test/`   | Static HTML/CSS prototypes for visual A/B (Epic E1.5)                            |
| `docs/`         | Specs, parity, packaging, architecture — [Key documentation](#key-documentation) |
| `release/`      | Electron Builder output (installers; gitignored)                                 |
| `knowledge/`    | Learned patterns and rules ([INDEX.md](knowledge/INDEX.md))                      |

### Key documentation

- **Requirements & decisions:** [PRD](docs/PRD.md), [DECISIONS](docs/DECISIONS.md), [STYLE-GUIDE](docs/STYLE-GUIDE.md)
- **VB6 parity:** [recovery plan](docs/2026-04-03-vb6-parity-recovery-plan.md), [legacy deep dive](docs/VB6-LEGACY-DEEP-DIVE.md), [manual QA](docs/MANUAL-QA-VB6-PARITY.md), [PARITY-MATRIX](docs/PARITY-MATRIX.md), [VB6-PARITY-MATRIX](docs/VB6-PARITY-MATRIX.md), [ROUTE-MAP](docs/ROUTE-MAP.md)
- **Operators:** [OPERATOR-HANDBOOK](docs/OPERATOR-HANDBOOK.md) (workflows under `docs/workflows/`)
- **Shipping:** reports parity [E9-REPORTS-PARITY](docs/E9-REPORTS-PARITY.md), UI states [T1-STATE-MATRIX](docs/T1-STATE-MATRIX.md), [PACKAGING](docs/PACKAGING.md), [ARCHITECTURE-SUBMISSION](docs/ARCHITECTURE-SUBMISSION.md)

Performance notes (cold start methodology): [docs/PERF.md](docs/PERF.md).

## Observability (Epic E7)

Telemetry is **env-gated** (see [.env.example](.env.example)). **T7 PII policy:** [docs/T7-TELEMETRY-PII.md](docs/T7-TELEMETRY-PII.md).

| Topic                                | Doc / location                                                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Structured logging (Express + main)  | `STAR_HOTEL_LOG_LEVEL`; JSON access lines — [T7 sample](docs/T7-TELEMETRY-PII.md#sample-structured-log-line-express-access)               |
| Sentry (main + renderer)             | `SENTRY_DSN`, `VITE_SENTRY_DSN`; source maps — [docs/SENTRY-SOURCE-MAPS.md](docs/SENTRY-SOURCE-MAPS.md)                                   |
| PostHog                              | `VITE_POSTHOG_KEY`, optional `VITE_POSTHOG_HOST`                                                                                          |
| Crashpad                             | [docs/CRASH-REPORTING.md](docs/CRASH-REPORTING.md), optional `SENTRY_MINIDUMP_URL`                                                        |
| Perf smoke (IPC / HTTP / list query) | **Dev only** (`import.meta.env.DEV`): Room Board (`/`) → **Developer experience** → perf probes; methodology [docs/PERF.md](docs/PERF.md) |

## Embedded Express API (Epic E3)

The main process runs an HTTP server on **loopback only** (`127.0.0.1`), not on the LAN.

**PRD traceability matrix:** [docs/E3-BACKEND-API.md](docs/E3-BACKEND-API.md).

| Topic                   | Detail                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Default port**        | `45123` — see [`src/shared/constants.ts`](src/shared/constants.ts).                                                                                                                                                                                                                                                             |
| **Override**            | Set **`STAR_HOTEL_PORT`** to an integer in `1`–`65535`. Invalid or missing values fall back to the default ([`resolveApiPortFromEnv`](src/shared/embedded-api-config.ts)).                                                                                                                                                      |
| **Renderer base URL**   | Preload/renderer may receive **`--star-hotel-api-base=http://127.0.0.1:<port>`** (see [`API_BASE_ARG_PREFIX`](src/shared/embedded-api-config.ts)); otherwise the port env + [`buildApiBaseUrl`](src/shared/embedded-api-config.ts) apply.                                                                                       |
| **Port already in use** | `listen` fails with **`EADDRINUSE`**. The app does **not** auto-pick another port; free the port or change `STAR_HOTEL_PORT`.                                                                                                                                                                                                   |
| **Startup order**       | After Electron **`app.whenReady()`**, main calls [`ensureEmbeddedApiAndIpc`](src/main/embedded-api-stack.ts) so `/health`, `/api/*`, and IPC handlers exist before the first window loads ([`bootstrap.ts`](src/main/bootstrap.ts)).                                                                                            |
| **Shutdown order**      | On **`before-quit`**, main closes the HTTP server (drain `server.close`) then calls [`persistence.close()`](src/main/embedded-api-stack.ts) so SQLite is not left busy while the port is still bound.                                                                                                                           |
| **Health**              | `GET /health` returns `{ "ok": true }` after SQLite migrations complete.                                                                                                                                                                                                                                                        |
| **Auth (E8)**           | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` — Bearer session tokens; Vitest sets `STAR_HOTEL_SKIP_AUTH=1` so server tests skip auth. Default operator: `admin` / `changeme` (see [seed-default-user](src/server/dev/seed-default-user.ts)).                                                             |
| **OpenAPI / Swagger**   | `GET /api/openapi.json` — machine-readable spec. **`GET /api/docs`** — Swagger UI (try requests against the embedded API on loopback only).                                                                                                                                                                                     |
| **Spec & client types** | Canonical description is [`starHotelOpenApiDocument`](src/server/openapi/openapi-spec.ts). After editing it, run **`pnpm codegen:api`** to refresh [`openapi-spec.json`](src/server/openapi/openapi-spec.json) and generated [`openapi-types.ts`](src/shared/api/generated/openapi-types.ts) (used by `openapi-fetch` clients). |
| **Reservations (MVP)**  | `GET/POST /api/reservations`, `GET/PATCH/DELETE /api/reservations/:id` — Zod-validated JSON; totals follow [`src/domain/reservation-pricing.ts`](src/domain/reservation-pricing.ts) (legacy `DateDiff` × nightly rate).                                                                                                         |
| **Guests & rooms**      | Full CRUD: `GET/POST /api/guests`, `GET/PATCH/DELETE /api/guests/:id`, `GET/POST /api/rooms`, `GET/PATCH/DELETE /api/rooms/:id` (Zod on bodies; delete blocked when reservations reference the row).                                                                                                                            |

## SQLite database (Epic E2)

- **Location:** The app opens `database.sqlite` under Electron **`userData`** (see [`resolveDatabaseFilePath`](src/server/db/database-path.ts)). Standalone install per machine; shared network DB paths are deferred (see [docs/DECISIONS.md](docs/DECISIONS.md) T4).
- **Native module:** `better-sqlite3` runs **only in the main process**; the renderer has no SQLite access. `pnpm` must be allowed to run this package’s install script (see `package.json` → `pnpm.onlyBuiltDependencies`).
- **Electron vs Node ABI:** The addon is compiled for **Electron’s** Node when you run `pnpm install` / `pnpm dev` / `pnpm build` / `pnpm preview` (`electron-rebuild` runs automatically). For **Vitest** (`pnpm test`), the script rebuilds `better-sqlite3` for your **system** Node first so `pnpm test` and `pnpm dev` do not fight the same binary. If you see `NODE_MODULE_VERSION` / `ERR_DLOPEN_FAILED`, run `pnpm rebuild:native` before Electron, or `pnpm test` only before Node-only work.
- **Dev vs production build:** `electron-vite` externalizes `better-sqlite3` so Node loads the native addon from `node_modules` at runtime. `pnpm build` must succeed on your OS; if a packaged installer fails to load the addon, ensure native modules are unpacked from the ASAR (Epic E10 / Electron Builder configuration).
- **Migrations:** Forward-only migrations live in [`src/server/db/run-migrations.ts`](src/server/db/run-migrations.ts); WAL and foreign keys are enabled when the DB opens.
- **Legacy `.mdb` import:** Not in MVP scope — [docs/DECISIONS.md](docs/DECISIONS.md) (T4) clean install + seeds; optional import is post-MVP if scheduled.

## Reports (Epic E9)

Guest **folio / receipt** and **day sheet** (operational summary) are implemented per [DECISIONS.md](docs/DECISIONS.md) **T5**: Express-backed JSON, print-friendly React views, no SQL in the renderer. Scope and parity sign-off: [docs/E9-REPORTS-PARITY.md](docs/E9-REPORTS-PARITY.md). API: `GET /api/reports/folio`, `GET /api/reports/day-sheet` (see OpenAPI/Swagger in [Embedded Express API](#embedded-express-api-epic-e3)).

## Visual design (Epic E1.5)

**Canonical UI rules:** [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md) (Lakeside Console light / Night Audit dark). **Decision index:** [docs/DESIGN-DIRECTION.md](docs/DESIGN-DIRECTION.md), [docs/DECISIONS.md](docs/DECISIONS.md#e15-visual-design-and-style-lab-scope).

**Static style lab** (not in the Electron bundle): open [`style-test/index.html`](style-test/index.html) in a browser (double-click or “Open with…” from the repo). Links to the two variants and the style guide. No `pnpm dev` required.

## Packaging and installers (Epic E10)

- **Produce installers:** `pnpm dist` (current OS), or `pnpm dist:linux` / `pnpm dist:mac` / `pnpm dist:win`. Output lives under **`release/`** (gitignored).
- **Native modules:** `better-sqlite3` and `argon2` are rebuilt for Electron during packaging. If a **packaged** app fails to load natives, see [docs/PACKAGING.md](docs/PACKAGING.md) and `pnpm rebuild:native` for dev workflows.
- **CI:** After the standard check job, workflows build **Linux zip** and **Windows NSIS** packages and upload them as artifacts (see [docs/PACKAGING.md](docs/PACKAGING.md) for the T6 “green” definition).

## Course submission bundle (Epic E10)

| Artifact                                           | Location                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| Architecture write-up (print to PDF from Markdown) | [docs/ARCHITECTURE-SUBMISSION.md](docs/ARCHITECTURE-SUBMISSION.md) |
| Demo video (script + hosting checklist)            | [docs/DEMO-VIDEO.md](docs/DEMO-VIDEO.md)                           |
| Migration ROI                                      | [docs/ROI-REPORT.md](docs/ROI-REPORT.md)                           |
| OSS / contribution note                            | [docs/OSS-CONTRIBUTION.md](docs/OSS-CONTRIBUTION.md)               |
| Social post draft                                  | [docs/SOCIAL-POST-DRAFT.md](docs/SOCIAL-POST-DRAFT.md)             |
| Public repo checklist                              | [docs/PUBLIC-GITHUB-CHECKLIST.md](docs/PUBLIC-GITHUB-CHECKLIST.md) |

Replace placeholder links (e.g. demo video URL) in those docs when you publish.

## Dev-only error boundary check

With `pnpm dev`, open **Dev error test** in the nav (or hash route `#/dev/error-test`). The global error boundary should show an accessible fallback; the Electron shell stays running.

## Subagent runbook (Epic E1)

When scaling work across agents, use narrow Task prompts in order: **explore (readonly)** → **shell/tooling** → **lint/format** → **UI (Tailwind + shadcn)** → **architecture (boundary + router)** → **code-simplifier (DRY)** — see [docs/PRD.md](docs/PRD.md) § “Subagent / complementary roles”.
