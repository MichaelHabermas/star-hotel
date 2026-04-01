# Star Hotel

Modernized desktop replacement for the legacy VB6 + Microsoft Access hotel reservation system. **Epics E0–E1** (scaffold), **E1.5** (visual direction locked in [STYLE-GUIDE.md](docs/STYLE-GUIDE.md); static lab in [style-test/](style-test/)), and **E2** (SQLite + WAL + migrations in main) are reflected in [docs/PRD.md](docs/PRD.md): Electron + Vite + React 19 + Tailwind CSS v4 + shadcn/ui, strict TypeScript, Vitest, ESLint, and Prettier.

Authoritative requirements: [docs/PRD.md](docs/PRD.md).

## Prerequisites

- **Node.js** ≥ 20 (see [.nvmrc](.nvmrc) for the team default)
- **pnpm** (recommended: `corepack enable` then use the repo’s `package.json` packageManager if set)

## Commands

| Command             | Description                                |
| ------------------- | ------------------------------------------ |
| `pnpm install`      | Install dependencies                       |
| `pnpm dev`          | Electron + Vite dev (HMR in renderer)      |
| `pnpm build`        | Production build to `out/`                 |
| `pnpm preview`      | Preview production build                   |
| `pnpm test`         | Vitest (unit + RTL)                        |
| `pnpm lint`         | ESLint                                     |
| `pnpm format`       | Prettier write                             |
| `pnpm format:check` | Prettier check only                        |
| `pnpm typecheck`    | `tsc --noEmit` for main/preload + renderer |

Single test file: `pnpm test -- src/renderer/src/lib/utils.test.ts`

CI (GitHub Actions): on push/PR to `main`, runs `format:check`, `lint`, `typecheck`, `test`, and `build` — see [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Project layout (modular boundaries)

| Path            | Role                                                                 |
| --------------- | -------------------------------------------------------------------- |
| `src/main/`     | Electron main process (window lifecycle, security defaults)          |
| `src/preload/`  | `contextBridge` surface (minimal until Epic E4)                      |
| `src/renderer/` | React UI only — no Node, no SQLite                                   |
| `src/shared/`   | Cross-layer types (Zod DTOs land here in later epics)                |
| `src/server/`   | Express in main + SQLite data layer (Epics E2–E3) — see README there |
| `style-test/`   | Static HTML/CSS prototypes for visual A/B (Epic E1.5)                |
| `docs/`         | PRD, decisions, STYLE-GUIDE, DESIGN-DIRECTION                        |
| `knowledge/`    | Learned patterns and rules ([INDEX.md](knowledge/INDEX.md))          |

Performance notes (cold start methodology): [docs/PERF.md](docs/PERF.md).

## SQLite database (Epic E2)

- **Location:** The app opens `database.sqlite` under Electron **`userData`** (see [`resolveDatabaseFilePath`](src/server/db/database-path.ts)). Standalone install per machine; shared network DB paths are deferred (see [docs/DECISIONS.md](docs/DECISIONS.md) T4).
- **Native module:** `better-sqlite3` runs **only in the main process**; the renderer has no SQLite access. `pnpm` must be allowed to run this package’s install script (see `package.json` → `pnpm.onlyBuiltDependencies`).
- **Electron vs Node ABI:** The addon is compiled for **Electron’s** Node when you run `pnpm install` / `pnpm dev` / `pnpm build` / `pnpm preview` (`electron-rebuild` runs automatically). For **Vitest** (`pnpm test`), the script rebuilds `better-sqlite3` for your **system** Node first so `pnpm test` and `pnpm dev` do not fight the same binary. If you see `NODE_MODULE_VERSION` / `ERR_DLOPEN_FAILED`, run `pnpm rebuild:native` before Electron, or `pnpm test` only before Node-only work.
- **Dev vs production build:** `electron-vite` externalizes `better-sqlite3` so Node loads the native addon from `node_modules` at runtime. `pnpm build` must succeed on your OS; if a packaged installer fails to load the addon, ensure native modules are unpacked from the ASAR (Epic E10 / Electron Builder configuration).
- **Migrations:** Forward-only migrations live in [`src/server/db/run-migrations.ts`](src/server/db/run-migrations.ts); WAL and foreign keys are enabled when the DB opens.
- **Legacy `.mdb` import:** Not in MVP scope — [docs/DECISIONS.md](docs/DECISIONS.md) (T4) clean install + seeds; optional import is post-MVP if scheduled.

## Visual design (Epic E1.5)

**Canonical UI rules:** [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md) (Lakeside Console light / Night Audit dark). **Decision index:** [docs/DESIGN-DIRECTION.md](docs/DESIGN-DIRECTION.md), [docs/DECISIONS.md](docs/DECISIONS.md#e15-visual-design-and-style-lab-scope).

**Static style lab** (not in the Electron bundle): open [`style-test/index.html`](style-test/index.html) in a browser (double-click or “Open with…” from the repo). Links to the two variants and the style guide. No `pnpm dev` required.

## Dev-only error boundary check

With `pnpm dev`, open **Dev error test** in the nav (or hash route `#/dev/error-test`). The global error boundary should show an accessible fallback; the Electron shell stays running.

## Subagent runbook (Epic E1)

When scaling work across agents, use narrow Task prompts in order: **explore (readonly)** → **shell/tooling** → **lint/format** → **UI (Tailwind + shadcn)** → **architecture (boundary + router)** → **code-simplifier (DRY)** — see [docs/PRD.md](docs/PRD.md) § “Subagent / complementary roles”.
