# AGENTS

## Learned User Preferences

- For planning and implementation work, align with SOLID principles, modular layout, and DRY; use Cursor Task subagents with complementary roles when building multi-phase work (per [docs/PRD.md](docs/PRD.md)).
- On multi-phase architecture or rollout work, run `pnpm cleanup` before committing and fix failures so the branch stays green (script lives in `package.json`).

## Learned Workspace Facts

- Learned engineering patterns and cross-cutting facts live in `knowledge/` (see `knowledge/INDEX.md`). Authoritative product specs and decisions stay in `docs/`.
- The star-hotel project modernizes a legacy VB6 + Access hotel app into a desktop Electron app with React + Vite + Tailwind v4 + shadcn, Express in the main process, SQLite via better-sqlite3 in WAL mode, Zod at boundaries, and typed preload IPC (`contextIsolation`, no `nodeIntegration`); the renderer does not use raw SQL or direct Node.
- Course requirements are anchored in `docs/VB6-Hotel-App-Modernization-Project-specs.md`; `docs/PRD.md`, `docs/DECISIONS.md`, `docs/PRE-SEARCH.md`, `docs/ROUTE-MAP.md`, `CLAUDE.md`, and design docs under `docs/` split planning, decisions, and design sequencing; resolve conflicts in favor of the course spec over the design doc where they diverge.
- Epic E1.5 is **complete**: visual direction is locked in `docs/STYLE-GUIDE.md` and `docs/DECISIONS.md` (E1.5); static prototypes live in `style-test/` (no in-app React lab). E2 and E4 can proceed; coordinate on shared CSS/tokens per PRD.
- In dev (`pnpm dev`), the E1 shell includes the Home route (embedded API health and IPC smoke actions) and a dev-only Dev error test route for US1.3 / global error boundary smoke.
- If Electron main fails to load `better-sqlite3` with a NODE_MODULE_VERSION / ABI mismatch, rerun `pnpm rebuild:native` or `pnpm install` (postinstall runs `electron-rebuild` for that module) before treating it as an application bug.
- Static HTML under `style-test/` may be checked by HTML validation tooling (DOCTYPE style, void elements); when editing those files, keep markup aligned with those rules rather than toggling patterns that re-trigger the same diagnostics.
- `.cursor/hooks/state/` is gitignored (Cursor hook / continual-learning machine state); keep it local—do not commit—while still writing `continual-learning-index.json` there when running the incremental transcript index flow so local hooks work.
- The embedded Express API serves OpenAPI at `{apiBaseUrl}/api/openapi.json` and Swagger UI at `{apiBaseUrl}/api/docs` (loopback only); `pnpm dev` logs the Swagger URL next to the API base line in main (`bootstrap.ts`).
- `.pnpm-store/` (project-local pnpm store), `.idea/` (JetBrains), and `release/` (electron-builder output) belong in `.gitignore` and should not be committed—same class of artifact as `node_modules`.

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
