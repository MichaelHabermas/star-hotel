# VB6 parity matrix

**Source:** [pyhoon/star-hotel-vb6](https://github.com/pyhoon/star-hotel-vb6) `Form/*.frm` (inventory below).  
**Style:** Modern UI follows [STYLE-GUIDE.md](./STYLE-GUIDE.md); **behavior** targets legacy workflows.

**Status legend:** `Done` | `Partial` | `Drifted` | `N/A` | `Deferred`

| Legacy form | Purpose (short) | Modern route / surface | Status | Notes |
|-------------|----------------|-------------------------|--------|--------|
| `frmUserLogin` | Login | `/login` | Done | Argon2 vs legacy passwords |
| `frmSplash` | Startup branding | Electron window (no separate splash yet) | Partial | Optional branded splash |
| `frmDashboard` | Main room board | `/` | Partial | Grid, legend counts, levels, and desk actions present; validate against legacy board behavior before marking Done |
| `frmBooking` | Reservations / booking | `/reservations`, `/reservations/:id` | Partial | Booking ledger + check-in workspace now grouped around desk flow; keep validating fields/order against legacy form |
| `frmFindCustomer` | Find guest | `/guests` (search) | Partial | Lookup-first customer screen and guest card present; verify whether legacy search and maintenance were combined |
| `frmRoomMaintain` | Room CRUD | `/rooms`, `/rooms/:id` | Partial | Maintenance ledger and room card now centered on status/rate workflow; still needs direct legacy control comparison |
| `frmRoomTypeMaintain` | Room type master | Documented: types via room form + `tbl_room.RoomType` | Partial | No separate table until schema expands |
| `frmReport` | Reports menu | `/reports`, `/reports/day-sheet`, folio | Partial | HTML print vs Crystal |
| `frmReportMaintain` | Report catalog | `/reports` (stub copy) | Deferred | See [DECISIONS.md](./DECISIONS.md) T5 |
| `frmPrint` | Print flow | Browser print on report pages | Partial | |
| `frmUserMaintain` | Users | `/admin/users` (Admin) | Done | |
| `frmUserChangePassword` | Password change | `/account/password` | Done | |
| `frmModuleAccess` | Per-user modules | `/admin/module-access`, `/admin/users/:userId/access` (Admin) | Done | |
| `frmAdmin` | Admin | Covered by Admin routes + users | Partial | Narrow scope |
| `frmDatabase` | DB tools | **N/A** — document SQLite backup via OS / `docs/DECISIONS.md` T4 | N/A | Not ported; operators use file backup |
| `frmDialog` | Generic dialog | N/A (shadcn Dialog) | N/A | |

## Keyboard mapping (frozen)

| Key | Legacy role | App action |
|-----|-------------|------------|
| Esc | Close / home | Navigate `/` |
| F1 | Booking | `/reservations` |
| F2 | Report | `/reports` |
| F3 | Customer | `/guests` |
| F4 | Room | `/rooms` |
| F5 | User | `/admin/users` (Admin only; hidden from non-admin UI) |
| F6 | Access | `/admin/module-access` (Admin only) |
| F7 | _(removed)_ | Was duplicate of Esc/home — dropped |
| F8 | Security | `/account/password` |

_Update this table when behavior changes._
