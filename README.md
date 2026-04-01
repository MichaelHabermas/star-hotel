# Star Hotel

Modernized desktop replacement for the legacy VB6 + Microsoft Access hotel reservation system. **Epic E1** (scaffold) is complete in [docs/PRD.md](docs/PRD.md): Electron + Vite + React 19 + Tailwind CSS v4 + shadcn/ui, strict TypeScript, Vitest, ESLint, and Prettier.

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

| Path            | Role                                                        |
| --------------- | ----------------------------------------------------------- |
| `src/main/`     | Electron main process (window lifecycle, security defaults) |
| `src/preload/`  | `contextBridge` surface (minimal until Epic E4)             |
| `src/renderer/` | React UI only — no Node, no SQLite                          |
| `src/shared/`   | Cross-layer types (Zod DTOs land here in later epics)       |
| `src/server/`   | Reserved for Express in main (Epic E3) — see README there   |

Performance notes (cold start methodology): [docs/PERF.md](docs/PERF.md).

## Dev-only error boundary check

With `pnpm dev`, open **Dev error test** in the nav (or hash route `#/dev/error-test`). The global error boundary should show an accessible fallback; the Electron shell stays running.

## Subagent runbook (Epic E1)

When scaling work across agents, use narrow Task prompts in order: **explore (readonly)** → **shell/tooling** → **lint/format** → **UI (Tailwind + shadcn)** → **architecture (boundary + router)** → **code-simplifier (DRY)** — see [docs/PRD.md](docs/PRD.md) § “Subagent / complementary roles”.
