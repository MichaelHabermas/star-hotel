# Legacy → modern parity matrix (Epic E8)

Authoritative legacy references: [PRE-SEARCH.md](./PRE-SEARCH.md), [ROUTE-MAP.md](./ROUTE-MAP.md), [DECISIONS.md](./DECISIONS.md) (T2, T4, T5).

| Legacy (VB6 / Access) | Modern (React route / API) | Parity notes |
| ---------------------- | ---------------------------- | -------------- |
| `frmLogin` / `tbl_user` | `/login`, `POST /api/auth/login`, Argon2 verification | Passwords verified with Argon2 only (no legacy plaintext); default operator `admin` / `changeme` seeded on empty DB per T4 clean install ([seed-default-user](../src/server/dev/seed-default-user.ts)). Session exposes **username + role** in the shell after login. |
| `frmDashboard` / main room board | `/` (Room Board), shell nav | Main room board with selectable rooms, status summary, and direct desk actions. Verify final action model against legacy dashboard before claiming full parity. |
| `frmBooking` / check-in workflow | `/reservations`, `/reservations/new`, `/reservations/:id` | Booking ledger + check-in workspace; totals via [reservation-pricing](../src/domain/reservation-pricing.ts); overlap via half-open ranges in [reservation-repository](../src/server/reservations/reservation-repository.ts). |
| `frmRoomMaintain` | `/rooms`, `/rooms/new`, `/rooms/:id` | Maintenance ledger + room card; CRUD + status; delete blocked when reservations reference room (`ROOM_IN_USE`). |
| `frmFindCustomer` / guest maintenance | `/guests`, `/guests/new`, `/guests/:id` | Customer lookup ledger + guest card; delete blocked when reservations reference guest (`GUEST_IN_USE`). |
| Crystal reports | `/reports/folio/:reservationId`, `/reports/day-sheet` | Minimum scope per [DECISIONS T5](./DECISIONS.md#t5--report-scope-contract-e9); parity note [E9-REPORTS-PARITY.md](./E9-REPORTS-PARITY.md). |

Update this table when legacy filenames are confirmed against the bundled VB6 tree or when scope changes.
