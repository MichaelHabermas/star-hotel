# Legacy → React route map (planned)

Authoritative mapping from VB6 assets (see [PRE-SEARCH.md](./PRE-SEARCH.md)) to **planned** React routes and epics. Update when `.frm` names are confirmed against `pyhoon/star-hotel-vb6` or the bundled legacy tree.

**Decisions:** [DECISIONS.md](./DECISIONS.md).

| Legacy asset (typical path) | Purpose | Key logic / modules | Planned React route | Primary epic |
|----------------------------|---------|---------------------|---------------------|--------------|
| `Form/frmLogin.frm` (or equivalent) | Operator authentication | `tbl_user`, password upgrade (Argon2) | `/login` | E8 (US8.1) |
| `Form/frmMain.frm` | Hub / navigation shell | Menu → form dispatch | `/` (dashboard hub) | E8 (US8.2) |
| `Form/frmRoom.frm` (or `Room.frm`) | Room CRUD, status, rates | `tbl_room` | `/rooms`, `/rooms/:id` | E8 (US8.3); candidate **E5** MVP |
| `Form/frmGuest.frm` (or equivalent) | Guest CRUD | `tbl_guest` | `/guests`, `/guests/:id` | E8 (US8.4); candidate **E5** MVP |
| `Form/frmCheckIn.frm` / reservation UI | Reservations, check-in/out, totals | `tbl_reservation`, `modLogic.bas` (rate calc) | `/reservations`, `/reservations/:id` | E8 (US8.5); **preferred E5** slice per [DECISIONS T2](./DECISIONS.md) |
| `Form/frmReport.frm` + `Report/*.rpt` | Crystal reports | `P2smon.dll`, recordset-fed reports | `/reports`, `/reports/folio` (print views) | E9 (per [DECISIONS T5](./DECISIONS.md)) |
| `Module/modLogic.bas` (or similar) | Rate / date rules | Shared business rules | N/A (server **domain** services) | E3 / E6 |
| `Module/*` (DB connection, globals) | ADO/DAO access | Replace with Express + repository layer | N/A | E2 / E3 |

### E5 MVP note

Exactly **one** row becomes the MVP parity form ([PRD US5.1](./PRD.md)). Default priority is **T2** in [DECISIONS.md](./DECISIONS.md); if the team picks a different entity, update this table and DECISIONS together.

### Traceability

- Inventory source: [PRE-SEARCH §1](./PRE-SEARCH.md#1-repository-reconnaissance--structural-audit) and §4 checklist.
- Epic dependency graph: [PRD § Epic dependency](./PRD.md#epic-dependency--parallelism).
