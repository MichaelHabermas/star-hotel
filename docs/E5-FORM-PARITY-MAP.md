# E5 MVP form parity — legacy → React mapping (T5.1.1.1)

Traceability for **Epic E5 / US5.1 / T5.1.1.1**: links the chosen MVP slice (reservations) to planned legacy assets and the implemented UI.

**Authority:** Inventory and routes follow [PRE-SEARCH.md](./PRE-SEARCH.md), [ROUTE-MAP.md](./ROUTE-MAP.md), and [DECISIONS.md](./DECISIONS.md) (T2 — reservations / check-in first).

## Legacy source (VB6)

| Legacy surface | Typical path (repo recon) | Domain |
|----------------|---------------------------|--------|
| Check-in / reservation workflow | `Form/frmCheckIn.frm` and/or related reservation UI (exact filename may vary by legacy tree) | `tbl_reservation` (+ `tbl_guest`, `tbl_room` FKs), totals via `modLogic.bas` rules (ported to server domain services) |

## Modern implementation

| React route | Primary component(s) | shadcn / UI primitives |
|-------------|----------------------|-------------------------|
| `#/reservations` | [`ReservationsListPage`](../src/renderer/src/pages/reservations-list-page.tsx) | `Card`, `Button`, `Table` (+ **TanStack Table** `useReactTable`), `Dialog` (delete confirm) |
| `#/reservations/new` | [`ReservationFormPage`](../src/renderer/src/pages/reservation-form-page.tsx) (`mode="create"`) | `Card`, `Label`, `Input` (date), `Select` (guest, room), `Button` |
| `#/reservations/:reservationId` | [`ReservationFormPage`](../src/renderer/src/pages/reservation-form-page.tsx) (`mode="edit"`) | Same as new + `Dialog` (delete confirm) |

## Field / API alignment

| Legacy / DB concept | UI label | API / schema |
|--------------------|--------|--------------|
| `GuestID` | Guest | `guestId` — [`reservationCreateBodySchema`](../src/shared/schemas/reservation.ts); options from `GET /api/guests` |
| `RoomID` | Room | `roomId` — same schema; options from `GET /api/rooms` |
| `CheckInDate` | Check-in date | `checkInDate` (ISO `YYYY-MM-DD`) |
| `CheckOutDate` | Check-out date | `checkOutDate` (ISO `YYYY-MM-DD`) |
| `TotalAmount` | Current total (read-only on edit) | Computed server-side on create/update; shown from `ReservationResponse.totalAmount` |

## Screenshots

Optional for evaluators: capture list + create + edit after a successful CRUD cycle in `pnpm dev`; store under `docs/assets/` if the course requires image evidence (not required for this map).
