# E5 MVP form parity — legacy → React mapping (T5.1.1.1)

Traceability for **Epic E5 / US5.1 / T5.1.1.1**: links the chosen MVP slice (reservations) to planned legacy assets and the implemented UI.

**Authority:** Inventory and routes follow [PRE-SEARCH.md](./PRE-SEARCH.md), [ROUTE-MAP.md](./ROUTE-MAP.md), and [DECISIONS.md](./DECISIONS.md) (T2 — reservations / check-in first).

## Legacy source (VB6)

| Legacy surface | Typical path (repo recon) | Domain |
| ---------------- | --------------------------- | -------- |
| Check-in / reservation workflow | `Form/frmCheckIn.frm` and/or related reservation UI (exact filename may vary by legacy tree) | `tbl_reservation` (+ `tbl_guest`, `tbl_room` FKs), totals via `modLogic.bas` rules (ported to server domain services) |

## Modern implementation

| React route | Primary component(s) | shadcn / UI primitives |
| ------------- | ---------------------- | ------------------------- |
| `#/reservations` | [`ReservationsListPage`](../src/renderer/src/pages/reservations-list-page.tsx) | `Card`, `Button`, `Table` (+ **TanStack Table** `useReactTable`), `Dialog` (delete confirm) |
| `#/reservations/new` | [`ReservationFormPage`](../src/renderer/src/pages/reservation-form-page.tsx) (`mode="create"`) | `Card`, `Label`, `Input` (date), `Select` (guest, room), `Button` |
| `#/reservations/:reservationId` | [`ReservationFormPage`](../src/renderer/src/pages/reservation-form-page.tsx) (`mode="edit"`) | Same as new + `Dialog` (delete confirm) |

## Field / API alignment

| Legacy / DB concept | UI label | API / schema |
| -------------------- | -------- | -------------- |
| `GuestID` | Guest | `guestId` — [`reservationCreateBodySchema`](../src/shared/schemas/reservation.ts); options from `GET /api/guests` |
| `RoomID` | Room | `roomId` — same schema; options from `GET /api/rooms` |
| `CheckInDate` | Check-in date | `checkInDate` (ISO `YYYY-MM-DD`) |
| `CheckOutDate` | Check-out date | `checkOutDate` (ISO `YYYY-MM-DD`) |
| `TotalAmount` | Current total (read-only on edit) | Computed server-side on create/update; shown from `ReservationResponse.totalAmount` |

## Domain pricing (Epic E6 / US6.1 — legacy ↔ tests)

Pure helpers in [`src/domain/reservation-pricing.ts`](../src/domain/reservation-pricing.ts); Vitest in [`src/domain/reservation-pricing.test.ts`](../src/domain/reservation-pricing.test.ts). **Legacy anchor:** `modLogic.bas` / `DateDiff("d", CheckIn, CheckOut) * Price` per [PRE-SEARCH.md](./PRE-SEARCH.md).

| Test (Vitest) | Legacy behavior or explicit gap |
| --------------- | ----------------------------------- |
| `countStayNights` — same calendar day | **Gap:** `DateDiff("d", A, B)` is **0** when check-in and check-out are the same day; MVP uses **calendar nights** with **exclusive** check-out morning (0 nights). |
| `countStayNights` — one / two overnights | **Maps:** `DateDiff("d", …)` = paid nights for date-only fields. |
| `countStayNights` — leap day boundary | **Maps:** calendar-day arithmetic (legacy date control + `DateDiff`). |
| `countStayNights` — check-out before check-in, malformed ISO | **Maps:** invalid stays rejected (modern: explicit `InvalidIsoDateError`). |
| `computeReservationTotal` — nights × rate | **Maps:** `DateDiff * Price` product. |
| `computeReservationTotal` — half-up rounding | **Maps:** currency display consistency (legacy may differ; documented as chosen rule). |
| `computeReservationTotal` — zero nights allowed | **Maps:** same-day in/out → 0 nights × price. |
| `computeReservationTotal` — negative nights | **Maps:** invalid input rejected (`RangeError`). |
| **Partial-day / hourly charge** | **Explicit gap (MVP):** [PRE-SEARCH.md](./PRE-SEARCH.md) notes “partial days or early check-outs”; the **MVP** stack uses **date-only** ISO fields and **full-night** billing only. Hourly or fractional-day pricing is **out of scope** until explicitly specified and ported from `modLogic.bas` (post-MVP). |

## List performance (US5.2 / T5.2.1.1)

**T5.2.1.1 (pagination / virtualization):** Deferred as **N/A** for the current MVP dataset. Seeded reservations remain a small fixed set, so a single TanStack Table view without pagination keeps the DOM light and interactions within the PRD’s ≤100 ms perceived transition goal. Revisit client-side pagination or row virtualization if seed counts grow past roughly **200 rows** on the list screen or if profiling shows layout cost.

## Screenshots

Optional for evaluators: capture list + create + edit after a successful CRUD cycle in `pnpm dev`; store under `docs/assets/` if the course requires image evidence (not required for this map).
