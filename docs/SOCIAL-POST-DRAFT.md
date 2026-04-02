# Social post draft (one technical hurdle)

**Platform:** LinkedIn / X / Mastodon — pick one voice; keep under common character limits if posting verbatim.

---

**Draft (edit names and metrics):**

Shipped a desktop hotel PMS rewrite: VB6 + Access → **Electron + React + SQLite (WAL)**. The hurdle that kept me honest: **native addons** (`better-sqlite3`, `argon2`) must match **Electron’s Node ABI**, not system Node—`electron-rebuild` in dev, Electron Builder’s rebuild in the installer, and Vitest temporarily rebuilding for Node tests. Once IPC + Express-in-main + Zod boundaries were in place, CRUD and reports felt boring—in a good way. #electron #typescript #sqlite

---

**Shorter alt:**

Electron + SQLite in production means respecting **two** ABIs: dev uses `electron-rebuild`, CI tests use Node’s rebuild, installers use Electron Builder. Worth the glue for a sandboxed UI and typed API.
