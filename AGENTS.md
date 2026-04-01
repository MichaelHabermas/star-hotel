# AGENTS

## Learned User Preferences

- For planning and implementation work, align with SOLID principles, modular layout, and DRY; use Cursor Task subagents with complementary roles when building multi-phase work (per [docs/PRD.md](docs/PRD.md)).
- On multi-phase architecture or rollout work, run `pnpm cleanup` before committing and fix failures so the branch stays green (script lives in `package.json`).

## Learned Workspace Facts

- The star-hotel project modernizes a legacy VB6 + Access hotel app into a desktop Electron app with React + Vite + Tailwind v4 + shadcn, Express in the main process, SQLite via better-sqlite3 in WAL mode, Zod at boundaries, and typed preload IPC (`contextIsolation`, no `nodeIntegration`); the renderer does not use raw SQL or direct Node.
- Course requirements are anchored in `docs/VB6-Hotel-App-Modernization-Project-specs.md`; `docs/PRD.md`, `docs/DECISIONS.md`, `docs/PRE-SEARCH.md`, `docs/ROUTE-MAP.md`, `CLAUDE.md`, and design docs under `docs/` split planning, decisions, and design sequencing; resolve conflicts in favor of the course spec over the design doc where they diverge.
- `docs/PRD.md` includes Epic E1.5 for dev-only visual design exploration and A/B before locking tokens for MVP UI work; it can run in parallel with E2 and E4 after E1, with coordination when shared CSS or token files change.
- In dev (`pnpm dev`), the E1 shell includes the Home route (embedded API health and IPC smoke actions) and a dev-only Dev error test route for US1.3 / global error boundary smoke.
