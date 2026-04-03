# Manual QA — VB6 parity (branch)

Use after `pnpm dev` with seeded data (default dev user). Log issues against `docs/VB6-PARITY-MATRIX.md`.

## Shell

- [ ] Header shows live **date/time** and **User ID / role** line.
- [ ] **Header** shows one nav row with keyboard hints; each link matches its route (no duplicate toolbar row).
- [ ] **Keyboard:** outside text fields, Esc → `/`; F1 → `/reservations`; F2 → `/reports`; F3 → `/guests`; F4 → `/rooms`; F5 → `/admin/users` (Admin only); F6 → `/admin/module-access` (Admin only); F8 → `/account/password`. Non-admin: F5/F6 do nothing.

## Dashboard (`/`)

- [ ] Four **Level** rows (4→1), **11** columns each on seeded data.
- [ ] **Summary** strip lists five statuses with **counts** that match the legend.
- [ ] Cell shows **room number**, **room type**, and **fill** by status.

## Core flows

- [ ] **Guest find:** `/guests` — filter box narrows by name, contact, or ID reference.
- [ ] **Rooms:** create/edit includes **room number** and five **statuses**.
- [ ] **Reports:** `/reports` hub links to day sheet; folio reachable from reservations.
- [ ] **Admin (role Admin):** `/admin/users` — list + create user; `/admin/module-access` — link to per-user access; `/admin/users/:id/access` — toggles persist.
- [ ] **Password:** `/account/password` — change password succeeds with valid current password.

## API / smoke

- [ ] Login returns **moduleKeys**; `/api/auth/me` returns **user** + **moduleKeys**.
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm codegen:api:check` (if API touched) pass locally.

---

## Optional: Access `.mdb` continuity (Phase 4)

If product requires importing from legacy Access: see [DECISIONS.md](./DECISIONS.md) **T4** and [TODOS.md](./TODOS.md) **T3** — implement operator-triggered import + golden diff on a branch; not required for UI parity alone.
