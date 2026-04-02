# Star Hotel — Architecture summary (submission)

**Purpose:** One–two page overview for course submission (architecture PDF). **To produce a PDF:** open this file in an editor or GitHub, print preview, and **Save as PDF** (or use VS Code / Pandoc Markdown → PDF).

## Stack

| Layer | Technology |
| ----- | ---------- |
| Desktop | Electron (main + sandboxed renderer) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Backend in main | Express 5 on loopback only (`127.0.0.1`) |
| Data | SQLite via `better-sqlite3`, WAL mode, versioned migrations |
| Validation | Zod at HTTP boundaries; shared types with OpenAPI |
| Tooling | TypeScript (strict), Vite / electron-vite, Vitest + RTL |

## Security and trust boundaries

- **Renderer:** `contextIsolation: true`, `nodeIntegration: false`. No filesystem or SQLite access from React.
- **IPC:** Preload exposes a **minimal** typed surface; renderer calls the embedded API via HTTP (`fetch` / `openapi-fetch`) using the loopback base URL from main.
- **Auth:** Session tokens after login; Argon2 password hashing for `tbl_user` (see server auth module).
- **SQL:** Parameterized queries only; no string-concatenated SQL in route handlers.

## Data flow (CRUD)

1. React component invokes the typed HTTP client or hooks.
2. Request hits Express in the main process; Zod validates body/query.
3. Domain services apply business rules (e.g. reservation pricing in `src/domain/`).
4. Repository / SQLite adapter runs transactional SQL; structured errors map to stable JSON HTTP responses.

## Observability (Epic E7)

- Sentry (main + renderer, env-gated DSN).
- PostHog for product analytics (env-gated).
- Structured logging (request id, route, duration) with PII policy in [T7-TELEMETRY-PII.md](./T7-TELEMETRY-PII.md).

## Performance (see [PERF.md](./PERF.md))

| PRD metric | Target |
| ---------- | ------ |
| Cold start (UI interactive) | ≤2000 ms |
| IPC / health RTT (dev harness) | ≤15 ms (IPC ping) |
| Critical DB ops | ≤50 ms (local WAL) |
| Primary view transition | ≤100 ms perceived |

Automated numbers are not all CI-gated; methodology and gaps are documented in `docs/PERF.md`.

## Tests (summary)

- **Vitest** for domain logic, Express integration (supertest), OpenAPI parity, IPC contracts, and key React surfaces (RTL).
- Run: `pnpm test`. CI runs the same suite on every PR (see `.github/workflows/ci.yml`).
- Representative areas: reservation pricing, overlap rules, HTTP adapters, global error boundary, report pages.

## Packaging (Epic E10)

- **electron-builder** produces installers; native addons (`better-sqlite3`, `argon2`) are rebuilt for the bundled Electron version and unpacked from ASAR as needed.
- CI **packaging smoke** (Linux zip, Windows NSIS) and manual smoke steps: [PACKAGING.md](./PACKAGING.md).

---

*Authoritative requirements and epic traceability: [PRD.md](./PRD.md).*
