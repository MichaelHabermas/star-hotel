# Legacy → modern parity matrix (Epic E8)

Authoritative legacy references: [PRE-SEARCH.md](./PRE-SEARCH.md), [ROUTE-MAP.md](./ROUTE-MAP.md), [DECISIONS.md](./DECISIONS.md) (T2, T4, T5).

| Legacy (VB6 / Access) | Modern (React route / API) | Parity notes |
|----------------------|----------------------------|--------------|
| `frmLogin` / `tbl_user` | `/login`, `POST /api/auth/login`, Argon2 verification | Default operator `admin` / `changeme` seeded on empty DB ([seed-default-user](../src/server/dev/seed-default-user.ts)); change password flow deferred. |
| Main / hub menu | `/` (Operations hub), shell nav | Reservations, Rooms, Guests linked; Reports placeholder until E9. |
| Reservation / check-in workflow | `/reservations`, `/reservations/new`, `/reservations/:id` | Full CRUD; totals via [reservation-pricing](../src/domain/reservation-pricing.ts); overlap via half-open ranges in [reservation-repository](../src/server/reservations/reservation-repository.ts). |
| Rooms | `/rooms`, `/rooms/new`, `/rooms/:id` | CRUD + status; delete blocked when reservations reference room (`ROOM_IN_USE`). |
| Guests | `/guests`, `/guests/new`, `/guests/:id` | CRUD; delete blocked when reservations reference guest (`GUEST_IN_USE`). |
| Crystal reports | E9 — `/reports` (planned) | Minimum scope per [DECISIONS T5](./DECISIONS.md#t5--report-scope-contract-e9). |

Update this table when legacy filenames are confirmed against the bundled VB6 tree or when scope changes.
